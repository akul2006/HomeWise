export type Screen = 'finances' | 'expenses' | 'property' | 'timeline' | 'dashboard'

const STEPS = [
  { id: 'finances', label: 'Finances' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'property', label: 'Property' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'dashboard', label: 'Prediction' },
]

interface StepProgressProps {
  current: Screen
}

export default function StepProgress({ current }: StepProgressProps) {
  const stepIdx = STEPS.findIndex(s => s.id === current)
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < stepIdx
        const active = i === stepIdx
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{ background: done ? '#2D6A4F' : active ? '#2D6A4F' : '#E5E7EB', color: done || active ? '#FFFFFF' : '#9CA3AF', fontFamily: 'Manrope' }}>{done ? '✓' : i + 1}</div>
              <span className="text-xs font-semibold hidden sm:block" style={{ color: active ? '#2D6A4F' : done ? '#374151' : '#9CA3AF', fontFamily: 'Manrope' }}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 sm:w-16 h-0.5 mx-2" style={{ background: done ? '#2D6A4F' : '#E5E7EB' }} />}
          </div>
        )
      })}
    </div>
  )
}

