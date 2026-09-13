import type { TimelineData } from '@/types'

interface Props {
  data: TimelineData
  onChange: (d: TimelineData) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS = [5, 10, 15, 20]

export default function TimelineStep({ data, onChange, onNext, onBack }: Props) {
  const set = (key: keyof TimelineData) => (v: any) => onChange({ ...data, [key]: v })
  const currentYear = new Date().getFullYear()
  const selectedYears = data.years || 10

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>When do you want to own this home?</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>HomeWise will forecast both your financial position and the property’s expected value over this period.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {OPTIONS.map(years => (
          <button key={years} onClick={() => { set('years')(years); set('targetYear')(currentYear + years) }} className="rounded-2xl p-5 transition-all" style={{ background: selectedYears === years ? '#2D6A4F' : '#FFFFFF', border: `1.5px solid ${selectedYears === years ? '#2D6A4F' : '#E5E7EB'}`, color: selectedYears === years ? '#FFFFFF' : '#1A1A1A' }}>
            <div className="text-base font-black" style={{ fontFamily: 'Manrope' }}>{years} Years</div>
          </button>
        ))}
        <div className="rounded-2xl p-3 flex flex-col justify-center" style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB' }}>
          <label className="text-xs font-semibold mb-2" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>Custom Year</label>
          <input type="number" min="1" value={data.targetYear || currentYear + 10} onChange={e => { const target = Number(e.target.value); set('targetYear')(target); set('years')(Math.max(1, target - currentYear)) }} className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }} />
        </div>
      </div>

      <div className="rounded-3xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Timeline</span>
          <span className="text-xs font-bold" style={{ color: '#2D6A4F', fontFamily: 'Manrope' }}>Forecast horizon: {selectedYears} years</span>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-1/2 h-0.5 w-full bg-[#D1D5DB]" />
          <div className="flex items-center justify-between relative">
            {[0, 1, 2, 3, 4].map(i => {
              const year = currentYear + Math.round((selectedYears / 4) * i)
              return <div key={i} className="flex flex-col items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#2D6A4F] border-4 border-white shadow" />
                <span className="text-xs" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>{year}</span>
              </div>
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-80" style={{ background: '#F3F4F6', color: '#374151', fontFamily: 'Manrope' }}>← Back</button>
        <button onClick={onNext} className="flex-[2] py-4 rounded-2xl text-white text-base font-bold transition-all hover:opacity-90 active:scale-[0.99]" style={{ background: '#2D6A4F', fontFamily: 'Manrope' }}>Predict My Future →</button>
      </div>
    </div>
  )
}
