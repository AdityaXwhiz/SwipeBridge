import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardPreview from '../components/ui/CardPreview'
import { ArrowIcon } from '../components/ui/Icons'
import api from '../utils/api'

const NETWORKS = ['Visa', 'Mastercard', 'American Express', 'RuPay', 'Discover']
const CATEGORIES = ['Travel', 'Dining', 'Shopping', 'Cashback', 'Fuel', 'Entertainment', 'Lounge Access', 'Forex']
const CARD_TIERS = [
  { id: 'standard', label: 'Standard', desc: '0.5% commission per routed transaction' },
  { id: 'premium', label: 'Premium', desc: '1.2% commission per routed transaction' },
  { id: 'elite', label: 'Elite', desc: '2.0% commission + priority matching' },
]

function Label({ children }) {
  return <label className="pay-input-label">{children}</label>
}

function Input({ value, onChange, placeholder, maxLength, type = 'text', id }) {
  return (
    <input id={id} type={type} value={value} onChange={onChange}
      placeholder={placeholder} maxLength={maxLength} className="pay-input" />
  )
}

function StepDot({ n, current }) {
  const done = current > n
  const active = current === n
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <div className={`step-dot${done || active ? (done ? ' done' : ' active') : ''}`}>
        {done ? '✓' : n}
      </div>
      {n < 3 && <div className={`step-line${done ? ' done' : ''}`} />}
    </div>
  )
}

