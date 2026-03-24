import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowIcon } from '../components/ui/Icons'

/* ─── MOCK PRODUCT DATABASE ──────────────────────────────── */
const PRODUCT_CATALOG = [
  {
    id: 1,
    name: 'iPhone 15 128GB',
    category: 'Electronics',
    image: '📱',
    trending: true,
    platforms: [
      { name: 'Amazon',   price: 79900, delivery: '1-2 days',  rating: 4.5, reviews: 12400, url: '#' },
      { name: 'Flipkart', price: 78999, delivery: '2-3 days',  rating: 4.4, reviews: 9800,  url: '#' },
      { name: 'Croma',    price: 80900, delivery: '3-4 days',  rating: 4.3, reviews: 3200,  url: '#' },
      { name: 'Reliance', price: 79499, delivery: '2-3 days',  rating: 4.2, reviews: 2100,  url: '#' },
    ],
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    category: 'Electronics',
    image: '📱',
    trending: true,
    platforms: [
      { name: 'Amazon',   price: 74999, delivery: '1-2 days',  rating: 4.4, reviews: 8700,  url: '#' },
      { name: 'Flipkart', price: 72999, delivery: '1-2 days',  rating: 4.5, reviews: 11200, url: '#' },
      { name: 'Samsung',  price: 74999, delivery: '4-5 days',  rating: 4.6, reviews: 5400,  url: '#' },
    ],
  },
  {
    id: 3,
    name: 'Sony 65" Bravia OLED 4K',
    category: 'Electronics',
    image: '🖥️',
    trending: false,
    platforms: [
      { name: 'Amazon',   price: 149900, delivery: '3-5 days', rating: 4.6, reviews: 2300, url: '#' },
      { name: 'Flipkart', price: 144999, delivery: '4-6 days', rating: 4.5, reviews: 1800, url: '#' },
      { name: 'Croma',    price: 152000, delivery: '5-7 days', rating: 4.4, reviews: 900,  url: '#' },
    ],
  },
  {
    id: 4,
    name: 'MacBook Air M3',
    category: 'Computers',
    image: '💻',
    trending: true,
    platforms: [
      { name: 'Amazon',   price: 114900, delivery: '1-2 days', rating: 4.8, reviews: 6700, url: '#' },
      { name: 'Flipkart', price: 112999, delivery: '2-3 days', rating: 4.7, reviews: 4200, url: '#' },
      { name: 'Apple',    price: 119900, delivery: '1-3 days', rating: 4.9, reviews: 9100, url: '#' },
    ],
  },
  {
    id: 5,
    name: 'Nike Air Max 270',
    category: 'Fashion',
    image: '👟',
    trending: false,
    platforms: [
      { name: 'Amazon',   price: 12995, delivery: '2-3 days', rating: 4.3, reviews: 5600, url: '#' },
      { name: 'Flipkart', price: 11999, delivery: '3-4 days', rating: 4.2, reviews: 3400, url: '#' },
      { name: 'Myntra',   price: 11495, delivery: '4-5 days', rating: 4.4, reviews: 8900, url: '#' },
      { name: 'Nike',     price: 12995, delivery: '2-3 days', rating: 4.5, reviews: 2100, url: '#' },
    ],
  },
  {
    id: 6,
    name: 'Dyson V15 Vacuum',
    category: 'Home',
    image: '🧹',
    trending: true,
    platforms: [
      { name: 'Amazon',   price: 52900, delivery: '1-2 days', rating: 4.6, reviews: 3400, url: '#' },
      { name: 'Flipkart', price: 54999, delivery: '3-4 days', rating: 4.5, reviews: 2100, url: '#' },
      { name: 'Dyson',    price: 56900, delivery: '3-5 days', rating: 4.8, reviews: 1200, url: '#' },
    ],
  },
  {
    id: 7,
    name: 'iPad Air M2',
    category: 'Electronics',
    image: '📱',
    trending: false,
    platforms: [
      { name: 'Amazon',   price: 59900, delivery: '1-2 days', rating: 4.7, reviews: 5100, url: '#' },
      { name: 'Flipkart', price: 58999, delivery: '2-3 days', rating: 4.6, reviews: 3900, url: '#' },
      { name: 'Apple',    price: 59900, delivery: '1-3 days', rating: 4.8, reviews: 7200, url: '#' },
    ],
  },
  {
    id: 8,
    name: 'Levi\'s 511 Slim Jeans',
    category: 'Fashion',
    image: '👖',
    trending: false,
    platforms: [
      { name: 'Amazon',   price: 3499, delivery: '2-3 days', rating: 4.2, reviews: 12800, url: '#' },
      { name: 'Flipkart', price: 3199, delivery: '3-4 days', rating: 4.1, reviews: 9200,  url: '#' },
      { name: 'Myntra',   price: 2999, delivery: '4-5 days', rating: 4.3, reviews: 18400, url: '#' },
    ],
  },
]

