import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { ExpenseData, FinancialData } from '@/types'

interface Props {
  financial: FinancialData
  data: ExpenseData
  onChange: (d: ExpenseData) => void
  onNext: () => void
  onBack: () => void
}

const EXPENSES = [
  { key: 'rent' as const, label: 'Rent', icon: '🏠', color: '#2D6A4F' },
  { key: 'groceries' as const, label: 'Groceries', icon: '🥬', color: '#74A78A' },
  { key: 'utilities' as const, label: 'Utilities', icon: '⚡', color: '#D97706' },
  { key: 'transport' as const, label: 'Fuel / Transportation', icon: '🚗', color: '#6B7280' },
  { key: 'carEmi' as const, label: 'Car EMI', icon: '🚘', color: '#A78BFA' },
  { key: 'bikeEmi' as const, label: 'Bike EMI', icon: '🏍️', color: '#F59E0B' },
  { key: 'loans' as const, label: 'Other Loans / EMIs', icon: '💳', color: '#DC2626' },
  { key: 'insurance' as const, label: 'Insurance', icon: '🛡️', color: '#9CA3AF' },
  { key: 'lifestyle' as const, label: 'Entertainment / Lifestyle', icon: '🎉', color: '#FB7185' },
  { key: 'other' as const, label: 'Other Expenses', icon: '✦', color: '#1F2937' },
]

const COLORS = ['#2D6A4F', '#74A78A', '#D97706', '#6B7280', '#A78BFA', '#F59E0B', '#DC2626', '#9CA3AF', '#FB7185', '#1F2937']

function currency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

export default function ExpensesStep({ financial, data, onChange, onNext, onBack }: Props) {
  const set = (key: keyof ExpenseData) => (v: number) => onChange({ ...data, [key]: Math.max(0, v) })

  const monthlyIncome = financial.salary / 12 + financial.additionalIncome
  const monthlyExpenses = Object.values(data).reduce((a, b) => a + b, 0)
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses)
  const savingsRate = monthlyIncome ? Math.round((monthlySavings / monthlyIncome) * 100) : 0

  const donutData = EXPENSES.map((exp, idx) => ({ name: exp.label, value: data[exp.key], color: COLORS[idx % COLORS.length] })).filter(d => d.value > 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex-1 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Where does your money go?</h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Understand your monthly spending pattern.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {EXPENSES.map((exp, idx) => (
            <div key={exp.key} className="rounded-2xl p-4 border" style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#E8F2ED', color: exp.color, fontSize: '16px' }}>{exp.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: '#374151', fontFamily: 'Manrope' }}>{exp.label}</span>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#9CA3AF' }}>₹</span>
                <input
                  type="number"
                  min="0"
                  value={data[exp.key] || ''}
                  onChange={e => set(exp.key)(Number(e.target.value))}
                  className="w-full pl-8 pr-2 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }}
                  onFocus={e => (e.target.style.borderColor = '#2D6A4F')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onBack} className="flex-1 py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-80" style={{ background: '#F3F4F6', color: '#374151', fontFamily: 'Manrope' }}>← Back</button>
          <button onClick={onNext} className="flex-[2] py-4 rounded-2xl text-white text-base font-bold transition-all hover:opacity-90 active:scale-[0.99]" style={{ background: '#2D6A4F', fontFamily: 'Manrope' }}>Continue to Property →</button>
        </div>
      </div>

      <div className="w-full lg:w-[360px]">
        <div className="rounded-2xl p-6 sticky top-8" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          <div className="text-sm font-bold mb-5" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Expense Summary</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
              <div className="text-[10px] uppercase" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Monthly Income</div>
              <div className="text-sm font-bold mt-1" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{currency(monthlyIncome)}</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
              <div className="text-[10px] uppercase" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Expenses</div>
              <div className="text-sm font-bold mt-1" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{currency(monthlyExpenses)}</div>
            </div>
          </div>
          <div className="rounded-xl p-4 mb-4" style={{ background: '#E8F2ED' }}>
            <div className="text-[10px] uppercase" style={{ color: '#2D6A4F', fontFamily: 'Manrope' }}>Potential Monthly Savings</div>
            <div className="text-xl font-black mt-1" style={{ color: '#2D6A4F', fontFamily: 'Manrope' }}>{currency(monthlySavings)}</div>
            <div className="text-xs mt-2" style={{ color: '#6B7280' }}>Savings Rate: {savingsRate}%</div>
          </div>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={58} paddingAngle={2} fill="#2D6A4F">
                  {donutData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-center" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>You currently save {savingsRate}% of your monthly income.</div>
        </div>
      </div>
    </div>
  )
}
