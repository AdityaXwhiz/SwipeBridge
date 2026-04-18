import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowIcon } from '../components/ui/Icons'
import api from '../utils/api'

const STEPS = [
  { n: 1, label: 'Details' },
  { n: 2, label: 'Card' },
  { n: 3, label: 'Payment' },
  { n: 4, label: 'Done' },
]

const TITLES = ['', 'Payment details', 'Choose your card', 'Confirm & pay', 'Payment successful']
const SUBS = [
  '',
  'Enter the amount and a description for your payment.',
  'Select one of your saved cards to pay with.',
  'Review and pay securely via Razorpay.',
  'Your payment has been processed successfully.',
]

function StepIndicator({ current }) {
  return (
    <div className="step-dot-row">
      {STEPS.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div className={`step-dot${s.n < current ? ' done' : s.n === current ? ' active' : ''}`}>
            {s.n < current ? '✓' : s.n}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line${s.n < current ? ' done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function fireConfetti() {
  const colors = ['#fff', '#888', '#555', '#ccc', '#333', '#444']
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div')
    p.className = 'confetti-piece'
    const size = 5 + Math.random() * 7
    p.style.cssText = `
      left:${Math.random() * 100}vw; top:-20px;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > .5 ? '50%' : '2px'};
      animation:confettiFall ${1.5 + Math.random() * 2}s ${Math.random() * 0.8}s linear both;
      pointer-events:none; z-index:9998;`
    document.body.appendChild(p)
    setTimeout(() => p.remove(), 4000)
  }
}

const surface = { background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 20, padding: '28px' }

const CARD_COLORS = {
  'Visa': '#1a3a8f',
  'Mastercard': '#2d1b69',
  'American Express': '#1a5c3a',
  'RuPay': '#8f3a1a',
  'Discover': '#5a3a1a',
}

export default function PaymentFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [txn, setTxn] = useState(null)

  useEffect(() => {
    api.get('/cards')
      .then(r => {
        const c = r.data.cards || []
        setCards(c)
        if (c.length > 0) setSelectedCard(c[0]._id)
      })
      .catch(() => { })

    // Pre-fill from BestDeal page if state exists
    if (location.state?.amount) {
      setAmount(String(location.state.amount))
    }
    if (location.state?.description) {
      setDescription(location.state.description)
    }
  }, [location.state])

  function goTo(n) {
    setStep(n)
    window.scrollTo(0, 0)
    if (n === 4) fireConfetti()
  }

  /* ── Validate step 1 ── */
  const validateStep1 = () => {
    const e = {}
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt < 1) e.amount = 'Enter a valid amount (min ₹1)'
    if (!description.trim()) e.description = 'Enter a description'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Validate step 2 ── */
  const validateStep2 = () => {
    if (!selectedCard) {
      setErrors({ card: 'Please select a card or add one first' })
      return false
    }
    setErrors({})
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) goTo(2)
    if (step === 2 && validateStep2()) goTo(3)
  }

  /* ── Razorpay Checkout ── */
  const handlePay = async () => {
    setPaying(true)
    setPayError('')

    const card = cards.find(c => c._id === selectedCard)
    const amtNum = parseFloat(amount)

    try {
      // 1. Create order on backend
      const { data } = await api.post('/payment/create-order', {
        amount: amtNum,
        productName: description,
        proxyCard: card ? `${card.bankName} ${card.network}` : 'Direct',
        discountPct: 0,
      })

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'SwipeBridge',
        description: description,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#ffffff', backdrop_color: 'rgba(0,0,0,0.85)' },
        handler: async function (response) {
          // 3. Verify on backend
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              productName: description,
              productPrice: amtNum,
              proxyCard: card ? `${card.bankName} ${card.network}` : 'Direct',
              discountPct: 0,
              paymentMethod: 'razorpay',
            })
            setTxn(verifyRes.data.transaction)
            goTo(4)
          } catch (err) {
            setPayError(err.response?.data?.message || 'Payment verification failed.')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setPayError(response.error?.description || 'Payment failed. Please try again.')
        setPaying(false)
      })
      rzp.open()
    } catch (err) {
      setPayError(err.response?.data?.message || 'Could not initiate payment.')
      setPaying(false)
    }
  }

  const selectedCardObj = cards.find(c => c._id === selectedCard)

  /* ── STEP 1: Amount & Description ── */
  const Step1 = (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, alignItems: 'start' }} className="pay-grid">
      <div style={surface}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Payment Information</div>

        <div style={{ marginBottom: 20 }}>
          <label className="pay-input-label">Amount (₹)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontSize: 16, fontWeight: 700 }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="pay-input"
              style={{ paddingLeft: 32, fontFamily: '"Cormorant Garamond",serif', fontSize: 20, fontWeight: 500, fontStyle: 'italic' }}
            />
          </div>
          {errors.amount && <div className="field-error">{errors.amount}</div>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="pay-input-label">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Sony 65″ OLED TV from Amazon"
            className="pay-input"
          />
          {errors.description && <div className="field-error">{errors.description}</div>}
        </div>

        <button className="btn-pill full" onClick={handleNext}>
          Continue
          <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>How it works</div>
          {[
            { n: '1', text: 'Enter the amount you want to pay' },
            { n: '2', text: 'Select a saved card for the best offer' },
            { n: '3', text: 'Pay securely through Razorpay' },
            { n: '4', text: 'Your payment is confirmed instantly' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#141414', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#a1a1aa', fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>{s.text}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6 }}>🔒 Payments processed securely via Razorpay. PCI-DSS Level 1 compliant.</div>
        </div>
      </div>
    </div>
  )

  /* ── STEP 2: Select Card ── */
  const Step2 = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }} className="pay-grid">
      <div style={surface}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Your saved cards</div>
        <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 20 }}>Select a card for this payment</div>

        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
            <div style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 8 }}>No cards saved yet</div>
            <div style={{ fontSize: 12, color: '#71717a', marginBottom: 20 }}>Add a card first to make payments</div>
            <button className="btn-pill" onClick={() => navigate('/add-card')}>
              Add a Card <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cards.map(c => {
              const active = selectedCard === c._id
              return (
                <div key={c._id} onClick={() => setSelectedCard(c._id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: active ? '#111' : '#0a0a0a',
                  border: active ? '1px solid #2a2a2a' : '1px solid #141414',
                  borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ width: 50, height: 32, borderRadius: 6, background: CARD_COLORS[c.network] || '#1a1a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c.network?.slice(0, 4)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#fff' : '#666' }}>{c.cardNickname || c.holderName}</div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>{c.bankName} · •••• {c.lastFour}</div>
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
        )}
        {errors.card && <div className="field-error" style={{ marginTop: 12 }}>{errors.card}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Payment summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
            <span style={{ color: '#a1a1aa' }}>{description || 'Payment'}</span>
            <span style={{ color: '#666', fontWeight: 600 }}>₹{parseFloat(amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ borderTop: '1px solid #111', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span style={{ color: '#aaa' }}>Total</span>
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, fontWeight: 500, fontStyle: 'italic' }}>₹{parseFloat(amount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {cards.length > 0 && (
          <button className="btn-pill full" onClick={handleNext}>
            Proceed to Payment
            <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
          </button>
        )}
      </div>
    </div>
  )

  /* ── STEP 3: Confirm & Pay ── */
  const Step3 = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }} className="pay-grid">
      <div style={surface}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Confirm payment</div>
        <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 24 }}>Review before paying via Razorpay</div>

       <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '2.4rem', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4, fontStyle: 'italic' }}>
          ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 24 }}>{description}</div>

        {selectedCardObj && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, marginBottom: 24 }}>
            <div style={{ width: 50, height: 32, borderRadius: 6, background: CARD_COLORS[selectedCardObj.network] || '#1a1a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{selectedCardObj.network?.slice(0, 4)}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{selectedCardObj.cardNickname || selectedCardObj.holderName}</div>
              <div style={{ fontSize: 11, color: '#71717a' }}>{selectedCardObj.bankName} · •••• {selectedCardObj.lastFour}</div>
            </div>
          </div>
        )}

        {payError && (
          <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
            {payError}
          </div>
        )}

        <button className="btn-pill full" onClick={handlePay} disabled={paying} style={{ opacity: paying ? 0.6 : 1 }}>
          {paying ? 'Processing…' : `Pay ₹${parseFloat(amount || 0).toLocaleString('en-IN')} Securely`}
          {!paying && <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>}
        </button>
        <div style={{ fontSize: 11, color: '#1e1e1e', textAlign: 'center', marginTop: 10 }}>Powered by Razorpay · PCI-DSS compliant</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#0c0c0c', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Order summary</div>
          {[
            { label: description || 'Payment', val: `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`, c: '#666' },
            { label: 'Card', val: selectedCardObj ? `${selectedCardObj.bankName} · ${selectedCardObj.network}` : '—', c: '#555' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
              <span style={{ color: '#a1a1aa' }}>{r.label}</span><span style={{ color: r.c, fontWeight: 600 }}>{r.val}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #111', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span style={{ color: '#aaa' }}>Total</span>
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, fontWeight: 500, fontStyle: 'italic' }}>₹{parseFloat(amount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: 12, padding: 14, fontSize: 12, color: '#71717a', lineHeight: 1.6 }}>
          🔒 Payment is processed through Razorpay's secure checkout. Your card details are never shared.
        </div>
      </div>
    </div>
  )

  /* ── STEP 4: Success ── */
  const Step4 = (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div className="success-ring" style={{ width: 72, height: 72, borderRadius: '50%', background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 26 }}>✓</div>
      <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: 12, fontStyle: 'italic' }}>Payment successful</h2>
      <p style={{ fontSize: 14, color: '#a1a1aa', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7 }}>
        Your payment of ₹{parseFloat(amount || 0).toLocaleString('en-IN')} has been processed successfully via Razorpay.
      </p>
      <div style={{ background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 16, padding: '24px 28px', maxWidth: 380, margin: '0 auto 36px', textAlign: 'left' }}>
        {[
          ['Order ID', txn?.orderId || '—'],
          ['Description', description || '—'],
          ['Card used', selectedCardObj ? `${selectedCardObj.bankName} ${selectedCardObj.network}` : '—'],
          ['Amount paid', `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`],
          ['Razorpay ID', txn?.razorpayPaymentId || '—'],
        ].map(([l, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid #0f0f0f' : 'none', fontSize: 13 }}>
            <span style={{ color: '#71717a' }}>{l}</span>
            <span style={{ color: '#666', fontWeight: 600, maxWidth: 200, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-pill" onClick={() => navigate('/dashboard')}>
          View Dashboard <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
        </button>
        <button className="btn-pill ghost" onClick={() => { setStep(1); setTxn(null); setAmount(''); setDescription(''); setPayError('') }}>New Payment</button>
      </div>
    </div>
  )

  const stepContent = [null, Step1, Step2, Step3, Step4]

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 36px' }}>

        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, fontFamily: 'DM Sans,sans-serif', padding: 0, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'} onMouseLeave={e => e.currentTarget.style.color = '#333'}>
          ← Back to dashboard
        </button>

        <StepIndicator current={step} />

        <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 8, fontStyle: 'italic' }}>
          {TITLES[step]}
        </h1>
        <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 40 }}>{SUBS[step]}</p>

        {stepContent[step]}
      </div>
    </div>
  )
}
