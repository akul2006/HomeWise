import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { FinancialData } from '@/types'

interface Props {
  data: FinancialData
  onChange: (d: FinancialData) => void
  onNext: () => void
}

const PIE_COLORS = ['#D97706', '#74A78A', '#9CA3AF', '#2D6A4F', '#F59E0B', '#6B7280', '#A78BFA', '#FB7185']

function Field({
  label, value, onChange, prefix = '₹',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  prefix?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: '#9CA3AF' }}
        >
          {prefix}
        </span>
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full pl-8 pr-3 py-3 rounded-xl text-sm font-medium outline-none transition-all"
          style={{
            background: '#F9FAFB',
            border: '1.5px solid #E5E7EB',
            color: '#1A1A1A',
          }}
          onFocus={e => (e.target.style.borderColor = '#2D6A4F')}
          onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
        />
      </div>
    </div>
  )
}

function fmt(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

export default function FinancialStep({ data, onChange, onNext }: Props) {
  const set = (key: keyof FinancialData) => (v: number) => onChange({ ...data, [key]: v })

  const totalExpenses = data.rent + data.groceries + data.utilities + data.fuel +
    data.carEmi + data.loans + data.lifestyle + data.other
  const monthlyIncome = data.salary / 12
  const monthlySavings = Math.max(0, monthlyIncome - totalExpenses)
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0

  const pieData = [
    { name: 'Rent', value: data.rent },
    { name: 'Groceries', value: data.groceries },
    { name: 'Utilities', value: data.utilities },
    { name: 'Fuel', value: data.fuel },
    { name: 'Car/Bike EMI', value: data.carEmi },
    { name: 'Loans', value: data.loans },
    { name: 'Lifestyle', value: data.lifestyle },
    { name: 'Other', value: data.other },
  ].filter(d => d.value > 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Form */}
      <div className="flex-1 max-w-2xl">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Your Financial Profile</h2>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>We use this to project your future purchasing capacity.</p>

        {/* Income section */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Income</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Annual Salary / CTC" value={data.salary} onChange={set('salary')} />
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>
                Annual Salary Growth (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={data.salaryGrowth || ''}
                  onChange={e => set('salaryGrowth')(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }}
                  onFocus={e => (e.target.style.borderColor = '#2D6A4F')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9CA3AF' }}>%</span>
              </div>
            </div>
            <Field label="Current Savings / Investments" value={data.currentSavings} onChange={set('currentSavings')} />
          </div>
        </div>

        {/* Expenses */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Monthly Expenses</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rent" value={data.rent} onChange={set('rent')} />
            <Field label="Groceries" value={data.groceries} onChange={set('groceries')} />
            <Field label="Utilities (electricity, water, internet)" value={data.utilities} onChange={set('utilities')} />
            <Field label="Fuel / Transportation" value={data.fuel} onChange={set('fuel')} />
            <Field label="Car / Bike EMI" value={data.carEmi} onChange={set('carEmi')} />
            <Field label="Other Loans / EMIs" value={data.loans} onChange={set('loans')} />
            <Field label="Lifestyle (dining, subscriptions)" value={data.lifestyle} onChange={set('lifestyle')} />
            <Field label="Other Expenses" value={data.other} onChange={set('other')} />
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!data.salary}
          className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
          style={{ background: '#2D6A4F', fontFamily: 'Manrope' }}
        >
          Continue to Property Details →
        </button>
      </div>

      {/* Summary panel */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-5">
        {/* Quick stats */}
        <div className="p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          <div className="text-sm font-bold mb-5" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Financial Snapshot</div>
          <div className="space-y-4">
            {[
              { label: 'Monthly Income', value: fmt(monthlyIncome), color: '#2D6A4F' },
              { label: 'Total Expenses', value: fmt(totalExpenses), color: '#D97706' },
              { label: 'Potential Savings', value: fmt(monthlySavings), color: '#2D6A4F' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#6B7280' }}>{label}</span>
                <span className="text-sm font-bold" style={{ color, fontFamily: 'Manrope' }}>{value}</span>
              </div>
            ))}
            <div className="pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>Savings Rate</span>
                <span className="text-sm font-bold" style={{ color: savingsRate >= 20 ? '#2D6A4F' : '#D97706', fontFamily: 'Manrope' }}>
                  {savingsRate}%
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#F3F4F6' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, savingsRate)}%`, background: savingsRate >= 20 ? '#2D6A4F' : '#D97706' }}
                />
              </div>
              <div className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>
                {savingsRate >= 30 ? 'Excellent savings discipline' : savingsRate >= 20 ? 'Good — aim for 30%+' : 'Try to reduce expenses'}
              </div>
            </div>
          </div>
        </div>

        {/* Donut chart */}
        {pieData.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <div className="text-sm font-bold mb-4" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Expense Breakdown</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [fmt(Number(v ?? 0)), '']}
                  contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs" style={{ color: '#6B7280' }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

