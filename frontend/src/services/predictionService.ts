import type { FinancialData, ExpenseData, PropertyData, TimelineData, PredictionResult, PredictionData, HomeWiseInput } from '@/types'

export interface PredictionInput {
  financial: FinancialData
  expenses: ExpenseData
  property: PropertyData
  timeline: TimelineData
}

const CITY_BASE_PRICE_PER_SQFT: Record<string, number> = {
  Mumbai: 22000,
  Delhi: 14000,
  Bangalore: 9500,
  Hyderabad: 7800,
  Pune: 7200,
  Chennai: 7000,
  Kolkata: 5800,
  Ahmedabad: 5500,
}

const CITY_GROWTH_RATE: Record<string, number> = {
  Mumbai: 0.075,
  Delhi: 0.07,
  Bangalore: 0.095,
  Hyderabad: 0.09,
  Pune: 0.085,
  Chennai: 0.07,
  Kolkata: 0.065,
  Ahmedabad: 0.08,
}

const BHK_MULTIPLIER: Record<number, number> = {
  1: 0.75,
  2: 1.0,
  3: 1.3,
  4: 1.65,
}

const TYPE_MULTIPLIER: Record<string, number> = {
  Apartment: 1.0,
  Villa: 1.6,
  'Independent House': 1.35,
  'Studio Apartment': 0.7,
}

function loanEmi(principal: number, annualRate: number, tenureYears: number) {
  const r = annualRate / 12
  const n = tenureYears * 12
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function computeMockPrediction(input: PredictionInput): PredictionResult {
  const fin = input.financial
  const exp = input.expenses
  const prop = input.property
  const timeline = input.timeline

  const city = prop.city || 'Bangalore'
  const basePps = CITY_BASE_PRICE_PER_SQFT[city] ?? 9000
  const growthRate = CITY_GROWTH_RATE[city] ?? 0.08
  const bhkMult = BHK_MULTIPLIER[prop.bedrooms] ?? 1.0
  const typeMult = TYPE_MULTIPLIER[prop.propertyType] ?? 1.0

  const currentPrice = Math.round(basePps * prop.area * bhkMult * typeMult)
  const futurePrice = Math.round(currentPrice * Math.pow(1 + growthRate, timeline.years))

  const totalMonthlyExpenses = exp.rent + exp.groceries + exp.utilities + exp.transport + exp.carEmi + exp.bikeEmi + exp.loans + exp.insurance + exp.lifestyle + exp.other
  const monthlyIncome = fin.salary / 12 + fin.additionalIncome
  const monthlySavings = Math.max(0, monthlyIncome - totalMonthlyExpenses)
  const annualSavings = monthlySavings * 12

  let cumulativeSavings = fin.savings + fin.investments
  let currentSalary = fin.salary
  let affordableYear = -1

  const downPaymentRatio = 0.2
  const downPayment = Math.round(futurePrice * downPaymentRatio)
  const loanRequired = futurePrice - downPayment
  const emi = loanEmi(loanRequired, 0.085, 20)

  for (let y = 1; y <= 30; y++) {
    const monthlyEmi = loanEmi(Math.max(0, futurePrice - cumulativeSavings), 0.085, 20)
    const emiAffordable = monthlyEmi <= currentSalary / 12 * 0.4
    if (cumulativeSavings >= downPayment && emiAffordable && affordableYear === -1) {
      affordableYear = new Date().getFullYear() + y
    }
    currentSalary = currentSalary * (1 + fin.salaryGrowth / 100)
    cumulativeSavings += annualSavings * Math.pow(1 + fin.salaryGrowth / 100, y) * 0.85
    cumulativeSavings = Math.min(cumulativeSavings, cumulativeSavings * 1.05)
  }

  if (affordableYear === -1) affordableYear = new Date().getFullYear() + 20

  const yearsToAfford = affordableYear - new Date().getFullYear()

  const currentMonthlyEmi = loanEmi(loanRequired, 0.085, 20)
  const emiRatio = currentMonthlyEmi / (fin.salary / 12)
  const savingsRatio = (fin.savings + fin.investments) / downPayment
  let score = Math.round(
    (0.4 * Math.min(1, savingsRatio) + 0.4 * Math.max(0, 1 - emiRatio) + 0.2 * Math.min(1, monthlySavings / (futurePrice / 240))) * 100
  )
  score = Math.min(100, Math.max(0, score))

  const currentYear = 2026
  const startPrice2000 = Math.round(currentPrice / Math.pow(1 + growthRate, currentYear - 2000))
  const priceHistory: PredictionResult['priceHistory'] = []

  for (let y = 2000; y <= currentYear; y++) {
    const yearsSince = y - 2000
    const volatility = [1, 0.98, 1.05, 1.08, 1.1, 0.95, 1.02, 1.15, 1.12, 0.9,
      1.05, 1.18, 1.22, 1.15, 1.08, 1.12, 1.18, 1.22, 1.2, 1.15,
      1.22, 1.28, 1.18, 1.2, 1.25, 1.3, 1.28][yearsSince] ?? 1
    priceHistory.push({
      year: y,
      price: Math.round(startPrice2000 * Math.pow(1 + growthRate, yearsSince) * volatility),
      type: 'historical',
    })
  }

  const forecastEnd = currentYear + timeline.years + 2
  for (let y = currentYear + 1; y <= forecastEnd; y++) {
    priceHistory.push({
      year: y,
      price: Math.round(currentPrice * Math.pow(1 + growthRate, y - currentYear)),
      type: 'forecast',
    })
  }

  const savingsVsPrice: PredictionResult['savingsVsPrice'] = []
  let savAcc = fin.savings + fin.investments
  let salNow = fin.salary + fin.additionalIncome
  for (let y = 0; y <= timeline.years + 2; y++) {
    const year = currentYear + y
    const priceAtYear = Math.round(currentPrice * Math.pow(1 + growthRate, y))
    savingsVsPrice.push({ year, savings: Math.round(savAcc), price: priceAtYear })
    const mo = salNow / 12 - totalMonthlyExpenses
    savAcc += Math.max(0, mo) * 12 * 1.05
    salNow *= 1 + fin.salaryGrowth / 100
  }

  const recommendedMonthlySavings = Math.round((downPayment - (fin.savings + fin.investments)) / Math.max(1, yearsToAfford * 12))

  return {
    currentPrice,
    futurePrice,
    growthPercentage: Math.round(((futurePrice - currentPrice) / currentPrice) * 100),
    affordabilityScore: score,
    affordableYear,
    projectedSavings: savingsVsPrice[savingsVsPrice.length - 1]?.savings ?? Math.round(savAcc),
    loanRequired,
    monthlyLoanEmi: Math.round(emi),
    downPayment,
    recommendedMonthlySavings,
    yearsToAfford,
    priceHistory,
    savingsVsPrice,
  }
}

export function predictHomeAffordability(input: PredictionInput): PredictionResult {
  return computeMockPrediction(input)
}
