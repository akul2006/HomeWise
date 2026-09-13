import type { FinancialData } from '@/types'

interface Props {
  data: FinancialData
  onChange: (d: FinancialData) => void
  onNext: () => void
}

function Field({ label, value, onChange, prefix = '₹', suffix = '' }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9CA3AF' }}>{prefix}</span>
        <input
          type="number"
          min="0"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full pl-8 pr-8 py-3 rounded-xl text-sm font-medium outline-none transition-all"
          style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }}
          onFocus={e => (e.target.style.borderColor = '#2D6A4F')}
          onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#9CA3AF' }}>{suffix}</span>}
      </div>
    </div>
  )
}

function fmtMoney(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

export default function FinancesStep({ data, onChange, onNext }: Props) {
  const set = (key: keyof FinancialData) => (v: number) => onChange({ ...data, [key]: Math.max(0, v) })
  const monthlyIncome = data.salary / 12 + data.additionalIncome
  const estimatedAnnualIncome = data.salary * (1 + data.salaryGrowth / 100)

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex-1 max-w-2xl">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Let’s understand your finances</h2>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>This helps us estimate your future purchasing capacity.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Monthly Salary" value={data.salary} onChange={set('salary')} />
          <Field label="Additional Monthly Income" value={data.additionalIncome} onChange={set('additionalIncome')} />
          <Field label="Current Savings" value={data.savings} onChange={set('savings')} />
          <Field label="Current Investments" value={data.investments} onChange={set('investments')} />
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>Expected Annual Salary Growth %</label>
            <div className="relative">
              <input type="number" min="0" max="100" value={data.salaryGrowth || ''} onChange={e => set('salaryGrowth')(Number(e.target.value))} className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }} onFocus={e => (e.target.style.borderColor = '#2D6A4F')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9CA3AF' }}>%</span>
            </div>
          </div>
        </div>

        <div className="flex mt-8">
          <button onClick={onNext} className="w-full py-4 rounded-2xl text-white text-base font-bold transition-all hover:opacity-90 active:scale-[0.99]" style={{ background: '#2D6A4F', fontFamily: 'Manrope' }}>Continue to Expenses →</button>
        </div>
      </div>

      <div className="w-full lg:w-80 xl:w-96">
        <div className="rounded-2xl p-6 sticky top-8" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          <div className="text-sm font-bold mb-5" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Financial Summary</div>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-xs" style={{ color: '#9CA3AF' }}>Total Monthly Income</span><span className="text-sm font-bold" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{fmtMoney(monthlyIncome)}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs" style={{ color: '#9CA3AF' }}>Current Savings</span><span className="text-sm font-bold" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{fmtMoney(data.savings)}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs" style={{ color: '#9CA3AF' }}>Current Investments</span><span className="text-sm font-bold" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{fmtMoney(data.investments)}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs" style={{ color: '#9CA3AF' }}>Estimated Annual Income</span><span className="text-sm font-bold" style={{ color: '#1A1A1A', fontFamily: 'Manrope' }}>{fmtMoney(estimatedAnnualIncome)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
