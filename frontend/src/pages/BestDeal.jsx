import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowIcon } from '../components/ui/Icons'
import { motion, useInView } from 'framer-motion'
import api from '../utils/api'

/* ─── CARD OFFERS (fetched from backend or used as optimization layer) ── */
const CARD_OFFERS = [
  { card: 'HDFC Regalia', discount: 15, type: 'instant', color: '#1a3a8f', accent: '#4f8ef7', platforms: ['Amazon'] },
  { card: 'Axis Magnus', discount: 12, type: 'points', color: '#2d1b69', accent: '#b04ff7', platforms: ['Amazon', 'Flipkart'] },
  { card: 'ICICI Amazon', discount: 5, type: 'cashback', color: '#1a5c3a', accent: '#4ff7a0', platforms: ['Amazon'] },
  { card: 'Kotak 811', discount: 8, type: 'instant', color: '#5c4a1a', accent: '#f7c94f', platforms: ['Flipkart', 'Myntra'] },
  { card: 'SBI SimplyCLICK', discount: 10, type: 'cashback', color: '#3a1a1a', accent: '#f7714f', platforms: ['Amazon', 'Flipkart'] },
  { card: 'Axis Flipkart', discount: 5, type: 'instant', color: '#1a3a5a', accent: '#4fc4f7', platforms: ['Flipkart'] },
]

const PLATFORM_COLORS = {
  Amazon: { bg: '#1a2a1a', accent: '#4ff7a0' },
  Flipkart: { bg: '#1a1a3a', accent: '#4f8ef7' },
  Myntra: { bg: '#3a1a2a', accent: '#f74fd8' },
  Croma: { bg: '#2a1a1a', accent: '#f7714f' },
  Samsung: { bg: '#1a2a2a', accent: '#4ff7f7' },
  Apple: { bg: '#2a2a2a', accent: '#aaaaaa' },
  Nike: { bg: '#2a1a1a', accent: '#f7c94f' },
  Dyson: { bg: '#1a1a2a', accent: '#b04ff7' },
  Reliance: { bg: '#2a2a1a', accent: '#f7e04f' },
}

/* ─── Reveal animation wrapper ── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── HELPERS ────────────────────────────────────────────── */
function fmtPrice(n) {
  return '₹' + n.toLocaleString('en-IN')
}

function calcOptimized(platform, price) {
  const offers = CARD_OFFERS.filter(o => o.platforms.includes(platform.name))
  if (!offers.length) return { discount: 0, saving: 0, finalPrice: price, card: null, type: null }
  const best = offers.reduce((a, b) => (a.discount > b.discount ? a : b))
  const saving = Math.round(price * (best.discount / 100))
  const fee = Math.round((price - saving) * 0.012)
  return {
    card: best.card,
    discount: best.discount,
    saving: saving - fee,
    fee,
    finalPrice: price - saving + fee,
    type: best.type,
    accent: best.accent,
  }
}

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="9" height="9" viewBox="0 0 10 10">
          <polygon points="5,1 6.2,3.8 9.5,4 7,6.2 7.8,9.5 5,8 2.2,9.5 3,6.2 0.5,4 3.8,3.8"
            fill={i <= Math.round(rating) ? '#555' : '#1e1e1e'} />
        </svg>
      ))}
      <span style={{ fontSize: 10, color: '#a1a1aa', marginLeft: 2 }}>{rating}</span>
    </div>
  )
}