export default function AddCard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    holderName: '', cardNumber: '', expiry: '', cvv: '', network: '', bankName: '',
    cardNickname: '', categories: [], tier: 'premium', maxMonthly: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleCategory = cat => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }))
  }

  const formatCardNumber = val => {
    const d = val.replace(/\D/g, '').slice(0, 16)
    return d.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = val => {
    const d = val.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.holderName.trim()) e.holderName = 'Required'
    if (form.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid 16-digit number'
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Use MM/YY format'
    if (form.cvv.length < 3) e.cvv = 'Enter 3–4 digit CVV'
    if (!form.network) e.network = 'Select a network'
    if (!form.bankName.trim()) e.bankName = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    if (form.categories.length === 0) e.categories = 'Select at least one category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = async () => {
    if (step === 1 && validateStep1()) { setStep(2); window.scrollTo(0, 0); return }
    if (step === 2 && validateStep2()) {
      setSubmitting(true)
      setServerError('')
      try {
        await api.post('/cards', {
          holderName: form.holderName,
          cardNumber: form.cardNumber,
          expiry: form.expiry,
          cvv: form.cvv,
          network: form.network,
          bankName: form.bankName,
          cardNickname: form.cardNickname,
          categories: form.categories,
          tier: form.tier,
          maxMonthly: form.maxMonthly ? Number(form.maxMonthly) : null,
        })

        setStep(3)
        window.scrollTo(0, 0)
      } catch (err) {
        setServerError(err.response?.data?.message || 'Failed to add card. Please try again.')
        setSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) { setStep(s => s - 1); window.scrollTo(0, 0) }
    else navigate('/')
  }

  const handleReset = () => {
    setForm({ holderName: '', cardNumber: '', expiry: '', cvv: '', network: '', bankName: '', cardNickname: '', categories: [], tier: 'premium', maxMonthly: '' })
    setErrors({})
    setStep(1)
    window.scrollTo(0, 0)
  }

  const TITLES = ['', 'Add your card', 'Configure your listing', 'Card added successfully']
  const SUBS = [
    '',
    "Enter your card details. We encrypt everything — your full number is never stored.",
    'Choose which categories and tier you want to enable for your card.',
    "Your card is live. You'll earn commission whenever someone routes a purchase through it.",
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: 64 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 36px 80px' }}>

        {/* Back + Step dots */}
        <div style={{ marginBottom: 48 }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontFamily: 'DM Sans,sans-serif', padding: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'} onMouseLeave={e => e.currentTarget.style.color = '#333'}>
            ← {step > 1 ? 'Back' : 'Back to home'}
          </button>

          <div className="step-dot-row">
            {[1, 2, 3].map(n => <StepDot key={n} n={n} current={step} />)}
          </div>

          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: 'clamp(2rem,5vw,3.2rem)', letterSpacing: '-0.02em', lineHeight: 1.05, fontStyle: 'italic' }}>
            {TITLES[step]}
          </h1>
          <p style={{ fontSize: 14, color: '#a1a1aa', marginTop: 10 }}>{SUBS[step]}</p>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="ac-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Cardholder name</Label>
                  <Input value={form.holderName} onChange={set('holderName')} placeholder="As on card" />
                  {errors.holderName && <div className="field-error">{errors.holderName}</div>}
                </div>
                <div>
                  <Label>Issuing bank</Label>
                  <Input value={form.bankName} onChange={set('bankName')} placeholder="e.g. HDFC Bank" />
                  {errors.bankName && <div className="field-error">{errors.bankName}</div>}
                </div>
              </div>

              <div>
                <Label>Card number</Label>
                <Input
                  value={form.cardNumber}
                  onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors.cardNumber && <div className="field-error">{errors.cardNumber}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Expiry</Label>
                  <Input
                    value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY" maxLength={5}
                  />
                  {errors.expiry && <div className="field-error">{errors.expiry}</div>}
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input value={form.cvv} onChange={set('cvv')} placeholder="•••" maxLength={4} type="password" />
                  {errors.cvv && <div className="field-error">{errors.cvv}</div>}
                </div>
                <div>
                  <Label>Network</Label>
                  <select value={form.network} onChange={set('network')} className="pay-input">
                    <option value="">Select</option>
                    {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {errors.network && <div className="field-error">{errors.network}</div>}
                </div>
              </div>

              <div>
                <Label>Card nickname <span style={{ color: '#1e1e1e', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></Label>
                <Input value={form.cardNickname} onChange={set('cardNickname')} placeholder="e.g. My travel card" />
              </div>

              <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, color: '#222', flexShrink: 0, marginTop: 1 }}>🔒</span>
                <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6 }}>
                  Your card details are encrypted with AES-256 before storage. We never expose your full number to merchants or other users. Only the last 4 digits are visible on your public listing.
                </p>
              </div>

              <button className="btn-pill" onClick={handleNext} style={{ alignSelf: 'flex-start' }}>
                Continue
                <span className="arrow-circle"><ArrowIcon size={15} color="white" /></span>
              </button>
            </div>

            {/* Live preview */}
            <div style={{ paddingTop: 8, position: 'sticky', top: 88 }}>
              <div style={{ fontSize: 11, color: '#222', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Live preview</div>
              <CardPreview form={form} />
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="ac-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              <div>
                <Label>Discount categories</Label>
                <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 16 }}>Select which deal categories your card offers advantages in.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {CATEGORIES.map(cat => {
                    const active = form.categories.includes(cat)
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)} style={{
                        background: active ? '#fff' : '#0c0c0c',
                        color: active ? '#080808' : '#444',
                        border: active ? 'none' : '1px solid #1e1e1e',
                        borderRadius: 9999, padding: '8px 18px',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s', fontFamily: 'DM Sans,sans-serif',
                      }}>
                        {cat}
                      </button>
                    )
                  })}
                </div>
                {errors.categories && <div className="field-error">{errors.categories}</div>}
              </div>

              <div>
                <Label>Commission tier</Label>
                <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 16 }}>How you want your card listed in the network.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {CARD_TIERS.map(tier => {
                    const active = form.tier === tier.id
                    return (
                      <div key={tier.id} onClick={() => setForm(f => ({ ...f, tier: tier.id }))} style={{
                        background: active ? '#111' : '#0a0a0a',
                        border: active ? '1px solid #2a2a2a' : '1px solid #141414',
                        borderRadius: 14, padding: '16px 20px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: active ? '#fff' : '#555', marginBottom: 3 }}>{tier.label}</div>
                          <div style={{ fontSize: 12, color: '#71717a' }}>{tier.desc}</div>
                        </div>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: active ? 'none' : '1px solid #2a2a2a',
                          background: active ? '#fff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#080808' }} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Monthly spend cap <span style={{ color: '#1e1e1e', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></Label>
                <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 12 }}>Set a max monthly amount you're comfortable routing through this card.</p>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontSize: 14 }}>₹</span>
                  <input
                    type="number"
                    value={form.maxMonthly}
                    onChange={set('maxMonthly')}
                    placeholder="50,000"
                    className="pay-input"
                    style={{ paddingLeft: 32 }}
                  />
                </div>
              </div>

              {serverError && (
                <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f87171' }}>
                  {serverError}
                </div>
              )}

              <button className="btn-pill" onClick={handleNext} disabled={submitting} style={{ alignSelf: 'flex-start', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Saving…' : 'List My Card'}
                {!submitting && <span className="arrow-circle"><ArrowIcon size={15} color="white" /></span>}
              </button>
            </div>

            {/* Preview sticky */}
            <div style={{ paddingTop: 8, position: 'sticky', top: 88 }}>
              <div style={{ fontSize: 11, color: '#222', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Your card</div>
              <CardPreview form={form} />
              <div style={{ marginTop: 20, background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 10, color: '#71717a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Listing summary</div>
                {form.categories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {form.categories.map(c => (
                      <span key={c} style={{ fontSize: 10, background: '#141414', border: '1px solid #1e1e1e', borderRadius: 5, padding: '2px 8px', color: '#a1a1aa' }}>{c}</span>
                    ))}
                  </div>
                )}
                {form.tier && (
                  <div style={{ fontSize: 12, color: '#71717a' }}>
                    Tier: <span style={{ color: '#a1a1aa', fontWeight: 600 }}>{CARD_TIERS.find(t => t.id === form.tier)?.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 20 }}>
            <div className="success-ring" style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid #1e1e1e', background: '#0c0c0c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, fontSize: 28 }}>✓</div>

            <CardPreview form={form} />

            <div style={{ marginTop: 40, maxWidth: 440 }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: '1.6rem', letterSpacing: '-0.02em', marginBottom: 12, fontStyle: 'italic' }}>
                {form.cardNickname || (form.network + ' card')} is now live
              </h2>
              <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.7 }}>
                Your card has been added to the network under the{' '}
                <strong style={{ color: '#666' }}>{CARD_TIERS.find(t => t.id === form.tier)?.label}</strong> tier.
                You'll receive commission notifications by email whenever a transaction routes through it.
              </p>
            </div>

            <div style={{ marginTop: 32, background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 16, padding: '24px 28px', width: '100%', maxWidth: 400, textAlign: 'left' }}>
              {[
                { label: 'Cardholder', value: form.holderName },
                { label: 'Bank', value: form.bankName },
                { label: 'Network', value: form.network },
                { label: 'Categories', value: form.categories.join(', ') || '—' },
                { label: 'Tier', value: CARD_TIERS.find(t => t.id === form.tier)?.label },
                { label: 'Monthly cap', value: form.maxMonthly ? '₹' + Number(form.maxMonthly).toLocaleString('en-IN') : 'Unlimited' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #0f0f0f' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500, maxWidth: 220, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-pill" onClick={handleReset}>
                Add Another Card
                <span className="arrow-circle"><ArrowIcon size={15} color="white" /></span>
              </button>
              <button className="btn-pill ghost" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
