interface LandingProps {
  onStart: () => void
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="min-h-screen" style={{ background: '#F7F7F4' }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4"
        style={{ background: 'rgba(247,247,244,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#2D6A4F' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L1.5 7v7.5h4.5V10h4v4.5H14.5V7L8 1.5z" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1.1rem', color: '#1A1A1A' }}>HomeWise</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['How it works', 'Features', 'Cities'].map(item => (
            <a key={item} href="#" style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: 500 }} className="hover:text-[#2D6A4F] transition-colors">
              {item}
            </a>
          ))}
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#2D6A4F', fontFamily: 'Manrope' }}
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <div className="pt-20 min-h-screen flex flex-col lg:flex-row items-center max-w-[1440px] mx-auto px-10 xl:px-16 gap-12 xl:gap-20" style={{ paddingTop: '6rem' }}>
        {/* Left */}
        <div className="flex-1 pt-16 lg:pt-0 max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: '#E8F2ED', color: '#2D6A4F', border: '1px solid #A8C5B5' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
            ML-Powered Predictions · 2026
          </div>

          <h1
            className="text-5xl xl:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: 'Manrope', color: '#1A1A1A', letterSpacing: '-0.02em' }}
          >
            Will you be able to
            <br />
            <span style={{ color: '#2D6A4F' }}>afford your dream</span>
            <br />
            home?
          </h1>

          <p className="text-lg mb-10 leading-relaxed" style={{ color: '#6B7280', maxWidth: '520px' }}>
            Forecast future property prices and discover exactly when your finances
            could make your dream home achievable — powered by machine learning.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-lg"
              style={{ background: '#2D6A4F', fontFamily: 'Manrope', boxShadow: '0 8px 24px rgba(45,106,79,0.3)' }}
            >
              Check My Affordability →
            </button>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
                <path d="M5 8l2 2 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Free · No sign-up required
            </div>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-6 mt-12 pt-8" style={{ borderTop: '1px solid #E5E7EB' }}>
            {[
              { value: '50K+', label: 'Homes analyzed' },
              { value: '12', label: 'Cities covered' },
              { value: '94%', label: 'Prediction accuracy' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-xl font-bold" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>{value}</div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — property visual + floating stats */}
        <div className="flex-1 relative flex items-center justify-center w-full max-w-xl lg:max-w-none">
          <div className="relative w-full max-w-[520px]">
            {/* Main property image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format"
                alt="Modern home exterior"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(160deg, transparent 50%, rgba(26,26,26,0.35) 100%)' }}
              />
              {/* Bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Prestige Lakeside</div>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope' }}>₹1.42 Cr</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Bangalore, Whitefield</div>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    3 BHK · 1480 sqft
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat — predicted value */}
            <div
              className="absolute -top-6 -right-4 lg:-right-10 p-4 rounded-2xl shadow-xl"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', minWidth: '160px' }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Predicted (2031)</div>
              <div className="text-xl font-bold" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>₹2.08 Cr</div>
              <div className="flex items-center gap-1 mt-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 9L6 3l4 6" fill="#2D6A4F" />
                </svg>
                <span className="text-xs font-semibold" style={{ color: '#2D6A4F' }}>+46.5% in 5 yrs</span>
              </div>
            </div>

            {/* Floating stat — growth */}
            <div
              className="absolute -bottom-6 -left-4 lg:-left-10 p-4 rounded-2xl shadow-xl"
              style={{ background: '#2D6A4F', minWidth: '172px' }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Annual Growth Rate</div>
              <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope' }}>9.5%</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Bangalore avg · 2024–2026</div>
            </div>

            {/* Floating stat — affordability */}
            <div
              className="absolute top-1/2 -right-4 lg:-right-12 transform -translate-y-1/2 p-4 rounded-2xl shadow-xl"
              style={{ background: '#FEF3C7', border: '1px solid #FDE68A', minWidth: '148px' }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: '#92400E' }}>Affordability</div>
              <div className="text-xl font-bold" style={{ fontFamily: 'Manrope', color: '#D97706' }}>68 / 100</div>
              <div className="mt-2 h-1.5 rounded-full" style={{ background: '#FDE68A' }}>
                <div className="h-full rounded-full" style={{ background: '#D97706', width: '68%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-[1440px] mx-auto px-10 xl:px-16 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>How HomeWise works</h2>
          <p className="text-base" style={{ color: '#6B7280' }}>Four steps to your personalized affordability forecast</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', icon: '💰', title: 'Your Finances', desc: 'Input salary, savings, and monthly expenses for an accurate financial snapshot.' },
            { step: '02', icon: '🏠', title: 'Target Property', desc: 'Select city, locality, property type, BHK, and square footage.' },
            { step: '03', icon: '📅', title: 'Set Timeline', desc: 'Choose your target purchase horizon — 5, 10, 15, or 20 years.' },
            { step: '04', icon: '📈', title: 'ML Prediction', desc: 'Get AI-powered price forecasts, affordability scores, and a personalized savings plan.' },
          ].map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="p-6 rounded-2xl relative"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
            >
              <div className="text-xs font-bold mb-4" style={{ color: '#D1D5DB', fontFamily: 'Manrope' }}>{step}</div>
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