/* ─── SCANNING ANIMATION ─────────────────────────────────── */
function ScanAnimation({ platforms }) {
  const [done, setDone] = useState([])

  useEffect(() => {
    platforms.forEach((p, i) => {
      setTimeout(() => setDone(d => [...d, p.name]), 380 * (i + 1))
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {platforms.map(p => {
        const isDone = done.includes(p.name)
        const pc = PLATFORM_COLORS[p.name] || { bg: '#111', accent: '#555' }
        return (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 12,
            background: pc.bg, border: `1px solid ${isDone ? pc.accent + '33' : '#111'}`,
            transition: 'border-color 0.3s',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#111', border: `1px solid ${isDone ? pc.accent + '44' : '#1e1e1e'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: isDone ? pc.accent : '#2a2a2a',
              transition: 'all 0.3s', flexShrink: 0,
            }}>
              {p.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? '#ccc' : '#333' }}>{p.name}</div>
              {isDone && <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 1 }}>Price fetched · {p.delivery}</div>}
            </div>
            {isDone ? (
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: '"Cormorant Garamond", serif', color: '#fff', fontStyle: 'italic' }}>{fmtPrice(p.price)}</div>
            ) : (
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: '50%', background: '#2a2a2a',
                    animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── PLATFORM CARD ──────────────────────────────────────── */
function PlatformResult({ platform, isBestPrice, isBestDeal, rank, onPayNow }) {
  const opt = calcOptimized(platform, platform.price)
  const pc = PLATFORM_COLORS[platform.name] || { bg: '#111', accent: '#555' }
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0a0a0a',
        border: `1px solid ${isBestDeal ? '#fff' : hovered ? '#2a2a2a' : '#121212'}`,
        borderRadius: 18,
        padding: '22px 22px',
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Best deal badge */}
      {isBestDeal && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: '#fff', color: '#000',
          fontSize: 9, fontWeight: 800, padding: '5px 14px',
          borderRadius: '0 18px 0 10px', letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'Outfit, sans-serif',
        }}>
          TRUE BEST DEAL
        </div>
      )}
      {isBestPrice && !isBestDeal && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: '#1a2a1a', color: '#4ff7a0',
          fontSize: 9, fontWeight: 800, padding: '5px 14px',
          borderRadius: '0 18px 0 10px', letterSpacing: '0.1em', textTransform: 'uppercase',
          border: '1px solid #4ff7a033',
          fontFamily: 'Outfit, sans-serif',
        }}>
          LOWEST PRICE
        </div>
      )}

      {/* Platform header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: pc.bg, border: `1px solid ${pc.accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: pc.accent,
          flexShrink: 0,
        }}>
          {platform.name[0]}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ccc' }}>{platform.name}</div>
          <Stars rating={platform.rating} />
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#71717a' }}>Delivery</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>{platform.delivery}</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#71717a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>
          Listed price
        </div>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 500, letterSpacing: '-0.03em', color: '#fff', fontStyle: 'italic' }}>
          {fmtPrice(platform.price)}
        </div>
        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{platform.reviews.toLocaleString()} reviews</div>
      </div>

      {/* Card offer */}
      {opt.card && (
        <div style={{
          background: '#080808', border: '1px solid #121212',
          borderRadius: 12, padding: '12px 14px', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 600 }}>Best card offer</div>
            <span style={{ fontSize: 9, fontWeight: 700, background: opt.accent + '18', color: opt.accent, border: `1px solid ${opt.accent}33`, borderRadius: 9999, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {opt.type}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 4 }}>{opt.card}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#71717a' }}>Saves you</span>
            <span style={{ color: '#3a6a3a', fontWeight: 700 }}>−{fmtPrice(opt.saving)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
            <span style={{ color: '#71717a' }}>Platform fee (1.2%)</span>
            <span style={{ color: '#a1a1aa' }}>+{fmtPrice(opt.fee)}</span>
          </div>
        </div>
      )}

      {/* Final optimized price */}
      <div style={{
        background: isBestDeal ? 'rgba(255,255,255,0.04)' : '#080808',
        border: `1px solid ${isBestDeal ? '#2a2a2a' : '#0e0e0e'}`,
        borderRadius: 12, padding: '12px 14px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#71717a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>
            Effective price
          </div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 500, letterSpacing: '-0.02em', color: isBestDeal ? '#fff' : '#888', fontStyle: 'italic' }}>
            {fmtPrice(opt.finalPrice)}
          </div>
        </div>
        {opt.card && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>via proxy</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3a6a3a' }}>Save {opt.discount}%</div>
          </div>
        )}
      </div>

      <button
        className="btn-pill"
        onClick={() => onPayNow(platform, opt)}
        style={{
          width: '100%', justifyContent: 'center',
          background: isBestDeal ? '#fff' : 'transparent',
          color: isBestDeal ? '#000' : '#444',
          border: isBestDeal ? 'none' : '1px solid #1e1e1e',
          padding: '10px 16px',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {isBestDeal ? 'Pay Best Price' : 'Pay via Proxy'}
        <span className="arrow-circle" style={{ background: isBestDeal ? '#000' : '#111', border: isBestDeal ? 'none' : '1px solid #1e1e1e' }}>
          <ArrowIcon size={13} color={isBestDeal ? 'white' : '#555'} />
        </span>
      </button>
    </div>
  )
}