/* ─── CARD OFFERS ────────────────────────────────────────── */
const CARD_OFFERS = [
  { card: 'HDFC Regalia',   discount: 15, type: 'instant',  color: '#1a3a8f', accent: '#4f8ef7', platforms: ['Amazon'] },
  { card: 'Axis Magnus',    discount: 12, type: 'points',   color: '#2d1b69', accent: '#b04ff7', platforms: ['Amazon', 'Flipkart'] },
  { card: 'ICICI Amazon',   discount: 5,  type: 'cashback', color: '#1a5c3a', accent: '#4ff7a0', platforms: ['Amazon'] },
  { card: 'Kotak 811',      discount: 8,  type: 'instant',  color: '#5c4a1a', accent: '#f7c94f', platforms: ['Flipkart', 'Myntra'] },
  { card: 'SBI SimplyCLICK',discount: 10, type: 'cashback', color: '#3a1a1a', accent: '#f7714f', platforms: ['Amazon', 'Flipkart'] },
  { card: 'Axis Flipkart',  discount: 5,  type: 'instant',  color: '#1a3a5a', accent: '#4fc4f7', platforms: ['Flipkart'] },
]

const PLATFORM_COLORS = {
  Amazon:   { bg: '#1a2a1a', accent: '#4ff7a0' },
  Flipkart: { bg: '#1a1a3a', accent: '#4f8ef7' },
  Myntra:   { bg: '#3a1a2a', accent: '#f74fd8' },
  Croma:    { bg: '#2a1a1a', accent: '#f7714f' },
  Samsung:  { bg: '#1a2a2a', accent: '#4ff7f7' },
  Apple:    { bg: '#2a2a2a', accent: '#aaaaaa' },
  Nike:     { bg: '#2a1a1a', accent: '#f7c94f' },
  Dyson:    { bg: '#1a1a2a', accent: '#b04ff7' },
  Reliance: { bg: '#2a2a1a', accent: '#f7e04f' },
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
  const fee    = Math.round((price - saving) * 0.012)
  return {
    card:       best.card,
    discount:   best.discount,
    saving:     saving - fee,
    fee,
    finalPrice: price - saving + fee,
    type:       best.type,
    accent:     best.accent,
  }
}

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="9" height="9" viewBox="0 0 10 10">
          <polygon points="5,1 6.2,3.8 9.5,4 7,6.2 7.8,9.5 5,8 2.2,9.5 3,6.2 0.5,4 3.8,3.8"
            fill={i <= Math.round(rating) ? '#555' : '#1e1e1e'}/>
        </svg>
      ))}
      <span style={{ fontSize: 10, color: '#444', marginLeft: 2 }}>{rating}</span>
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
              {isDone && <div style={{ fontSize: 11, color: '#444', marginTop: 1 }}>Price fetched · {p.delivery}</div>}
            </div>
            {isDone ? (
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#fff' }}>{fmtPrice(p.price)}</div>
            ) : (
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: '50%', background: '#2a2a2a',
                    animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }}/>
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
  const pc  = PLATFORM_COLORS[platform.name] || { bg: '#111', accent: '#555' }
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0c0c0c',
        border: `1px solid ${isBestDeal ? '#fff' : hovered ? '#2a2a2a' : '#141414'}`,
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
          background: '#fff', color: '#080808',
          fontSize: 9, fontWeight: 800, padding: '5px 14px',
          borderRadius: '0 18px 0 10px', letterSpacing: '0.1em', textTransform: 'uppercase',
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
          <Stars rating={platform.rating}/>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#333' }}>Delivery</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{platform.delivery}</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#2a2a2a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Listed price
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
          {fmtPrice(platform.price)}
        </div>
        <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{platform.reviews.toLocaleString()} reviews</div>
      </div>

      {/* Card offer */}
      {opt.card && (
        <div style={{
          background: '#0a0a0a', border: '1px solid #141414',
          borderRadius: 12, padding: '12px 14px', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: '#444', fontWeight: 600 }}>Best card offer</div>
            <span style={{ fontSize: 9, fontWeight: 700, background: opt.accent + '18', color: opt.accent, border: `1px solid ${opt.accent}33`, borderRadius: 9999, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {opt.type}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 4 }}>{opt.card}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#2a2a2a' }}>Saves you</span>
            <span style={{ color: '#3a6a3a', fontWeight: 700 }}>−{fmtPrice(opt.saving)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
            <span style={{ color: '#2a2a2a' }}>Platform fee (1.2%)</span>
            <span style={{ color: '#444' }}>+{fmtPrice(opt.fee)}</span>
          </div>
        </div>
      )}

      {/* Final optimized price */}
      <div style={{
        background: isBestDeal ? 'rgba(255,255,255,0.04)' : '#0a0a0a',
        border: `1px solid ${isBestDeal ? '#2a2a2a' : '#111'}`,
        borderRadius: 12, padding: '12px 14px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#2a2a2a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            Effective price
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: isBestDeal ? '#fff' : '#888' }}>
            {fmtPrice(opt.finalPrice)}
          </div>
        </div>
        {opt.card && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#2a2a2a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>via proxy</div>
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
          color: isBestDeal ? '#080808' : '#444',
          border: isBestDeal ? 'none' : '1px solid #1e1e1e',
          padding: '10px 16px',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {isBestDeal ? 'Pay Best Price' : 'Pay via Proxy'}
        <span className="arrow-circle" style={{ background: isBestDeal ? '#080808' : '#111', border: isBestDeal ? 'none' : '1px solid #1e1e1e' }}>
          <ArrowIcon size={13} color={isBestDeal ? 'white' : '#555'}/>
        </span>
      </button>
    </div>
  )
}

