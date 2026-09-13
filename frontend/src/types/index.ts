export interface FinancialData {
  salary: number
  additionalIncome: number
  savings: number
  investments: number
  salaryGrowth: number
}

export interface ExpenseData {
  rent: number
  groceries: number
  utilities: number
  transport: number
  carEmi: number
  bikeEmi: number
  loans: number
  insurance: number
  lifestyle: number
  other: number
}

export interface PropertyData {
  city: string
  locality: string
  propertyType: string
  bedrooms: number
  area: number
  currentPrice: number
}

export interface TimelineData {
  years: number
  targetYear: number
}

export interface PredictionData {
  currentPrice: number
  futurePrice: number
  growthPercentage: number
  affordabilityScore: number
  affordableYear: number
  projectedSavings: number
  loanRequired: number
}

export interface PredictionResult extends PredictionData {
  monthlyLoanEmi: number
  downPayment: number
  recommendedMonthlySavings: number
  yearsToAfford: number
  priceHistory: { year: number; price: number; type: 'historical' | 'forecast' }[]
  savingsVsPrice: { year: number; savings: number; price: number }[]
}

export interface HomeWiseInput {
  financial: FinancialData
  expenses: ExpenseData
  property: PropertyData
  timeline: TimelineData
}

export interface AppState {
  financial: FinancialData
  expenses: ExpenseData
  property: PropertyData
  timeline: TimelineData
  prediction: PredictionData
}