/* ─── SAVINGS SUMMARY BAR ────────────────────────────────── */
function SavingsSummary({ product, results, bestDeal }) {
  const listedMin = Math.min(...results.map(r => r.price))
  const saving = listedMin - bestDeal.finalPrice

  return (
    <div style={{
      background: '#0a0a0a', border: '1px solid #121212',
      borderRadius: 16, padding: '20px 24px',
      marginBottom: 28, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Platforms scanned', value: results.length, suffix: '' },
          { label: 'Lowest listed price', value: fmtPrice(listedMin), suffix: '' },
          { label: 'After optimization', value: fmtPrice(bestDeal.finalPrice), suffix: '', highlight: true },
          { label: 'Total savings', value: fmtPrice(saving), suffix: '', green: true },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: 10, color: '#71717a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{stat.label}</div>
            <div style={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: 500,
              letterSpacing: '-0.02em', fontStyle: 'italic',
              color: stat.green ? '#3a6a3a' : stat.highlight ? '#fff' : '#666',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a6a3a' }} />
        <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>via {bestDeal.platform} + {bestDeal.card}</span>
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function BestDeal() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState('idle')  // idle | scanning | results
  const [selected, setSelected] = useState(null)
  const [filtered, setFiltered] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [payTarget, setPayTarget] = useState(null)
  const [scanDone, setScanDone] = useState(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  /* ── search filter — live search from API ── */
  useEffect(() => {
    if (!query.trim()) { setFiltered([]); setShowDrop(false); return }
    const timeout = setTimeout(() => {
      api.get(`/products/search?query=${encodeURIComponent(query.trim())}`)
        .then(r => {
          if (r.data.success && r.data.data?.length > 0) {
            setFiltered(r.data.data)
            setShowDrop(true)
          } else {
            setFiltered([])
            setShowDrop(false)
          }
        })
        .catch(() => { setFiltered([]); setShowDrop(false) })
    }, 300) // debounce
    return () => clearTimeout(timeout)
  }, [query])

  async function startSearch(productOrQuery) {
    const q = typeof productOrQuery === 'string' ? productOrQuery : productOrQuery.name
    setQuery(q)
    setShowDrop(false)
    setPhase('scanning')
    setScanDone(false)
    setPayTarget(null)

    // Set a temporary shell while scanning
    setSelected({ name: q, image: '🔍', category: 'Searching...', platforms: [] })

    try {
      const res = await api.get(`/products/search?query=${encodeURIComponent(q)}`)
      if (res.data.success && res.data.data.length > 0) {
        setSelected(res.data.data[0])
        setTimeout(() => {
          setScanDone(true)
          setTimeout(() => {
            setPhase('results')
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
          }, 400)
        }, 800)
      } else {
        alert('No products found. Try a different search term.')
        reset()
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Failed to fetch from API. Is backend running?'
      alert(msg)
      reset()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) startSearch(query.trim())
    if (e.key === 'Escape') setShowDrop(false)
  }

  function handlePayNow(platform, opt) {
    setPayTarget({ platform, opt })
    navigate('/pay', {
      state: {
        amount: opt.finalPrice,
        description: `${selected.name.substring(0, 40)}... (${platform.name})`
      }
    })
  }

  function reset() {
    setQuery('')
    setPhase('idle')
    setSelected(null)
    setScanDone(false)
    setPayTarget(null)
    inputRef.current?.focus()
  }

  /* ── compute best deal ── */
  let bestDeal = null
  if (selected && selected.platforms && selected.platforms.length > 0) {
    const allOptions = selected.platforms.map(p => {
      const opt = calcOptimized(p, p.price)
      return { ...opt, platform: p.name, listedPrice: p.price, delivery: p.delivery, rating: p.rating }
    })
    if (allOptions.length > 0) {
      bestDeal = allOptions.reduce((a, b) => a.finalPrice < b.finalPrice ? a : b)
    }
  }

  const bestPriceRaw = selected ? Math.min(...selected.platforms.map(p => p.price)) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: 64 }}>

      {/* Ambient glow */}
      <div className="ambient-glow" style={{ top: '5%', right: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(79,247,160,0.15), transparent)' }} />

      {/* ── HERO SECTION ── */}
      <section style={{
        padding: '80px 36px 60px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #0e0e0e',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 720 }}>

            {/* Eyebrow */}
            <div className="anim-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 9999, padding: '5px 14px 5px 5px', marginBottom: 28 }}>
              <span style={{ background: '#1a1a1a', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>New</span>
              <span style={{ fontSize: 12, color: '#a1a1aa' }}>BestDeal AI — Price Intelligence Engine</span>
            </div>

            <h1 className="anim-2" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: 20, fontStyle: 'italic' }}>
              The true lowest price.<br /><span style={{ color: '#1a1a1a' }}>Not just the cheapest site.</span>
            </h1>

            <p className="anim-3" style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.7, maxWidth: 520, marginBottom: 36, fontFamily: 'Outfit, sans-serif' }}>
              We scan Amazon in real time using RapidAPI — then apply the best card discount from our proxy network to find your absolute lowest effective price.
            </p>

            {/* Search input */}
            <div className="anim-4" style={{ position: 'relative', maxWidth: 560 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 0,
                background: '#0a0a0a', border: `1px solid ${phase === 'scanning' ? '#333' : '#1a1a1a'}`,
                borderRadius: 14, padding: '4px 4px 4px 18px',
                transition: 'border-color 0.2s',
              }}>
                <span style={{ fontSize: 14, color: '#71717a', flexShrink: 0 }}>◈</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => filtered.length > 0 && setShowDrop(true)}
                  placeholder="Search any product — iPhone 15, MacBook, Nike..."
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    padding: '12px 14px', fontSize: 14, color: '#fff',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                />
                {phase !== 'idle' && (
                  <button onClick={reset} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '0 10px', fontSize: 16, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#666'} onMouseLeave={e => e.target.style.color = '#2a2a2a'}>
                    ✕
                  </button>
                )}
                <button
                  className="btn-pill"
                  style={{ flexShrink: 0, fontSize: 13, margin: 0, padding: '10px 10px 10px 18px' }}
                  onClick={() => query.trim() && startSearch(query.trim())}
                  disabled={phase === 'scanning'}
                >
                  {phase === 'scanning' ? 'Scanning…' : 'Find Best Deal'}
                  <span className="arrow-circle">
                    {phase === 'scanning' ? (
                      <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #333', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <ArrowIcon size={13} color="white" />
                    )}
                  </span>
                </button>
              </div>

              {/* Dropdown */}
              {showDrop && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                  background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 14,
                  overflow: 'hidden', zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                }}>
                  {filtered.map((p, idx) => (
                    <div key={p.id || idx}
                      onClick={() => startSearch(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #0e0e0e', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#111'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 20 }}>{p.image || '📦'}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>{p.category} · {p.platforms?.length || 0} platforms</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="anim-5" style={{ marginTop: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Real-time prices', 'AI card optimization', 'Zero manual effort'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#52525b" /><path d="M3.5 6.5l2 2 4-4" stroke="#a1a1aa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontSize: 12, color: '#71717a' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (only on idle) ── */}
      {phase === 'idle' && (
        <section style={{ padding: '80px 36px', maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>
                How it works
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 500, fontStyle: 'italic' }}>
                Four steps to the absolute lowest price
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="philosophy-grid">
            {[
              { step: '01', title: 'Search or select', desc: 'Enter any product name. We search real-time across platforms.' },
              { step: '02', title: 'Real-time API Scan', desc: 'Authentic data fetched directly from Amazon servers via RapidAPI.' },
              { step: '03', title: 'Smart Discounting', desc: 'The price is analyzed against our 180+ card network for the best offer.' },
              { step: '04', title: 'The True Price', desc: 'See your final cost after all card optimizations applied.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#121212'; e.currentTarget.style.transform = '' }}>
                  <div style={{ position: 'absolute', top: 18, right: 20, fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '4rem', color: '#0e0e0e', lineHeight: 1, userSelect: 'none', fontStyle: 'italic' }}>{s.step}</div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0d0d0d', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#71717a', fontWeight: 700, marginBottom: 18, fontFamily: 'Outfit, sans-serif' }}>{s.step}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Search prompt */}
          <Reveal delay={0.3}>
            <div style={{ marginTop: 64, textAlign: 'center' }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 500, fontStyle: 'italic', marginBottom: 16 }}>
                Try searching for something
              </div>
              <p style={{ fontSize: 14, color: '#a1a1aa', maxWidth: 400, margin: '0 auto 24px' }}>
                Type a product name above — like "iPhone 15" or "MacBook Air" — and let our engine find the true best deal for you.
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* ── SCANNING + RESULTS PHASE ── */}
      {(phase === 'scanning' || (phase === 'results' && selected)) && selected && (
        <section style={{ padding: '56px 36px', maxWidth: 1100, margin: '0 auto' }} ref={resultsRef}>

          {/* Product header */}
          <div style={{ display: 'flex', alignItems: 'start', gap: 24, marginBottom: 36, padding: '24px', background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16 }}>
            <div style={{ width: 80, height: 80, flexShrink: 0, background: '#0d0d0d', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {typeof selected.image === 'string' && selected.image.startsWith('http') ? (
                <img src={selected.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: 40 }}>{selected.image || '📦'}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '1.2rem', letterSpacing: '-0.02em', marginBottom: 2, fontStyle: 'italic' }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: '#4ff7a0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ff7a0', animation: 'pulse 1.5s infinite' }} />
                Real-time data fetched via RapidAPI
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selected.platforms.map(p => {
                const pc = PLATFORM_COLORS[p.name] || { bg: '#111', accent: '#555' }
                return (
                  <div key={p.name} style={{ width: 28, height: 28, borderRadius: 7, background: pc.bg, border: `1px solid ${pc.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: pc.accent }}>
                    {p.name[0]}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scan animation */}
          {phase === 'scanning' && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #1a1a1a', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa', fontFamily: 'Outfit, sans-serif' }}>
                  {scanDone ? 'Calculating optimized prices…' : 'Fetching real-time prices…'}
                </span>
              </div>
              <ScanAnimation platforms={selected.platforms} />
            </div>
          )}

          {/* Results */}
          {phase === 'results' && bestDeal && (
            <>
              <SavingsSummary product={selected} results={selected.platforms} bestDeal={bestDeal} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {selected.platforms.map(platform => {
                  const opt = calcOptimized(platform, platform.price)
                  const isBestPrice = platform.price === bestPriceRaw
                  const isBestDealFlag = platform.name === bestDeal.platform
                  return (
                    <PlatformResult
                      key={platform.name}
                      platform={platform}
                      isBestPrice={isBestPrice}
                      isBestDeal={isBestDealFlag}
                      onPayNow={handlePayNow}
                    />
                  )
                })}
              </div>

              {/* Insight bar */}
              <div style={{ marginTop: 20, background: '#080808', border: '1px solid #0e0e0e', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}>
                ◎ <strong style={{ color: '#666' }}>AI insight:</strong> {
                  bestDeal.platform === selected.platforms.reduce((a, b) => a.price < b.price ? a : b).name
                    ? `${bestDeal.platform} has both the lowest listed price AND the best card offer. You're already getting the true best deal.`
                    : `${selected.platforms.reduce((a, b) => a.price < b.price ? a : b).name} has the lowest listed price, but after applying ${bestDeal.card} via proxy, ${bestDeal.platform} becomes the cheapest overall.`
                }
              </div>

              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-pill" onClick={() => navigate('/pay')}>
                  Pay Best Price Now
                  <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
                </button>
                <button className="btn-pill ghost" onClick={reset}>Search Another Product</button>
              </div>
            </>
          )}
        </section>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