/* ─── SAVINGS SUMMARY BAR ────────────────────────────────── */
function SavingsSummary({ product, results, bestDeal }) {
  const listedMin = Math.min(...results.map(r => r.price))
  const saving    = listedMin - bestDeal.finalPrice

  return (
    <div style={{
      background: '#0c0c0c', border: '1px solid #1a1a1a',
      borderRadius: 16, padding: '20px 24px',
      marginBottom: 28, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Platforms scanned',  value: results.length,         suffix: '' },
          { label: 'Lowest listed price',value: fmtPrice(listedMin),    suffix: '' },
          { label: 'After optimization', value: fmtPrice(bestDeal.finalPrice), suffix: '', highlight: true },
          { label: 'Total savings',      value: fmtPrice(saving),       suffix: '', green: true },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: 10, color: '#2a2a2a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: 800,
              letterSpacing: '-0.02em',
              color: stat.green ? '#3a6a3a' : stat.highlight ? '#fff' : '#666',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a6a3a' }}/>
        <span style={{ fontSize: 12, color: '#444', fontWeight: 500 }}>via {bestDeal.platform} + {bestDeal.card}</span>
      </div>
    </div>
  )
}

/* ─── TRENDING CHIP ──────────────────────────────────────── */
function TrendingChip({ product, onClick, active }) {
  return (
    <button
      onClick={() => onClick(product)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px 8px 10px',
        background: active ? '#fff' : '#0c0c0c',
        border: `1px solid ${active ? '#fff' : '#1a1a1a'}`,
        borderRadius: 9999, cursor: 'pointer',
        transition: 'all 0.15s', flexShrink: 0,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <span style={{ fontSize: 16 }}>{product.image}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#080808' : '#555', whiteSpace: 'nowrap' }}>
        {product.name}
      </span>
      {product.trending && (
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: active ? '#080808' : '#3a3a3a',
        }}>
          🔥
        </span>
      )}
    </button>
  )
}

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function BestDeal() {
  const navigate = useNavigate()

  const [query,      setQuery      ] = useState('')
  const [phase,      setPhase      ] = useState('idle')  // idle | scanning | results
  const [selected,   setSelected   ] = useState(null)
  const [filtered,   setFiltered   ] = useState([])
  const [showDrop,   setShowDrop   ] = useState(false)
  const [payTarget,  setPayTarget  ] = useState(null)
  const [scanDone,   setScanDone   ] = useState(false)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const scanDuration = selected ? selected.platforms.length * 380 + 600 : 2000

  /* ── search filter ── */
  useEffect(() => {
    if (!query.trim()) { setFiltered([]); setShowDrop(false); return }
    const q = query.toLowerCase()
    const matches = PRODUCT_CATALOG.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    setFiltered(matches)
    setShowDrop(matches.length > 0)
  }, [query])

  function startSearch(product) {
    setSelected(product)
    setQuery(product.name)
    setShowDrop(false)
    setPhase('scanning')
    setScanDone(false)
    setPayTarget(null)
    setTimeout(() => {
      setScanDone(true)
      setTimeout(() => {
        setPhase('results')
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }, 400)
    }, scanDuration)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && filtered.length > 0) startSearch(filtered[0])
    if (e.key === 'Escape') setShowDrop(false)
  }

  function handlePayNow(platform, opt) {
    setPayTarget({ platform, opt })
    navigate('/pay')
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
  if (selected) {
    const allOptions = selected.platforms.map(p => {
      const opt = calcOptimized(p, p.price)
      return { ...opt, platform: p.name, listedPrice: p.price, delivery: p.delivery, rating: p.rating }
    })
    bestDeal = allOptions.reduce((a, b) => a.finalPrice < b.finalPrice ? a : b)
  }

  const bestPriceRaw = selected ? Math.min(...selected.platforms.map(p => p.price)) : 0

  const trendingProducts = PRODUCT_CATALOG.filter(p => p.trending)

  return (
    <div style={{ minHeight: '100vh', background: '#080808', paddingTop: 64 }}>

      {/* ── HERO SECTION ── */}
      <section style={{
        padding: '80px 36px 60px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #111',
      }}>
        {/* Ambient blob */}
        <div style={{ position: 'absolute', top: '-20%', right: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '-10%', left: '0%',  width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)', pointerEvents: 'none' }}/>

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 720 }}>

            {/* Eyebrow */}
            <div className="anim-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', border: '1px solid #1e1e1e', borderRadius: 9999, padding: '5px 14px 5px 5px', marginBottom: 28 }}>
              <span style={{ background: '#1e1e1e', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase' }}>New</span>
              <span style={{ fontSize: 12, color: '#444' }}>BestDeal AI — Price Intelligence Engine</span>
            </div>

            <h1 className="anim-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 20 }}>
              The true lowest price.<br/><span style={{ color: '#2a2a2a' }}>Not just the cheapest site.</span>
            </h1>

            <p className="anim-3" style={{ fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>
              We scan Amazon, Flipkart, Myntra and more in real time — then apply the best card discount from our proxy network to find the absolute lowest effective price.
            </p>

            {/* Search input */}
            <div className="anim-4" style={{ position: 'relative', maxWidth: 560 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 0,
                background: '#0c0c0c', border: `1px solid ${phase === 'scanning' ? '#333' : '#1e1e1e'}`,
                borderRadius: 14, padding: '4px 4px 4px 18px',
                transition: 'border-color 0.2s',
              }}>
                <span style={{ fontSize: 14, color: '#2a2a2a', flexShrink: 0 }}>◈</span>
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
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                {phase !== 'idle' && (
                  <button onClick={reset} style={{ background: 'none', border: 'none', color: '#2a2a2a', cursor: 'pointer', padding: '0 10px', fontSize: 16, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#666'} onMouseLeave={e => e.target.style.color = '#2a2a2a'}>
                    ✕
                  </button>
                )}
                <button
                  className="btn-pill"
                  style={{ flexShrink: 0, fontSize: 13, margin: 0, padding: '10px 10px 10px 18px' }}
                  onClick={() => filtered.length > 0 && startSearch(filtered[0])}
                  disabled={phase === 'scanning'}
                >
                  {phase === 'scanning' ? 'Scanning…' : 'Find Best Deal'}
                  <span className="arrow-circle">
                    {phase === 'scanning' ? (
                      <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #333', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }}/>
                    ) : (
                      <ArrowIcon size={13} color="white"/>
                    )}
                  </span>
                </button>
              </div>

              {/* Dropdown */}
              {showDrop && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                  background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 14,
                  overflow: 'hidden', zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                }}>
                  {filtered.map(p => (
                    <div key={p.id}
                      onClick={() => startSearch(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #111', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#111'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 20 }}>{p.image}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#333', marginTop: 1 }}>{p.category} · {p.platforms.length} platforms</div>
                      </div>
                      {p.trending && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#3a3a3a' }}>🔥 Trending</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="anim-5" style={{ marginTop: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Real-time prices', 'AI card optimization', 'Zero manual effort'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#222"/><path d="M3.5 6.5l2 2 4-4" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, color: '#333' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ── */}
      {phase === 'idle' && (
        <section style={{ padding: '48px 36px', borderBottom: '1px solid #0f0f0f' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: 11, color: '#2a2a2a', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>
              Trending products
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {trendingProducts.map(p => (
                <TrendingChip key={p.id} product={p} onClick={startSearch} active={false}/>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS (only on idle) ── */}
      {phase === 'idle' && (
        <section style={{ padding: '80px 36px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
              How it works
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: 500 }}>
              Four steps to the absolute lowest price
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { step: '01', title: 'Search or select', desc: 'Enter any product name or pick from trending. We know what\'s hot right now.' },
              { step: '02', title: 'We scan all platforms', desc: 'Amazon, Flipkart, Myntra, Croma and more — prices, delivery and ratings fetched in real time.' },
              { step: '03', title: 'We apply card magic', desc: 'Every platform price gets run through our 180+ card network. Best discount wins.' },
              { step: '04', title: 'You see the true price', desc: 'Not just the cheapest site. The cheapest after every possible optimization has been applied.' },
            ].map(s => (
              <div key={s.step} style={{ background: '#0c0c0c', border: '1px solid #141414', borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#222'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#141414'}>
                <div style={{ position: 'absolute', top: 18, right: 20, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '4rem', color: '#0f0f0f', lineHeight: 1, userSelect: 'none' }}>{s.step}</div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#333', fontWeight: 700, marginBottom: 18 }}>{s.step}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#444', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* All products grid */}
          <div style={{ marginTop: 64 }}>
            <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 20 }}>
              All products
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {PRODUCT_CATALOG.map(p => {
                const minPrice = Math.min(...p.platforms.map(pl => pl.price))
                return (
                  <div key={p.id}
                    onClick={() => startSearch(p)}
                    style={{ background: '#0c0c0c', border: '1px solid #141414', borderRadius: 16, padding: '20px 18px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#141414'; e.currentTarget.style.transform = '' }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{p.image}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#2a2a2a', marginBottom: 10 }}>{p.category} · {p.platforms.length} platforms</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                      from {fmtPrice(minPrice)}
                    </div>
                    {p.trending && (
                      <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#111', border: '1px solid #1a1a1a', borderRadius: 9999, padding: '2px 8px', fontSize: 10, color: '#444', fontWeight: 600 }}>
                        🔥 Trending
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SCANNING PHASE ── */}
      {(phase === 'scanning' || (phase === 'results' && selected)) && selected && (
        <section style={{ padding: '56px 36px', maxWidth: 1100, margin: '0 auto' }} ref={resultsRef}>

          {/* Product header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36, padding: '20px 24px', background: '#0c0c0c', border: '1px solid #141414', borderRadius: 16 }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>{selected.image}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', marginBottom: 2 }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: '#333' }}>{selected.category} · Scanning {selected.platforms.length} platforms</div>
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
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #1a1a1a', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }}/>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>
                  {scanDone ? 'Calculating optimized prices…' : 'Fetching real-time prices…'}
                </span>
              </div>
              <ScanAnimation platforms={selected.platforms}/>
            </div>
          )}

          {/* Results */}
          {phase === 'results' && bestDeal && (
            <>
              <SavingsSummary product={selected} results={selected.platforms} bestDeal={bestDeal}/>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {selected.platforms.map(platform => {
                  const opt        = calcOptimized(platform, platform.price)
                  const isBestPrice = platform.price === bestPriceRaw
                  const isBestDeal  = platform.name === bestDeal.platform
                  return (
                    <PlatformResult
                      key={platform.name}
                      platform={platform}
                      isBestPrice={isBestPrice}
                      isBestDeal={isBestDeal}
                      onPayNow={handlePayNow}
                    />
                  )
                })}
              </div>

              {/* Insight bar */}
              <div style={{ marginTop: 20, background: '#0a0a0a', border: '1px solid #111', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                ◎ <strong style={{ color: '#666' }}>AI insight:</strong> {
                  bestDeal.platform === selected.platforms.reduce((a, b) => a.price < b.price ? a : b).name
                    ? `${bestDeal.platform} has both the lowest listed price AND the best card offer. You're already getting the true best deal.`
                    : `${selected.platforms.reduce((a,b) => a.price < b.price ? a : b).name} has the lowest listed price, but after applying ${bestDeal.card} via proxy, ${bestDeal.platform} becomes the cheapest overall.`
                }
              </div>

              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-pill" onClick={() => navigate('/pay')}>
                  Pay Best Price Now
                  <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
                </button>
                <button className="btn-pill ghost" onClick={reset}>Search Another Product</button>
              </div>
            </>
          )}
        </section>
      )}

      {/* CSS for scan ring + dot pulse */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
