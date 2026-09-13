import type { PropertyData } from '@/types'

interface Props {
  data: PropertyData
  onChange: (d: PropertyData) => void
  onNext: () => void
  onBack: () => void
}

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad']

const LOCALITIES: Record<string, string[]> = {
  Bangalore: ['Whitefield', 'Sarjapur Road', 'Electronic City', 'Koramangala', 'Indiranagar', 'Hebbal', 'Yelahanka'],
  Mumbai: ['Bandra', 'Powai', 'Thane', 'Navi Mumbai', 'Malad', 'Andheri', 'Worli'],
  Delhi: ['Dwarka', 'Rohini', 'Vasant Kunj', 'Noida', 'Gurugram', 'Faridabad', 'Greater Noida'],
  Hyderabad: ['Gachibowli', 'Hitech City', 'Banjara Hills', 'Kondapur', 'Miyapur', 'Manikonda'],
  Pune: ['Hinjewadi', 'Baner', 'Kharadi', 'Wakad', 'Hadapsar', 'Viman Nagar'],
  Chennai: ['OMR', 'Sholinganallur', 'Anna Nagar', 'T Nagar', 'Velachery', 'Porur'],
  Kolkata: ['Salt Lake', 'Rajarhat', 'New Town', 'Alipore', 'Ballygunge'],
  Ahmedabad: ['Bodakdev', 'Prahlad Nagar', 'SG Highway', 'Satellite', 'Navrangpura'],
}

const PROPERTY_TYPES = ['Apartment', 'Independent House', 'Villa']
const BHKS = [1, 2, 3, 4]

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none transition-all appearance-none cursor-pointer" style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }} onFocus={e => (e.target.style.borderColor = '#2D6A4F')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')}>
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function PropertyStep({ data, onChange, onNext, onBack }: Props) {
  const set = <K extends keyof PropertyData>(key: K) => (v: PropertyData[K]) => onChange({ ...data, [key]: v })
  const localities = data.city ? LOCALITIES[data.city] ?? [] : []
  const isValid = Boolean(data.city && data.locality && data.propertyType && data.bedrooms && data.area > 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex-1 max-w-2xl">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Tell us about your dream home</h2>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Choose a home profile that suits your future lifestyle.</p>

        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Location</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="City" value={data.city} options={CITIES} onChange={v => { set('city')(v); if (v !== data.city) set('locality')('') }} />
            <SelectField label="Locality" value={data.locality} options={localities} onChange={set('locality')} />
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Property Type</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROPERTY_TYPES.map(type => (
              <button key={type} onClick={() => set('propertyType')(type)} className="py-3 rounded-xl text-sm font-bold transition-all" style={{ background: data.propertyType === type ? '#2D6A4F' : '#F9FAFB', color: data.propertyType === type ? '#FFFFFF' : '#374151', border: `1.5px solid ${data.propertyType === type ? '#2D6A4F' : '#E5E7EB'}`, fontFamily: 'Manrope' }}>{type}</button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF', fontFamily: 'Manrope' }}>Bedrooms</div>
          <div className="grid grid-cols-4 gap-3">
            {BHKS.map(b => (
              <button key={b} onClick={() => set('bedrooms')(b)} className="py-3 rounded-xl text-sm font-bold transition-all" style={{ background: data.bedrooms === b ? '#2D6A4F' : '#F9FAFB', color: data.bedrooms === b ? '#FFFFFF' : '#374151', border: `1.5px solid ${data.bedrooms === b ? '#2D6A4F' : '#E5E7EB'}`, fontFamily: 'Manrope' }}>{b} BHK</button>
            ))}
            <button key={4} onClick={() => set('bedrooms')(4)} className="py-3 rounded-xl text-sm font-bold transition-all" style={{ background: data.bedrooms === 4 ? '#2D6A4F' : '#F9FAFB', color: data.bedrooms === 4 ? '#FFFFFF' : '#374151', border: `1.5px solid ${data.bedrooms === 4 ? '#2D6A4F' : '#E5E7EB'}`, fontFamily: 'Manrope' }}>4+ BHK</button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>Area in sq.ft.</label>
            <input type="number" min="1" value={data.area || ''} onChange={e => set('area')(Number(e.target.value))} placeholder="e.g. 1200" className="w-full px-3 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }} onFocus={e => (e.target.style.borderColor = '#2D6A4F')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B7280', fontFamily: 'Manrope' }}>Current Estimated Property Price (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9CA3AF' }}>₹</span>
              <input type="number" min="0" value={data.currentPrice || ''} onChange={e => set('currentPrice')(Number(e.target.value))} placeholder="e.g. ₹80L" className="w-full pl-8 pr-3 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#1A1A1A' }} onFocus={e => (e.target.style.borderColor = '#2D6A4F')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-80" style={{ background: '#F3F4F6', color: '#374151', fontFamily: 'Manrope' }}>← Back</button>
          <button onClick={onNext} disabled={!isValid} className="flex-[2] py-4 rounded-2xl text-white text-base font-bold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40" style={{ background: '#2D6A4F', fontFamily: 'Manrope' }}>Continue to Timeline →</button>
        </div>
      </div>

      <div className="w-full lg:w-80 xl:w-96">
        <div className="p-6 rounded-2xl sticky top-8" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          <div className="text-sm font-bold mb-5" style={{ fontFamily: 'Manrope', color: '#1A1A1A' }}>Property Summary</div>
          <div className="rounded-xl overflow-hidden mb-5" style={{ aspectRatio: '16/9' }}>
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=340&fit=crop&auto=format" alt="Property preview" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'City / locality', value: `${data.city || '—'} / ${data.locality || '—'}` },
              { label: 'Property type', value: data.propertyType || '—' },
              { label: 'BHK', value: data.bedrooms ? `${data.bedrooms} BHK` : '—' },
              { label: 'Area', value: data.area ? `${data.area.toLocaleString()} sq.ft` : '—' },
              { label: 'Estimated current value', value: data.currentPrice ? `₹${data.currentPrice.toLocaleString('en-IN')}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: value === '—' ? '#D1D5DB' : '#1A1A1A', fontFamily: 'Manrope' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
