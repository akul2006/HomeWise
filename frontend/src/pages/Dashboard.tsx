import { useState, useMemo } from 'react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import type { ExpenseData, FinancialData, PropertyData, TimelineData } from '@/types'
import { predictHomeAffordability } from '@/services/predictionService'

interface Props {
  financial: FinancialData
  expenses: ExpenseData
  property: PropertyData
  timeline: TimelineData
  onReset: () => void
}

// ─── Formatters ────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}
function fmtShort(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(0)}L`
  return `₹${(n / 1000).toFixed(0)}K`
}

// ─── Shared tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px',
      padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '12px', minWidth: '170px',
    }}>
      <div style={{ fontFamily: 'Manrope', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>{label}</div>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
          <span style={{ color: p.color, fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontWeight: 700, color: '#1A1A1A', fontFamily: 'Manrope' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, score) / 100) * circ
  const color = score >= 70 ? '#2D6A4F' : score >= 45 ? '#D97706' : '#DC2626'
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={size * 0.085} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={size * 0.085} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: size * 0.22, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.12, color: '#9CA3AF', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  )
}

// ─── Affordability meter ─────────────────────────────────────────────────────
function AffordabilityMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const segments = [
    { label: 'Difficult', color: '#FCA5A5', range: [0, 33] },
    { label: 'Moderate', color: '#FDE68A', range: [33, 66] },
    { label: 'Comfortable', color: '#6EE7B7', range: [66, 100] },
  ]
  return (
    <div>
      <div style={{ position: 'relative', height: '10px', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginBottom: '8px' }}>
        <div style={{ flex: '33', background: '#FEE2E2' }} />
        <div style={{ flex: '33', background: '#FEF3C7', margin: '0 2px' }} />
        <div style={{ flex: '34', background: '#D1FAE5' }} />
        {/* Marker */}
        <div style={{
          position: 'absolute', top: '-3px', bottom: '-3px', width: '4px', borderRadius: '2px',
          background: '#1A1A1A', left: `calc(${pct}% - 2px)`,
          boxShadow: '0 0 0 2px white, 0 0 0 3px #1A1A1A',
          transition: 'left 0.8s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {segments.map(s => (
          <span key={s.label} style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'Manrope', fontWeight: 600 }}>{s.label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, badge, accent, children,
}: {
  label: string; value: string; sub?: string; badge?: string; accent?: string; children?: React.ReactNode
}) {
  return (
    <div style={{
      background: accent ?? '#FFFFFF', border: `1px solid ${accent ? 'transparent' : '#E5E7EB'}`,
      borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <div style={{ fontSize: '11px', fontFamily: 'Manrope', fontWeight: 600, color: accent ? 'rgba(255,255,255,0.65)' : '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontFamily: 'Manrope', fontWeight: 800, color: accent ? '#fff' : '#1A1A1A', lineHeight: 1.1 }}>{value}</div>
      {badge && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px',
          background: accent ? 'rgba(255,255,255,0.15)' : '#E8F2ED', borderRadius: '999px',
          padding: '3px 10px', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope',
          color: accent ? '#fff' : '#2D6A4F', width: 'fit-content',
        }}>{badge}</div>
      )}
      {sub && <div style={{ fontSize: '12px', color: accent ? 'rgba(255,255,255,0.7)' : '#6B7280', marginTop: '2px' }}>{sub}</div>}
      {children}
    </div>
  )
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A1A', marginBottom: '3px' }}>{title}</h3>
      {sub && <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{sub}</p>}
    </div>
  )
}

// ─── Slider with label ───────────────────────────────────────────────────────
function SimSlider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontFamily: 'Manrope', fontWeight: 600, color: '#6B7280' }}>{label}</span>
        <span style={{ fontSize: '13px', fontFamily: 'Manrope', fontWeight: 700, color: '#2D6A4F' }}>{format(value)}</span>
      </div>
      <div style={{ position: 'relative', height: '6px' }}>
        <div style={{ height: '6px', borderRadius: '3px', background: '#F3F4F6', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#2D6A4F', transition: 'width 0.1s' }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer', height: '100%' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '10px', color: '#D1D5DB' }}>{format(min)}</span>
        <span style={{ fontSize: '10px', color: '#D1D5DB' }}>{format(max)}</span>
      </div>
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>{sub}</div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px', flexShrink: 0,
          background: checked ? '#2D6A4F' : '#E5E7EB', transition: 'background 0.2s', position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: '3px', width: '16px', height: '16px',
          borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
          left: checked ? '21px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>
    </label>
  )
}

// ─── TIME FILTER buttons ──────────────────────────────────────────────────────
const FILTERS = ['5Y', '10Y', '15Y', '20Y'] as const
type Filter = typeof FILTERS[number]

const FILTER_YEARS: Record<Filter, number> = { '5Y': 5, '10Y': 10, '15Y': 15, '20Y': 20 }

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard({ financial, expenses, property, timeline, onReset }: Props) {
  const [chartFilter, setChartFilter] = useState<Filter>('10Y')
  const [simSalaryGrowth, setSimSalaryGrowth] = useState(financial.salaryGrowth)
  const [simMonthlyExpenses, setSimMonthlyExpenses] = useState(0)
  const [simExtraSavings, setSimExtraSavings] = useState(0)
  const [simCar, setSimCar] = useState(false)
  const [simBike, setSimBike] = useState(false)
  const [mlOpen, setMlOpen] = useState(false)

  const base = predictHomeAffordability({ financial, expenses, property, timeline })

  const simFinancial: FinancialData = {
    ...financial,
    salaryGrowth: simSalaryGrowth,
  }
  const simExpenses: ExpenseData = {
    ...expenses,
    carEmi: expenses.carEmi + (simCar ? 18000 : 0) + (simBike ? 6000 : 0),
    lifestyle: Math.round(expenses.lifestyle * (1 - simMonthlyExpenses / 100)),
    other: Math.round(expenses.other * (1 - simMonthlyExpenses / 100)),
  }
  const simFinancialAdjusted = {
    ...simFinancial,
    savings: financial.savings + simExtraSavings * 12,
    investments: financial.investments,
  }
  const sim = predictHomeAffordability({ financial: simFinancialAdjusted, expenses: simExpenses, property, timeline })

  const currentYear = new Date().getFullYear()

  // ── Build unified price chart data ──────────────────────────────────────
  const filterYears = FILTER_YEARS[chartFilter]
  const chartStart = currentYear - Math.round(filterYears * 0.4)
  const chartEnd = currentYear + Math.round(filterYears * 0.6) + 2

  const priceChartData = useMemo(() => {
    const map: Record<number, any> = {}
    for (const p of base.priceHistory) {
      if (p.year < chartStart || p.year > chartEnd) continue
      if (!map[p.year]) map[p.year] = { year: p.year }
      if (p.type === 'historical') map[p.year]['Historical'] = p.price
      else map[p.year]['ML Forecast'] = p.price
    }
    // bridge at currentYear
    if (map[currentYear]) {
      map[currentYear]['ML Forecast'] = map[currentYear]['Historical']
    }
    return Object.values(map).sort((a, b) => a.year - b.year)
  }, [base.priceHistory, chartStart, chartEnd])

  // ── Savings vs Price chart ───────────────────────────────────────────────
  const savingsData = base.savingsVsPrice.map(d => ({
    year: d.year,
    'Property Price': d.price,
    'Savings Capacity': d.savings,
  }))

  // find crossover year
  const crossoverYear = base.savingsVsPrice.find((d, i, arr) =>
    i > 0 && d.savings >= arr[i - 1].price
  )?.year ?? base.affordableYear

  // ── Derived label info ───────────────────────────────────────────────────
  const scoreColor = base.affordabilityScore >= 70 ? '#2D6A4F' : base.affordabilityScore >= 45 ? '#D97706' : '#DC2626'
  const scoreLabel = base.affordabilityScore >= 70 ? 'Achievable with planning' : base.affordabilityScore >= 45 ? 'Moderate effort needed' : 'Challenging — boost savings'
  const priceGrowthPct = Math.round(((base.futurePrice - base.currentPrice) / base.currentPrice) * 100)

  const subtitle = [
    property.city,
    property.bedrooms ? `${property.bedrooms} BHK` : null,
    property.area ? `${property.area.toLocaleString()} sq.ft` : null,
    timeline.targetYear ? `Target ${timeline.targetYear}` : null,
  ].filter(Boolean).join(' • ')

  const yearDiff = base.affordableYear - (sim.affordableYear || base.affordableYear)
  const optimized = yearDiff > 0

  const expenseRows = [
    { label: 'Rent', value: expenses.rent, color: '#2D6A4F' },
    { label: 'Groceries', value: expenses.groceries, color: '#74A78A' },
    { label: 'Utilities', value: expenses.utilities, color: '#D97706' },
    { label: 'Fuel / Transportation', value: expenses.transport, color: '#6B7280' },
    { label: 'Car EMI', value: expenses.carEmi, color: '#A78BFA' },
    { label: 'Bike EMI', value: expenses.bikeEmi, color: '#F59E0B' },
    { label: 'Other Loans / EMIs', value: expenses.loans, color: '#DC2626' },
    { label: 'Insurance', value: expenses.insurance, color: '#9CA3AF' },
    { label: 'Entertainment / Lifestyle', value: expenses.lifestyle, color: '#FB7185' },
    { label: 'Other Expenses', value: expenses.other, color: '#1F2937' },
  ].filter(row => row.value > 0)

  const expenseTotal = expenseRows.reduce((sum, row) => sum + row.value, 0)
  const monthlyIncome = financial.salary / 12 + financial.additionalIncome
  const expenseBarData = expenseRows.map(row => ({ ...row, pct: monthlyIncome > 0 ? Math.round((row.value / expenseTotal) * 100) : 0 }))
  const highestExpenses = [...expenseRows].sort((a, b) => b.value - a.value).slice(0, 3)
  const donutData = expenseRows.map((row, idx) => ({ name: row.label, value: row.value, color: row.color }))

  return (
    <div style={{ width: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E8F2ED', borderRadius: '999px', padding: '4px 12px', marginBottom: '10px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D6A4F', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontFamily: 'Manrope', fontWeight: 700, color: '#2D6A4F', letterSpacing: '0.04em' }}>ML PREDICTION ACTIVE</span>
          </div>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.75rem', color: '#1A1A1A', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Your Dream Home Forecast
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{subtitle || 'Bangalore • 2 BHK • 1200 sq.ft • Target 2036'}</p>
        </div>
        <button
          onClick={onReset}
          style={{ padding: '10px 18px', borderRadius: '12px', background: '#F3F4F6', color: '#374151', fontFamily: 'Manrope', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}
        >
          ← New Analysis
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <KpiCard
          label="Current Estimated Price"
          value={fmt(base.currentPrice)}
          sub={`As of 2026 · ${property.city}`}
        />
        <KpiCard
          label={`Predicted ${timeline.targetYear} Price`}
          value={fmt(base.futurePrice)}
          badge={`+${priceGrowthPct}% in ${timeline.years}Y`}
          sub="ML model projection"
        />
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <div style={{ fontSize: '11px', fontFamily: 'Manrope', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Affordability Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ScoreRing score={base.affordabilityScore} size={72} />
            <div>
              <div style={{ fontSize: '13px', fontFamily: 'Manrope', fontWeight: 700, color: scoreColor, marginBottom: '4px' }}>{scoreLabel}</div>
              <AffordabilityMeter score={base.affordabilityScore} />
            </div>
          </div>
        </div>
        <KpiCard
          label="Estimated Affordable Year"
          value={String(base.affordableYear)}
          sub={`${base.yearsToAfford} years from today`}
          accent="#2D6A4F"
        />
      </div>

      {/* ── House Price Forecast chart ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '3px' }}>House Price Forecast</h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Historical data · ML prediction from {currentYear} to {currentYear + Math.round(FILTER_YEARS[chartFilter] * 0.6) + 2}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#2D6A4F" strokeWidth="2.5" /></svg>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Historical Data</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#D97706" strokeWidth="2.5" strokeDasharray="5 3" /></svg>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>ML Forecast</span>
              </div>
            </div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', background: '#F9FAFB', borderRadius: '12px', padding: '4px', gap: '2px' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setChartFilter(f)}
                  style={{
                    padding: '5px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    fontFamily: 'Manrope', fontWeight: 600, fontSize: '12px',
                    background: chartFilter === f ? '#2D6A4F' : 'transparent',
                    color: chartFilter === f ? '#fff' : '#6B7280',
                    transition: 'all 0.15s',
                  }}
                >{f}</button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={priceChartData} margin={{ top: 5, right: 16, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter' }}
              axisLine={{ stroke: '#F3F4F6' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter' }}
              tickFormatter={v => fmtShort(v)}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              x={currentYear}
              stroke="#9CA3AF"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Today', position: 'insideTopRight', fontSize: 10, fill: '#9CA3AF', dy: -8 }}
            />
            <Area type="monotone" dataKey="Historical" stroke="#2D6A4F" strokeWidth={2.5}
              fill="url(#histGrad)" dot={false} connectNulls activeDot={{ r: 4, fill: '#2D6A4F' }} />
            <Area type="monotone" dataKey="ML Forecast" stroke="#D97706" strokeWidth={2.5}
              strokeDasharray="6 4" fill="url(#forecastGrad)" dot={false} connectNulls
              activeDot={{ r: 4, fill: '#D97706' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Your Financial Future ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '3px' }}>Your Financial Future</h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Projected savings capacity vs property price trajectory over time</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { color: '#DC2626', fill: '#FEE2E2', label: 'Property Price' },
              { color: '#2D6A4F', fill: '#D1FAE5', label: 'Savings Capacity' },
            ].map(({ color, fill, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: fill, border: `1.5px solid ${color}` }} />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight callout */}
        <div style={{
          background: 'linear-gradient(135deg, #E8F2ED 0%, #F0F7F3 100%)',
          border: '1px solid #A8C5B5', borderRadius: '14px',
          padding: '14px 18px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#2D6A4F',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a7 7 0 100 14A7 7 0 009 2zm0 3v4m0 2.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: '13px', color: '#1A4731', lineHeight: '1.5', fontWeight: 500 }}>
            Based on your current financial trajectory, this home may become affordable around{' '}
            <strong style={{ fontFamily: 'Manrope', fontWeight: 700 }}>{base.affordableYear}</strong>.
            {' '}Increasing your monthly savings by <strong style={{ fontFamily: 'Manrope' }}>{fmt(base.recommendedMonthlySavings)}</strong> could bring this date closer.
          </p>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={savingsData} margin={{ top: 5, right: 16, bottom: 5, left: 10 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter' }} axisLine={{ stroke: '#F3F4F6' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Inter' }} tickFormatter={v => fmtShort(v)} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<ChartTooltip />} />
            {crossoverYear && (
              <ReferenceLine
                x={crossoverYear}
                stroke="#2D6A4F"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                label={{
                  value: `✓ Affordable ${crossoverYear}`,
                  position: 'insideTopLeft',
                  fontSize: 10,
                  fill: '#2D6A4F',
                  fontFamily: 'Manrope',
                  fontWeight: 700,
                  dy: -10,
                }}
              />
            )}
            <Area type="monotone" dataKey="Property Price" stroke="#DC2626" strokeWidth={2.5} fill="url(#priceGrad)" dot={false} />
            <Area type="monotone" dataKey="Savings Capacity" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#savGrad)" dot={false} />
            {/* Crossover dot */}
            {crossoverYear && (
              <ReferenceDot
                x={crossoverYear}
                y={base.savingsVsPrice.find(d => d.year === crossoverYear)?.savings ?? 0}
                r={8} fill="#2D6A4F" stroke="white" strokeWidth={2.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Analysis */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '4px' }}>Where Your Money Goes</h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Expense distribution and savings opportunities</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2D6A4F' }}></span><span style={{ fontSize: '11px', color: '#6B7280' }}>Savings</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706' }}></span><span style={{ fontSize: '11px', color: '#6B7280' }}>Spending</span></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', marginTop: '16px' }}>
          <div style={{ height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={60} fill="#2D6A4F" paddingAngle={2}>
                  {donutData.map((entry, idx) => <Cell key={entry.name} fill={entry.color || '#2D6A4F'} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenseBarData.map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{row.label}</span>
                  <span style={{ fontSize: '11px', color: '#1A1A1A', fontFamily: 'Manrope', fontWeight: 700 }}>{row.pct}%</span>
                </div>
                <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(4, row.pct)}%`, height: '100%', background: row.color, borderRadius: '999px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#E8F2ED', borderRadius: '14px', padding: '14px 16px', marginTop: '16px' }}>
          <span style={{ color: '#2D6A4F', fontSize: '13px', fontFamily: 'Manrope', fontWeight: 700 }}>Rule-based insight</span>
          <div style={{ color: '#1A1A1A', fontSize: '13px', marginTop: '4px' }}>Reducing lifestyle and transportation expenses by ₹8,000/month may move your target purchase date forward.</div>
        </div>
        <div style={{ marginTop: '14px', color: '#6B7280', fontSize: '11px' }}>Highest-impact categories: {highestExpenses.map(row => row.label).join(', ')}</div>
      </div>

      {/* ML Transparency */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: '4px' }}>How was this prediction calculated?</h3>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>HomeWise combines historical property-price data, your financial inputs, a regression forecast model, and affordability assumptions.</p>
          </div>
          <button onClick={() => setMlOpen(!mlOpen)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '12px', padding: '10px 14px', fontFamily: 'Manrope', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{mlOpen ? 'Hide' : 'Show'} details</button>
        </div>
        {mlOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(130px, 1fr))', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: '#F9FAFB', borderRadius: '14px', padding: '12px' }}><div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase' }}>Model Status</div><div style={{ fontSize: '12px', fontFamily: 'Manrope', fontWeight: 700, color: '#2D6A4F', marginTop: '4px' }}>Prototype Mock</div></div>
            <div style={{ background: '#F9FAFB', borderRadius: '14px', padding: '12px' }}><div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase' }}>Training Data Period</div><div style={{ fontSize: '12px', fontFamily: 'Manrope', fontWeight: 700, color: '#1A1A1A', marginTop: '4px' }}>2000–2026</div></div>
            <div style={{ background: '#F9FAFB', borderRadius: '14px', padding: '12px' }}><div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase' }}>Forecast Horizon</div><div style={{ fontSize: '12px', fontFamily: 'Manrope', fontWeight: 700, color: '#1A1A1A', marginTop: '4px' }}>{timeline.years} years</div></div>
            <div style={{ background: '#F9FAFB', borderRadius: '14px', padding: '12px' }}><div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase' }}>Prediction Confidence</div><div style={{ fontSize: '12px', fontFamily: 'Manrope', fontWeight: 700, color: '#D97706', marginTop: '4px' }}>Mock only</div></div>
          </div>
        )}
      </div>

      {/* ── Bottom row: Breakdown + Simulator ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Affordability Breakdown */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '28px' }}>
          <SectionHeading title="Affordability Breakdown" sub="Based on current trajectory and ML price model" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px' }}>
            <ScoreRing score={base.affordabilityScore} size={108} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem', color: scoreColor, marginBottom: '8px' }}>{scoreLabel}</div>
              <AffordabilityMeter score={base.affordabilityScore} />
            </div>
          </div>

          {[
            { label: 'Predicted Price', value: fmt(base.futurePrice), dot: '#1A1A1A', bold: true },
            { label: 'Projected Savings', value: fmt(base.projectedSavings), dot: '#2D6A4F' },
            { label: 'Down Payment (20%)', value: fmt(base.downPayment), dot: '#D97706' },
            { label: 'Estimated Loan Required', value: fmt(base.loanRequired), dot: '#DC2626' },
            { label: 'Est. Monthly EMI (20yr @ 8.5%)', value: fmt(base.monthlyLoanEmi), dot: '#6B7280' },
            { label: 'Recommended Monthly Savings', value: fmt(base.recommendedMonthlySavings), dot: '#2D6A4F', bold: true, highlight: true },
          ].map(({ label, value, dot, bold, highlight }) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0', borderBottom: '1px solid #F9FAFB',
                background: highlight ? 'transparent' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{label}</span>
              </div>
              <span style={{
                fontSize: '13px', fontFamily: 'Manrope', fontWeight: bold ? 700 : 600,
                color: bold ? dot : '#1A1A1A',
                background: highlight ? '#E8F2ED' : 'transparent',
                padding: highlight ? '3px 10px' : undefined,
                borderRadius: highlight ? '999px' : undefined,
              }}>{value}</span>
            </div>
          ))}
        </div>

        {/* What-If Simulator */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '28px' }}>
          <SectionHeading title="What-If Simulator" sub="Adjust parameters to see how your plan changes" />

          {/* Plan comparison banner */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
            background: '#F3F4F6', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px',
          }}>
            <div style={{ background: '#FEF9F0', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'Manrope', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Current Plan</div>
              <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.4rem', color: '#D97706' }}>{base.affordableYear}</div>
              <div style={{ fontSize: '11px', color: '#92400E', marginTop: '2px' }}>Score: {base.affordabilityScore}/100</div>
            </div>
            <div style={{ background: optimized ? '#E8F2ED' : '#F9FAFB', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'Manrope', fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Optimized Plan</div>
              <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.4rem', color: '#2D6A4F' }}>{sim.affordableYear}</div>
              <div style={{ fontSize: '11px', color: '#4A8B6B', marginTop: '2px' }}>Score: {sim.affordabilityScore}/100</div>
            </div>
          </div>

          {optimized && yearDiff > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #E8F2ED, #F0F9F5)',
              border: '1px solid #A8C5B5', borderRadius: '12px',
              padding: '10px 16px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span style={{ fontSize: '13px', fontFamily: 'Manrope', fontWeight: 700, color: '#2D6A4F' }}>
                Reach your goal <span style={{ textDecoration: 'underline', textDecorationColor: '#74A78A' }}>{yearDiff} year{yearDiff > 1 ? 's' : ''} earlier</span>
              </span>
            </div>
          )}

          {sim.affordableYear >= base.affordableYear && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px',
              padding: '10px 16px', marginBottom: '20px',
            }}>
              <span style={{ fontSize: '13px', color: '#92400E' }}>Adjust sliders above to find an optimized plan.</span>
            </div>
          )}

          <SimSlider
            label="Annual Salary Growth"
            value={simSalaryGrowth} min={0} max={30} step={1}
            format={v => `${v}%`}
            onChange={setSimSalaryGrowth}
          />
          <SimSlider
            label="Reduce Monthly Expenses By"
            value={simMonthlyExpenses} min={0} max={50} step={5}
            format={v => `${v}%`}
            onChange={setSimMonthlyExpenses}
          />
          <SimSlider
            label="Extra Monthly Savings"
            value={simExtraSavings} min={0} max={100000} step={2500}
            format={v => v === 0 ? '₹0' : `₹${(v / 1000).toFixed(0)}K`}
            onChange={setSimExtraSavings}
          />

          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'Manrope', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Planned Purchases</div>
            <Toggle label="Car Purchase" sub="Adds ~₹18,000/month EMI" checked={simCar} onChange={setSimCar} />
            <Toggle label="Bike Purchase" sub="Adds ~₹6,000/month EMI" checked={simBike} onChange={setSimBike} />
          </div>

          {/* Mini score comparison */}
          <div style={{ marginTop: '20px', background: '#F9FAFB', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
              {[
                { label: 'Score Δ', val: `${sim.affordabilityScore >= base.affordabilityScore ? '+' : ''}${sim.affordabilityScore - base.affordabilityScore}`, color: sim.affordabilityScore >= base.affordabilityScore ? '#2D6A4F' : '#DC2626' },
                { label: 'Year Δ', val: yearDiff > 0 ? `-${yearDiff}yr` : yearDiff < 0 ? `+${Math.abs(yearDiff)}yr` : '—', color: yearDiff > 0 ? '#2D6A4F' : yearDiff < 0 ? '#DC2626' : '#9CA3AF' },
                { label: 'EMI Impact', val: fmt(Math.abs(sim.monthlyLoanEmi - base.monthlyLoanEmi)), color: sim.monthlyLoanEmi <= base.monthlyLoanEmi ? '#2D6A4F' : '#DC2626' },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: 'Manrope', fontWeight: 600, marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontFamily: 'Manrope', fontWeight: 800, color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

