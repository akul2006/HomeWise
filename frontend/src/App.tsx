import { useState } from 'react'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import FinancesStep from '@/components/steps/FinancesStep'
import ExpensesStep from '@/components/steps/ExpensesStep'
import PropertyStep from '@/components/steps/PropertyStep'
import TimelineStep from '@/components/steps/TimelineStep'
import StepProgress, { type Screen } from '@/components/StepProgress'
import type { AppState, ExpenseData, FinancialData, PropertyData, TimelineData } from '@/types'

type AppScreen = Screen | 'landing'

const DEFAULT_STATE: AppState = {
  financial: {
    salary: 1200000,
    additionalIncome: 20000,
    savings: 500000,
    investments: 250000,
    salaryGrowth: 10,
  },
  expenses: {
    rent: 25000,
    groceries: 8000,
    utilities: 4000,
    transport: 5000,
    carEmi: 12000,
    bikeEmi: 0,
    loans: 0,
    insurance: 6000,
    lifestyle: 12000,
    other: 5000,
  },
  property: {
    city: 'Bangalore',
    locality: 'Whitefield',
    propertyType: 'Apartment',
    bedrooms: 2,
    area: 1200,
    currentPrice: 1250000,
  },
  timeline: {
    years: 10,
    targetYear: new Date().getFullYear() + 10,
  },
  prediction: {
    currentPrice: 1250000,
    futurePrice: 1800000,
    growthPercentage: 30,
    affordabilityScore: 72,
    affordableYear: 2038,
    projectedSavings: 750000,
    loanRequired: 1200000,
  },
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing')
  const [state, setState] = useState<AppState>(DEFAULT_STATE)

  const updateFinancial = (financial: FinancialData) => setState({ ...state, financial })
  const updateExpenses = (expenses: ExpenseData) => setState({ ...state, expenses })
  const updateProperty = (property: PropertyData) => setState({ ...state, property })
  const updateTimeline = (timeline: TimelineData) => setState({ ...state, timeline })

  if (screen === 'landing') {
    return <Landing onStart={() => setScreen('finances')} />
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F4' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 py-3.5" style={{ background: 'rgba(247,247,244,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => setScreen('landing')} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2D6A4F' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1.5 7v7.5h4.5V10h4v4.5H14.5V7L8 1.5z" fill="white" /></svg>
          </div>
          <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1rem', color: '#1A1A1A' }}>HomeWise</span>
        </button>
        {screen !== 'dashboard' && <StepProgress current={screen} />}
        {screen === 'dashboard' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#E8F2ED', color: '#2D6A4F' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" /> ML Prediction Active
          </div>
        )}
        <div className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{screen === 'finances' ? 'Step 1 of 5' : screen === 'expenses' ? 'Step 2 of 5' : screen === 'property' ? 'Step 3 of 5' : screen === 'timeline' ? 'Step 4 of 5' : 'Results'}</div>
      </nav>

      <div className="pt-20 pb-16 px-6 lg:px-10 xl:px-16 max-w-[1440px] mx-auto">
        {screen === 'finances' && <FinancesStep data={state.financial} onChange={updateFinancial} onNext={() => setScreen('expenses')} />}
        {screen === 'expenses' && <ExpensesStep financial={state.financial} data={state.expenses} onChange={updateExpenses} onNext={() => setScreen('property')} onBack={() => setScreen('finances')} />}
        {screen === 'property' && <PropertyStep data={state.property} onChange={updateProperty} onNext={() => setScreen('timeline')} onBack={() => setScreen('expenses')} />}
        {screen === 'timeline' && <TimelineStep data={state.timeline} onChange={updateTimeline} onNext={() => setScreen('dashboard')} onBack={() => setScreen('property')} />}
        {screen === 'dashboard' && <Dashboard financial={state.financial} expenses={state.expenses} property={state.property} timeline={state.timeline} onReset={() => setScreen('finances')} />}
      </div>
    </div>
  )
}
