import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowIcon } from '../components/ui/Icons'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

/* ═══════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════ */
const CARD_THEMES = {
  'Visa': {
    bg: 'linear-gradient(135deg, #0a1628 0%, #162d5a 40%, #0d1f42 100%)',
    accent: '#4f8ef7', logoColor: '#fff',
    chipShadow: 'inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.8)',
    networkGrad: 'linear-gradient(135deg, #1a3a8f, #4f8ef7)',
  },
  'Mastercard': {
    bg: 'linear-gradient(135deg, #181924 0%, #1a1028 40%, #0f0a1c 100%)',
    accent: '#f7714f', logoColor: '#e0e0e0',
    chipShadow: 'inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.8)',
    networkGrad: 'linear-gradient(135deg, #eb001b, #f79e1b)',
  },
  'American Express': {
    bg: 'linear-gradient(145deg, #d1d5db 0%, #9ca3af 20%, #f3f4f6 50%, #9ca3af 80%, #6b7280 100%)',
    accent: '#2563eb', logoColor: 'rgba(0,0,0,0.7)', isLight: true,
    chipShadow: 'inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.3)',
    networkGrad: 'linear-gradient(135deg, #006fcf, #00b3ff)',
  },
  'RuPay': {
    bg: 'linear-gradient(135deg, #1f1414 0%, #3a1818 40%, #2a0e0e 100%)',
    accent: '#f74fd8', logoColor: '#e0e0e0',
    chipShadow: 'inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.8)',
    networkGrad: 'linear-gradient(135deg, #e4002b, #00529b)',
  },
  'Discover': {
    bg: 'linear-gradient(135deg, #2d1810 0%, #3a2418 40%, #1a0f0a 100%)',
    accent: '#f7c94f', logoColor: '#d4af37',
    chipShadow: 'inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.8)',
    networkGrad: 'linear-gradient(135deg, #ff6600, #ffa500)',
  },
}

const CATEGORY_ICONS = {
  dining: '🍕', travel: '✈️', fuel: '⛽', shopping: '🛒',
  entertainment: '📱', groceries: '🥬', utilities: '💡',
  health: '💊', education: '📚', insurance: '🛡️',
}

const CATEGORY_LABELS = {
  dining: 'Dining', travel: 'Travel', fuel: 'Fuel', shopping: 'Shopping',
  entertainment: 'Entertainment', groceries: 'Groceries', utilities: 'Utilities',
  health: 'Health', education: 'Education', insurance: 'Insurance',
}

/* ── Mock offers data (will be replaced by API when available) ── */
const MOCK_OFFERS = [
  // Shopping
  { id: 1,  merchant: 'Amazon',      discount: '10% off up to ₹1500',    type: 'Bank Offer',     card: 'HDFC',  category: 'shopping',      tag: 'Hot',          expires: '5 days left', link: 'https://www.amazon.in/gp/browse.html?node=3704997031' },
  { id: 2,  merchant: 'Flipkart',    discount: '12% instant discount',   type: 'Bank Offer',     card: 'ICICI', category: 'shopping',      tag: 'Flash',        expires: '2 days left', link: 'https://www.flipkart.com/offers-store' },
  { id: 3,  merchant: 'Myntra',      discount: '15% off on ₹2999+',      type: 'Merchant Offer', card: 'Any',   category: 'shopping',      tag: 'Popular',      expires: '7 days left', link: 'https://www.myntra.com/offers' },
  { id: 4,  merchant: 'Ajio',        discount: '₹500 off on ₹2500+',     type: 'Bank Offer',     card: 'Axis',  category: 'shopping',      tag: '',             expires: '10 days left', link: 'https://www.ajio.com/offers' },
  { id: 5,  merchant: 'Amazon',      discount: '5% cashback on RuPay',   type: 'Bank Offer',     card: 'SBI',   category: 'shopping',      tag: 'Exclusive',    expires: '8 days left', link: 'https://www.amazon.in/b?node=15441628031' },
  { id: 6,  merchant: 'Flipkart',    discount: '10% off via Axis cards', type: 'Bank Offer',     card: 'Axis',  category: 'shopping',      tag: 'Limited Time', expires: '3 days left', link: 'https://www.flipkart.com/offers-store?otracker=hp_bannerads_slot_1' },
  { id: 7,  merchant: 'Croma',       discount: '₹3000 off on laptops',   type: 'Bank Offer',     card: 'HDFC',  category: 'shopping',      tag: 'Exclusive',    expires: '6 days left', link: 'https://www.croma.com/offers-deals' },
  { id: 8,  merchant: 'Nykaa',       discount: '20% off on ₹1500+',      type: 'Merchant Offer', card: 'Any',   category: 'shopping',      tag: 'New',          expires: '4 days left', link: 'https://www.nykaa.com/offers/deal-of-the-day' },
  // Dining
  { id: 9,  merchant: 'Swiggy',      discount: '20% off up to ₹120',     type: 'Bank Offer',     card: 'SBI',   category: 'dining',        tag: 'New',          expires: '6 days left', link: 'https://www.swiggy.com/offers' },
  { id: 10, merchant: 'Zomato',      discount: '₹100 off on ₹399+',      type: 'Bank Offer',     card: 'HDFC',  category: 'dining',        tag: 'Exclusive',    expires: '8 days left', link: 'https://www.zomato.com/bank-offers' },
  { id: 11, merchant: 'Dominos',     discount: 'Buy 1 Get 1 Free',       type: 'Merchant Offer', card: 'Any',   category: 'dining',        tag: 'Hot',          expires: '4 days left', link: 'https://www.dominos.co.in/menu/deals-and-offers' },
  { id: 12, merchant: 'Swiggy',      discount: 'Flat ₹75 off via ICICI', type: 'Bank Offer',     card: 'ICICI', category: 'dining',        tag: 'Limited Time', expires: '3 days left', link: 'https://www.swiggy.com/offers' },
  { id: 13, merchant: 'Zomato',      discount: '15% off via Axis',       type: 'Bank Offer',     card: 'Axis',  category: 'dining',        tag: '',             expires: '5 days left', link: 'https://www.zomato.com/bank-offers' },
  // Travel
  { id: 14, merchant: 'MakeMyTrip',  discount: '₹2000 off on flights',   type: 'Seasonal Deal',  card: 'ICICI', category: 'travel',        tag: 'Limited Time', expires: '3 days left', link: 'https://www.makemytrip.com/offers/bankoffers.html' },
  { id: 15, merchant: 'Cleartrip',   discount: '₹1000 off via HDFC',     type: 'Bank Offer',     card: 'HDFC',  category: 'travel',        tag: 'Exclusive',    expires: '7 days left', link: 'https://www.cleartrip.com/offers/domestic' },
  { id: 16, merchant: 'IRCTC',       discount: '5% cashback on trains',  type: 'Cashback',       card: 'SBI',   category: 'travel',        tag: '',             expires: '14 days left', link: 'https://www.irctc.co.in/nget/train-search' },
  { id: 17, merchant: 'Goibibo',     discount: 'Flat 12% off on buses',  type: 'Merchant Offer', card: 'Any',   category: 'travel',        tag: 'Popular',      expires: '10 days left', link: 'https://www.goibibo.com/offers/' },
  // Fuel
  { id: 18, merchant: 'IndianOil',   discount: '₹50 cashback per txn',   type: 'Bank Offer',     card: 'HDFC',  category: 'fuel',          tag: '',             expires: '12 days left', link: 'https://iocl.com/loyaltyprogram' },
  { id: 19, merchant: 'BPCL',        discount: '₹75 cashback on ₹2000+', type: 'Bank Offer',     card: 'ICICI', category: 'fuel',          tag: 'New',          expires: '10 days left', link: 'https://www.bharatpetroleum.in/other-services/SmartDrive.aspx' },
  // Entertainment
  { id: 20, merchant: 'BookMyShow',  discount: 'Buy 1 Get 1 on movies',  type: 'Merchant Offer', card: 'Kotak', category: 'entertainment', tag: 'Popular',      expires: '5 days left', link: 'https://in.bookmyshow.com/offers' },
  { id: 21, merchant: 'Netflix',     discount: '₹200 cashback annual',   type: 'Cashback',       card: 'ICICI', category: 'entertainment', tag: 'Exclusive',    expires: '15 days left', link: 'https://www.netflix.com/in/signup/planform' },
  { id: 22, merchant: 'Spotify',     discount: '3 months free premium',  type: 'Merchant Offer', card: 'Any',   category: 'entertainment', tag: 'Limited Time', expires: '5 days left', link: 'https://www.spotify.com/in-en/premium/' },
  // Groceries
  { id: 23, merchant: 'BigBasket',   discount: '15% off on ₹1500+',      type: 'Bank Offer',     card: 'Axis',  category: 'groceries',     tag: '',             expires: '9 days left', link: 'https://www.bigbasket.com/offers/' },
  { id: 24, merchant: 'Zepto',       discount: 'Flat ₹75 off on ₹599+',  type: 'Merchant Offer', card: 'Any',   category: 'groceries',     tag: 'Hot',          expires: '3 days left', link: 'https://www.zeptonow.com/' },
]

const MOCK_RECOMMENDATIONS = [
  {
    name: 'HDFC Infinia',
    network: 'Visa',
    bank: 'HDFC Bank',
    benefits: ['5X rewards on travel', '10X on dining', 'Airport lounge access', 'Golf program'],
    reason: 'You spend heavily on dining & travel — this card maximizes those categories',
    annualFee: '₹12,500',
    rewardRate: '3.3%',
    applyLink: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card',
  },
  {
    name: 'SBI SimplyCLICK',
    network: 'Visa',
    bank: 'SBI',
    benefits: ['10X on online shopping', '5X on movies', 'Amazon vouchers', 'No fuel surcharge'],
    reason: 'Missing a dedicated online shopping card — this fills the gap',
    annualFee: '₹499',
    rewardRate: '2.5%',
    applyLink: 'https://www.sbicard.com/en/personal/credit-cards/shopping/simplyclick-sbi-card.page',
  },
  {
    name: 'Axis Ace',
    network: 'Visa',
    bank: 'Axis Bank',
    benefits: ['5% on bill payments', '4% on Uber/Swiggy/Zomato', '2% on everything else', 'No annual fee'],
    reason: 'Great all-rounder for everyday spending you\'re not optimizing',
    annualFee: 'Nil',
    rewardRate: '2%',
    applyLink: 'https://www.axisbank.com/retail/cards/credit-card/axis-ace-credit-card',
  },
]

/* ═══════════════════════════════════════════════════════
   ANIMATION WRAPPER
   ═══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   3D WALLET CARD COMPONENT (hooks-safe)
   All hooks are called unconditionally at the top level.
   The glare transform is always computed; visibility is
   controlled via CSS opacity instead of conditional rendering.
   ═══════════════════════════════════════════════════════ */
function WalletCard3D({ card, index, isActive, isFlipped, onClick, onFlip, style }) {
  const ref = useRef(null)
  const theme = CARD_THEMES[card.network] || CARD_THEMES['Visa']
  const isLight = theme.isLight

  /* ── All motion hooks called unconditionally ── */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 })
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['18deg', '-18deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-18deg', '18deg'])
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])

  /* ── Glare background — ALWAYS computed (never conditional) ── */
  const glareBackground = useTransform(
    [glareX, glareY],
    ([xPos, yPos]) => `radial-gradient(circle at ${xPos} ${yPos}, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)`
  )

  /* ── Stable derived values (seeded from card id, not Math.random) ── */
  const stableHash = useMemo(() => {
    const id = card._id || card.lastFour || '0000'
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
    return Math.abs(h)
  }, [card._id, card.lastFour])

  const rewardPoints = (stableHash % 4500) + 500
  const cashbackRate = ((stableHash % 35) / 10 + 0.5).toFixed(1)

  const embossedShadow = isLight
    ? '0 1px 0 rgba(255,255,255,0.7), 0 -1px 0 rgba(0,0,0,0.4)'
    : '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.8)'

  const handleMouseMove = (e) => {
    if (!ref.current || !isActive) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  const categories = card.categories || ['shopping', 'dining']

  return (
    <motion.div
      ref={ref}
      className="wallet-card-3d"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        width: 380,
        height: 230,
        cursor: 'pointer',
        position: 'absolute',
        flexShrink: 0,
        zIndex: isActive ? 100 : 50 - index,
      }}
      animate={{
        scale: isActive ? 1 : 0.88 - index * 0.02,
        y: isActive ? 0 : index * 8,
        x: isActive ? 0 : index * -4,
        rotateZ: isActive ? 0 : index * -1.5,
        opacity: index > 4 ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={isActive ? { scale: 1.03 } : {}}
    >
      <motion.div
        className="card-flipper"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* ── FRONT FACE ── */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: theme.bg,
          border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isActive
            ? `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${theme.accent}15`
            : '0 12px 24px rgba(0,0,0,0.4)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '20px 24px',
          backfaceVisibility: 'hidden',
        }}>
          {/* Noise texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: isLight ? 0.4 : 0.12, pointerEvents: 'none', mixBlendMode: 'overlay',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }} />

          {/* Specular glare — ALWAYS rendered, visibility via opacity */}
          <motion.div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: glareBackground,
            mixBlendMode: isLight ? 'normal' : 'overlay',
            zIndex: 10,
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.3s',
          }} />

          {/* Ambient glow on active */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: 28, pointerEvents: 'none',
            background: `radial-gradient(ellipse at center, ${theme.accent}08 0%, transparent 60%)`,
            filter: 'blur(20px)',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.3s',
          }} />

          {/* Top row: Bank + Network */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <div>
              {card.bankName && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)',
                  fontFamily: 'Outfit, sans-serif',
                }}>{card.bankName}</span>
              )}
              <div style={{
                fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', marginTop: 3,
                color: isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)',
                textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif',
              }}>{card.tier || 'premium'}</div>
            </div>
            <NetworkLogo network={card.network} theme={theme} embossedShadow={embossedShadow} />
          </div>

          {/* EMV Chip */}
          <div style={{
            width: 40, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg, #e3c472 0%, #c19b38 100%)',
            boxShadow: theme.chipShadow,
            position: 'relative', zIndex: 2, overflow: 'hidden', marginTop: 8,
          }}>
            <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.3)', boxShadow: '0 1px 0 rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', top: '70%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.3)', boxShadow: '0 1px 0 rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '30%', width: 1, background: 'rgba(0,0,0,0.3)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: '30%', width: 1, background: 'rgba(0,0,0,0.3)' }} />
          </div>

          {/* Bottom: Number, Name, Expiry */}
          <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
            <div style={{
              fontFamily: '"SF Mono", "OCR A Std", "Courier New", monospace',
              fontSize: 16, letterSpacing: '0.18em',
              color: theme.logoColor, textShadow: embossedShadow,
              marginBottom: 10,
            }}>
              •••• •••• •••• {card.lastFour}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 7, color: isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: 2 }}>CARD HOLDER</div>
                <div style={{
                  fontFamily: '"Cormorant Garamond", serif', fontSize: 14, fontWeight: 600,
                  color: theme.logoColor, textShadow: embossedShadow,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{card.cardNickname || card.holderName || 'YOUR NAME'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 7, color: isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: 2 }}>VALID THRU</div>
                <div style={{
                  fontFamily: '"SF Mono", "OCR A Std", "Courier New", monospace', fontSize: 13,
                  color: theme.logoColor, textShadow: embossedShadow,
                }}>{card.expiry}</div>
              </div>
            </div>
          </div>

          {/* Flip hint — always rendered, visibility via opacity */}
          <div style={{
            position: 'absolute', bottom: 8, right: 12, fontSize: 9,
            color: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.12)',
            fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: 4, zIndex: 20,
            opacity: isActive ? 1 : 0, transition: 'opacity 0.3s',
            pointerEvents: isActive ? 'auto' : 'none',
          }}>
            <span onClick={(e) => { e.stopPropagation(); onFlip?.() }}
              style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: 4, background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            >↻ Flip</span>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: theme.bg,
          border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isActive
            ? `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${theme.accent}15`
            : '0 12px 24px rgba(0,0,0,0.4)',
          overflow: 'hidden', padding: '20px 24px',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          {/* Noise texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: isLight ? 0.4 : 0.12, pointerEvents: 'none', mixBlendMode: 'overlay',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }} />

          {/* Magnetic stripe */}
          <div style={{
            position: 'absolute', top: 20, left: 0, right: 0, height: 36,
            background: isLight ? 'rgba(0,0,0,0.6)' : '#111',
          }} />

          {/* CVV + Benefits */}
          <div style={{ marginTop: 62, position: 'relative', zIndex: 2 }}>
            {/* CVV */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                borderRadius: 6, padding: '6px 14px', flex: 1,
              }}>
                <div style={{ fontSize: 8, color: isLight ? '#666' : '#555', letterSpacing: '0.1em', marginBottom: 2 }}>CVV</div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.25em', color: isLight ? '#000' : '#fff' }}>•••</div>
              </div>
              <div style={{
                background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                borderRadius: 6, padding: '6px 14px',
              }}>
                <div style={{ fontSize: 8, color: isLight ? '#666' : '#555', letterSpacing: '0.1em', marginBottom: 2 }}>POINTS</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>{rewardPoints.toLocaleString()}</div>
              </div>
            </div>

            {/* Reward categories */}
            <div style={{ fontSize: 8, color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
              REWARD CATEGORIES
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {categories.map(cat => (
                <span key={cat} style={{
                  fontSize: 9, padding: '3px 8px', borderRadius: 6,
                  background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
                  color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
                  fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                }}>
                  {CATEGORY_ICONS[cat] || '◎'} {CATEGORY_LABELS[cat] || cat}
                </span>
              ))}
            </div>

            {/* Cashback rate */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', borderRadius: 8,
              background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 10, color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>Cashback Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>{cashbackRate}%</span>
            </div>
          </div>

          {/* Flip back hint */}
          <div style={{
            position: 'absolute', bottom: 8, right: 12, fontSize: 9,
            color: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.12)',
            fontFamily: 'Outfit, sans-serif',
          }}>
            <span onClick={(e) => { e.stopPropagation(); onFlip?.() }}
              style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: 4, background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            >↻ Front</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Network logo sub-component ── */
function NetworkLogo({ network, theme, embossedShadow }) {
  const isLight = theme.isLight
  if (network === 'Visa') return (
    <div style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '-0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>VISA</div>
  )
  if (network === 'Mastercard') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: -10 }} />
    </div>
  )
  if (network === 'American Express') return (
    <div style={{ fontSize: 13, fontWeight: 900, color: '#2a3a5a', border: '1px solid #4a5a7a', padding: '2px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.4)', textShadow: embossedShadow }}>AMEX</div>
  )
  if (network === 'RuPay') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.03em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
        <span style={{ color: '#00529b' }}>Ru</span><span style={{ color: '#e4002b' }}>Pay</span>
      </span>
    </div>
  )
  if (network === 'Discover') return (
    <div style={{ fontSize: 14, fontWeight: 900, color: '#ff6600', letterSpacing: '0.04em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>DISCOVER</div>
  )
  return <div style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>{network}</div>
}

/* ═══════════════════════════════════════════════════════
   CARD DETAIL PANEL
   ═══════════════════════════════════════════════════════ */
function CardDetailPanel({ card, onClose }) {
  const theme = CARD_THEMES[card.network] || CARD_THEMES['Visa']
  const categories = card.categories || ['shopping', 'dining']

  /* Stable values from card id */
  const stableHash = useMemo(() => {
    const id = card._id || card.lastFour || '0000'
    let h = 0
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
    return Math.abs(h)
  }, [card._id, card.lastFour])

  const rewardPoints = (stableHash % 4500) + 500
  const cashbackRate = ((stableHash % 35) / 10 + 0.5).toFixed(1)

  const bestUseCases = {
    shopping: ['Amazon', 'Flipkart', 'Myntra'],
    dining: ['Swiggy', 'Zomato', 'Dineout'],
    travel: ['MakeMyTrip', 'Yatra', 'IRCTC'],
    fuel: ['IndianOil', 'BPCL', 'HP'],
    entertainment: ['BookMyShow', 'PVR', 'Netflix'],
    groceries: ['BigBasket', 'JioMart', 'Blinkit'],
  }

  const cardOffers = MOCK_OFFERS.filter(o =>
    categories.some(cat => cat === o.category) ||
    o.card === card.bankName?.split(' ')[0]
  ).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="card-detail-panel"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 500, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
            {card.cardNickname || card.holderName || 'Card Details'}
          </div>
          <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
            {card.bankName || 'Bank'} · {card.network} · {card.tier || 'Premium'}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid #1a1a1a',
          borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a1a1aa', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
        }}
          onMouseEnter={(e) => { e.target.style.borderColor = '#333'; e.target.style.color = '#999' }}
          onMouseLeave={(e) => { e.target.style.borderColor = '#1a1a1a'; e.target.style.color = '#555' }}
        >✕</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Reward Points', value: rewardPoints.toLocaleString(), icon: '✦' },
          { label: 'Cashback Rate', value: `${cashbackRate}%`, icon: '◎' },
          { label: 'Card Type', value: card.tier || 'Premium', icon: '◆' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#080808', border: '1px solid #121212', borderRadius: 12, padding: '14px 16px',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#222'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#121212'}
          >
            <div style={{ fontSize: 16, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 9, color: '#71717a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>{stat.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Reward Categories */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
          Reward Categories
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <div key={cat} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: '#080808', border: '1px solid #151515', borderRadius: 10,
              fontSize: 12, color: '#888', fontFamily: 'Outfit, sans-serif',
            }}>
              <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat] || '◎'}</span>
              {CATEGORY_LABELS[cat] || cat}
            </div>
          ))}
        </div>
      </div>

      {/* Best Use Cases */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
          ✦ Best Use Cases
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {categories.map(cat => (
            bestUseCases[cat] && (
              <div key={cat} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: '#080808', border: '1px solid #121212', borderRadius: 10,
              }}>
                <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat]}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#888', fontFamily: 'Outfit, sans-serif' }}>{CATEGORY_LABELS[cat]}</div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 1 }}>{bestUseCases[cat].join(' · ')}</div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Current Offers */}
      {cardOffers.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
            Current Offers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cardOffers.map(offer => (
              <div key={offer.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#080808', border: '1px solid #121212', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[offer.category] || '◎'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>{offer.merchant}</div>
                    <div style={{ fontSize: 10, color: '#71717a' }}>{offer.type}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3a6a3a', fontFamily: 'Outfit, sans-serif' }}>{offer.discount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function OfferCard({ offer, index, isMatched }) {
  const [hovered, setHovered] = useState(false)

  const tagColors = {
    'Hot':          { color: '#f7714f', bg: 'rgba(247,113,79,0.08)' },
    'New':          { color: '#4f8ef7', bg: 'rgba(79,142,247,0.08)' },
    'Flash':        { color: '#f7c94f', bg: 'rgba(247,201,79,0.08)' },
    'Popular':      { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    'Exclusive':    { color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
    'Limited Time': { color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
  }

  const tagStyle = tagColors[offer.tag] || { color: '#f7c94f', bg: 'rgba(247,201,79,0.08)' }

  const handleClick = (e) => {
    e.stopPropagation()
    if (offer.link) {
      window.open(offer.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Outer clickable wrapper — plain div so clicks are never intercepted by framer motion */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role={offer.link ? 'link' : undefined}
        tabIndex={offer.link ? 0 : undefined}
        onKeyDown={(e) => { if (e.key === 'Enter' && offer.link) handleClick(e) }}
        style={{
          background: hovered ? '#0c0c0c' : '#080808',
          border: `1px solid ${hovered ? (isMatched ? '#1a3a2a' : '#222') : '#121212'}`,
          borderRadius: 14, padding: '16px 18px',
          cursor: offer.link ? 'pointer' : 'default',
          transition: 'all 0.25s cubic-bezier(0.23,1,0.32,1)',
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative', overflow: 'hidden',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Matched glow accent — non-interactive */}
        {isMatched && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #34d399, transparent)',
            opacity: hovered ? 0.6 : 0.25, transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }} />
        )}

        {/* Tag badge — non-interactive */}
        {offer.tag && (
          <div style={{
            position: 'absolute', top: 8, right: 10, fontSize: 8, fontWeight: 700,
            color: tagStyle.color, background: tagStyle.bg,
            padding: '2px 8px', borderRadius: 6, letterSpacing: '0.08em', textTransform: 'uppercase',
            fontFamily: 'Outfit, sans-serif', pointerEvents: 'none',
          }}>{offer.tag}</div>
        )}

        {/* Matched indicator — non-interactive */}
        {isMatched && !offer.tag && (
          <div style={{
            position: 'absolute', top: 8, right: 10, fontSize: 8, fontWeight: 700,
            color: '#34d399', background: 'rgba(52,211,153,0.08)',
            padding: '2px 8px', borderRadius: 6, letterSpacing: '0.08em', textTransform: 'uppercase',
            fontFamily: 'Outfit, sans-serif', pointerEvents: 'none',
          }}>For You</div>
        )}

        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: '#0d0d0d', border: '1px solid #1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          pointerEvents: 'none',
        }}>
          {CATEGORY_ICONS[offer.category] || '◎'}
        </div>

        <div style={{ flex: 1, minWidth: 0, pointerEvents: 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', fontFamily: 'Outfit, sans-serif' }}>{offer.merchant}</div>
          <div style={{ fontSize: 11, color: '#71717a', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
            {offer.card && offer.card !== 'Any' ? `Use ${offer.card} card · ` : ''}{offer.type}
          </div>
          {/* Tap hint — visible on hover */}
          <div style={{
            fontSize: 10, color: '#34d399', marginTop: 4, fontFamily: 'Outfit, sans-serif',
            opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(4px)',
            transition: 'all 0.25s cubic-bezier(0.23,1,0.32,1)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            Tap to apply <span style={{ fontSize: 12 }}>→</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, pointerEvents: 'none' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', fontFamily: 'Outfit, sans-serif' }}>{offer.discount}</div>
          <div style={{ fontSize: 9, color: '#71717a', marginTop: 2 }}>{offer.expires}</div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   RECOMMENDATION CARD
   ═══════════════════════════════════════════════════════ */
function RecommendationCard({ rec, index }) {
  const theme = CARD_THEMES[rec.network] || CARD_THEMES['Visa']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      style={{
        background: '#0a0a0a', border: '1px solid #121212', borderRadius: 18,
        overflow: 'hidden', transition: 'all 0.3s',
      }}
      whileHover={{ borderColor: '#222', y: -3 }}
    >
      {/* Mini card preview */}
      <div style={{
        height: 80, background: theme.bg, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic' }}>{rec.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{rec.bank}</div>
        </div>
        <NetworkLogo network={rec.network} theme={theme} embossedShadow="" />
      </div>

      <div style={{ padding: '18px 20px' }}>
        {/* Benefits */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {rec.benefits.slice(0, 3).map((b, i) => (
            <span key={i} style={{
              fontSize: 10, padding: '4px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid #151515',
              color: '#666', fontFamily: 'Outfit, sans-serif',
            }}>✓ {b}</span>
          ))}
        </div>

        {/* Why recommended */}
        <div style={{
          fontSize: 11, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 14,
          padding: '10px 12px', background: '#080808', borderRadius: 8,
          borderLeft: `2px solid ${theme.accent}`,
        }}>
          💡 {rec.reason}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>Annual Fee</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#888', fontFamily: 'Outfit, sans-serif' }}>{rec.annualFee}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#71717a', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>Reward Rate</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3a6a3a', fontFamily: 'Outfit, sans-serif' }}>{rec.rewardRate}</div>
          </div>
          <button
            className="btn-pill"
            style={{ padding: '6px 12px 6px 14px', fontSize: 11 }}
            onClick={() => window.open(rec.applyLink, '_blank')}
          >
            Apply <span className="arrow-circle" style={{ width: 20, height: 20, fontSize: 10 }}>→</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN: CARDS DECK PAGE
   ═══════════════════════════════════════════════════════ */
export default function CardsDeck() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState({})
  const [selectedCardIndex, setSelectedCardIndex] = useState(null)
  const [offers, setOffers] = useState([])
  const [activeOfferFilter, setActiveOfferFilter] = useState('all')
  const deckRef = useRef(null)

  /* ── All motion hooks at top level, unconditionally ── */
  const dragX = useMotionValue(0)

  /* ── Fetch cards + offers ── */
  useEffect(() => {
    api.get('/cards')
      .then(r => setCards(r.data.cards || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    api.get('/offers')
      .then(r => {
        const raw = r.data.offers || []
        /* Normalize API response to ensure consistent shape */
        const normalized = raw.map(o => ({
          id:       o.id || o._id || Math.random(),
          merchant: o.merchant || '',
          discount: o.discount || '',
          type:     o.type || 'Bank Offer',
          card:     o.card || o.bank || 'Any Card',
          category: (o.category || '').toLowerCase(),
          tag:      o.tag || '',
          expires:  o.expires || '',
          link:     o.link || '',
        }))
        setOffers(normalized)
      })
      .catch(() => setOffers(MOCK_OFFERS))
  }, [])

  const displayOffers = offers.length > 0 ? offers : MOCK_OFFERS

  /* ── Derive the selected card object from index (stable reference) ── */
  const selectedCard = selectedCardIndex !== null ? cards[selectedCardIndex] || null : null
  const activeCard = cards[activeCardIndex] || null

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    setActiveCardIndex(i => {
      if (i < cards.length - 1) return i + 1
      return i
    })
  }, [cards.length])

  const goPrev = useCallback(() => {
    setActiveCardIndex(i => {
      if (i > 0) return i - 1
      return i
    })
  }, [])

  /* ── Keyboard nav ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      if (e.key === 'Escape') { setSelectedCardIndex(null); setFlippedCards({}) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  /* ── Flip toggle ── */
  const toggleFlip = useCallback((idx) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }))
  }, [])

  /* ── Drag handler ── */
  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -80) goNext()
    else if (info.offset.x > 80) goPrev()
  }, [goNext, goPrev])

  /* ── Offer personalization: match against ACTIVE card (updates on swipe) ── */
  const activeCardBank = useMemo(() => {
    if (!activeCard) return ''
    return (activeCard.bankName || '').toLowerCase().replace(/\s*(bank|card)\s*/gi, '').trim()
  }, [activeCard])

  const { cardSpecificOffers, generalOffers } = useMemo(() => {
    const applyCategory = (list) => {
      if (activeOfferFilter === 'all') return list
      return list.filter(o => (o.category || '').toLowerCase() === activeOfferFilter.toLowerCase())
    }

    /* No active card → everything is "general" */
    if (!activeCardBank) {
      return {
        cardSpecificOffers: [],
        generalOffers: applyCategory(displayOffers),
      }
    }

    const matched = []
    const general = []

    displayOffers.forEach(o => {
      const offerBank = (o.card || '').toLowerCase().replace(/\s*(bank|card)\s*/gi, '').trim()
      /* Match: offer is for the active card's bank, or offer is universal ("any") */
      const isBankMatch = offerBank && offerBank !== 'any' &&
        (activeCardBank.includes(offerBank) || offerBank.includes(activeCardBank))

      if (isBankMatch) {
        matched.push(o)
      } else {
        general.push(o)
      }
    })

    return {
      cardSpecificOffers: applyCategory(matched),
      generalOffers: applyCategory(general),
    }
  }, [displayOffers, activeCardBank, activeOfferFilter])

  /* Combined for backward compat — card-specific first */
  const filteredOffers = [...cardSpecificOffers, ...generalOffers]

  /* ── Smart optimization ── */
  const optimizations = useMemo(() => {
    if (cards.length === 0) return []
    return cards.map(c => {
      const theme = CARD_THEMES[c.network] || CARD_THEMES['Visa']
      const cats = c.categories || ['shopping']
      const catLabel = cats.map(cat => CATEGORY_LABELS[cat] || cat).join(', ')
      const matchingOffer = displayOffers.find(o =>
        cats.includes(o.category) || o.card === c.bankName?.split(' ')[0]
      )
      return {
        card: c,
        theme,
        recommendation: matchingOffer
          ? `Use ${c.cardNickname || c.bankName || c.network} for ${matchingOffer.discount} on ${matchingOffer.merchant}`
          : `Use ${c.cardNickname || c.bankName || c.network} for best ${catLabel} rewards`,
        category: catLabel,
      }
    })
  }, [cards, displayOffers])

  /* ── Combined savings strategy ── */
  const savingsStrategies = [
    { icon: '🏆', title: 'Stack Cashback + Bank Offers', desc: 'Combine card cashback with merchant bank offers for up to 25% savings', saving: '₹2,400/mo' },
    { icon: '🔄', title: 'Rotate Cards by Category', desc: 'Use different cards for different spending categories to maximize rewards', saving: '₹1,800/mo' },
    { icon: '⚡', title: 'Seasonal Deal Stacking', desc: 'Time purchases with seasonal sales + card offers for maximum discount', saving: '₹3,200/mo' },
  ]

  /* ── Categories user is missing ── */
  const allCoveredCategories = useMemo(() => new Set(cards.flatMap(c => c.categories || [])), [cards])
  const missingCategories = useMemo(
    () => Object.keys(CATEGORY_LABELS).filter(cat => !allCoveredCategories.has(cat)),
    [allCoveredCategories]
  )

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#000' }}>
      {/* Ambient blobs */}
      <div className="ambient-glow" style={{ width: 500, height: 500, top: '10%', right: '-10%', background: '#4f8ef7' }} />
      <div className="ambient-glow" style={{ width: 400, height: 400, bottom: '20%', left: '-5%', background: '#f74fd8', animationDelay: '7s' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 36px 80px' }}>

        {/* ═══ HERO SECTION ═══ */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: '"Cormorant Garamond", serif', fontWeight: 500,
                fontSize: '2.2rem', letterSpacing: '-0.02em', lineHeight: 1.1, fontStyle: 'italic',
              }}>
                Cards Deck
              </h1>
              <p style={{ fontSize: 14, color: '#a1a1aa', marginTop: 8, fontFamily: 'Outfit, sans-serif', maxWidth: 420 }}>
                Your premium digital wallet. Swipe, explore, and optimize every card for maximum value.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-pill ghost" onClick={() => navigate('/add-card')}>+ Add Card</button>
              <button className="btn-pill" onClick={() => navigate('/pay')}>
                Pay Now <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* ═══ CARD DECK SECTION ═══ */}
        <Reveal delay={0.1}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>
              YOUR WALLET
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div className="scan-ring" style={{ width: 40, height: 40 }} />
              </div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', background: '#0a0a0a', border: '1px solid #121212', borderRadius: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
                <div style={{ fontSize: 16, color: '#a1a1aa', marginBottom: 8, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic' }}>No cards in your wallet</div>
                <div style={{ fontSize: 13, color: '#71717a', marginBottom: 24 }}>Add your first card to unlock the full deck experience</div>
                <button className="btn-pill" onClick={() => navigate('/add-card')}>
                  Add Card <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
                </button>
              </div>
            ) : (
              /* ── Grid layout: Deck + Detail stacked vertically ── */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 56,
                  alignItems: 'start',
                }}
                className="cards-deck-wallet-grid"
              >
                {/* Deck Container — contained box, cards overflow clipped at safe boundary */}
                <div style={{ position: 'relative', zIndex: 2, paddingRight: 10, overflow: 'visible' }}>
                  <div
                    ref={deckRef}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 280,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: 10,
                    }}
                  >
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.15}
                      onDragEnd={handleDragEnd}
                      style={{
                        x: dragX,
                        width: 380,
                        height: 230,
                        position: 'relative',
                      }}
                    >
                      {cards.map((card, i) => {
                        const absIdx = Math.abs(i - activeCardIndex)
                        return (
                          <WalletCard3D
                            key={card._id}
                            card={card}
                            index={absIdx}
                            isActive={i === activeCardIndex}
                            isFlipped={!!flippedCards[i]}
                            onFlip={() => toggleFlip(i)}
                            onClick={() => {
                              if (i === activeCardIndex) {
                                setSelectedCardIndex(prev => prev === i ? null : i)
                              } else {
                                setActiveCardIndex(i)
                                setSelectedCardIndex(null)
                              }
                            }}
                            style={{
                              left: '45%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        )
                      })}
                    </motion.div>
                  </div>

                  {/* Navigation dots */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12, position: 'relative', zIndex: 200 }}>
                    {cards.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveCardIndex(i); setSelectedCardIndex(null) }}
                        style={{
                          width: i === activeCardIndex ? 24 : 8,
                          height: 8,
                          borderRadius: 9999,
                          background: i === activeCardIndex ? '#fff' : '#1a1a1a',
                          border: 'none', cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Arrow navigation */}
                  {cards.length > 1 && (
                    <>
                      <button
                        onClick={() => { goPrev(); setSelectedCardIndex(null) }}
                        disabled={activeCardIndex === 0}
                        style={{
                          position: 'absolute', left: -16, top: 130, transform: 'translateY(-50%)',
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#0a0a0a', border: '1px solid #1a1a1a',
                          color: activeCardIndex === 0 ? '#1a1a1a' : '#666',
                          cursor: activeCardIndex === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, transition: 'all 0.2s', zIndex: 200,
                        }}
                      >←</button>
                      <button
                        onClick={() => { goNext(); setSelectedCardIndex(null) }}
                        disabled={activeCardIndex === cards.length - 1}
                        style={{
                          position: 'absolute', right: -16, top: 130, transform: 'translateY(-50%)',
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#0a0a0a', border: '1px solid #1a1a1a',
                          color: activeCardIndex === cards.length - 1 ? '#1a1a1a' : '#666',
                          cursor: activeCardIndex === cards.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, transition: 'all 0.2s', zIndex: 200,
                        }}
                      >→</button>
                    </>
                  )}
                </div>

                {/* Card Detail Panel — fully in flow, no overlap */}
                <div style={{ minWidth: 0, position: 'relative', zIndex: 1, marginTop: 24 }}>
                  <AnimatePresence mode="wait">
                    {selectedCard ? (
                      <CardDetailPanel
                        key={selectedCard._id}
                        card={selectedCard}
                        onClose={() => setSelectedCardIndex(null)}
                      />
                    ) : activeCard ? (
                      <motion.div
                        key={`preview-${activeCardIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={{
                          background: '#0a0a0a', border: '1px solid #121212', borderRadius: 18, padding: '24px 28px',
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'Outfit, sans-serif' }}>
                            SELECTED CARD
                          </div>
                          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 500, fontStyle: 'italic', marginBottom: 6 }}>
                            {activeCard.cardNickname || activeCard.holderName || 'Card'}
                          </div>
                          <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>
                            {activeCard.bankName} · {activeCard.network} · •••• {activeCard.lastFour}
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {(activeCard.categories || ['shopping']).map(cat => (
                              <span key={cat} style={{
                                fontSize: 10, padding: '4px 10px', borderRadius: 8,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid #1a1a1a',
                                color: '#a1a1aa', fontFamily: 'Outfit, sans-serif',
                              }}>
                                {CATEGORY_ICONS[cat] || '◎'} {CATEGORY_LABELS[cat] || cat}
                              </span>
                            ))}
                          </div>

                          <button
                            className="btn-pill"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => setSelectedCardIndex(activeCardIndex)}
                          >
                            View Details <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
                          </button>
                        </div>

                        <div style={{ fontSize: 11, color: '#1a1a1a', textAlign: 'center', marginTop: 12, fontFamily: 'Outfit, sans-serif' }}>
                          Tap card or click to expand · Swipe to browse · Press ↻ to flip
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* ═══ BEST OFFERS RIGHT NOW ═══ */}
        <Reveal delay={0.15}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>👉</span> Best Offers You Can Use Right Now
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'shopping', label: '🛒' },
                  { key: 'dining', label: '🍕' },
                  { key: 'travel', label: '✈️' },
                  { key: 'fuel', label: '⛽' },
                  { key: 'entertainment', label: '📱' },
                  { key: 'groceries', label: '🥬' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setActiveOfferFilter(f.key)}
                    style={{
                      padding: '4px 10px', borderRadius: 8, border: '1px solid',
                      borderColor: activeOfferFilter === f.key ? '#3f3f46' : '#121212',
                      background: activeOfferFilter === f.key ? '#18181b' : 'transparent',
                      color: activeOfferFilter === f.key ? '#e4e4e7' : '#71717a',
                      fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {/* Animated offer sections — smooth transition on card swipe */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCardBank || 'no-card'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Card-Specific Offers — for the active (swiped-to) card */}
                {cardSpecificOffers.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                      fontSize: 12, fontWeight: 600, color: '#34d399', fontFamily: 'Outfit, sans-serif',
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#34d399',
                        boxShadow: '0 0 8px rgba(52,211,153,0.4)',
                      }} />
                      For {activeCard?.bankName || 'Your Card'}
                      {activeCard?.network && (
                        <span style={{ fontSize: 10, color: '#71717a', fontWeight: 500, marginLeft: 2 }}>
                          · {activeCard.network}
                        </span>
                      )}
                      {activeCard?.lastFour && (
                        <span style={{ fontSize: 10, color: '#52525b', fontWeight: 500 }}>
                          ···{activeCard.lastFour}
                        </span>
                      )}
                    </div>
                    <div className="cards-deck-offers-grid">
                      {cardSpecificOffers.map((offer, i) => (
                        <OfferCard key={`matched-${offer.id}`} offer={offer} index={i} isMatched />
                      ))}
                    </div>
                  </div>
                )}

                {/* General Offers — platform-wide deals */}
                {generalOffers.length > 0 && (
                  <div>
                    {cardSpecificOffers.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                        fontSize: 12, fontWeight: 600, color: '#a1a1aa', fontFamily: 'Outfit, sans-serif',
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#52525b',
                        }} />
                        General Offers
                      </div>
                    )}
                    <div className="cards-deck-offers-grid">
                      {generalOffers.map((offer, i) => (
                        <OfferCard key={`general-${offer.id}`} offer={offer} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {filteredOffers.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '40px 0', color: '#71717a', fontSize: 13,
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                    No offers available for this category right now
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* ═══ OPTIMIZATION PANEL ═══ */}
        {optimizations.length > 0 && (
          <Reveal delay={0.2}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>👉</span> Use This Card For Maximum Benefit
              </div>

              <div style={{
                background: '#0a0a0a', border: '1px solid #121212', borderRadius: 18,
                overflow: 'hidden',
              }}>
                {optimizations.map((opt, i) => {
                  const optTheme = opt.theme
                  return (
                    <motion.div
                      key={opt.card._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 22px',
                        borderBottom: i < optimizations.length - 1 ? '1px solid #0e0e0e' : 'none',
                        cursor: 'pointer', transition: 'background 0.2s',
                      }}
                      whileHover={{ backgroundColor: '#0d0d0d' }}
                      onClick={() => { setActiveCardIndex(i); setSelectedCardIndex(i) }}
                    >
                      {/* Mini card indicator */}
                      <div style={{
                        width: 48, height: 30, borderRadius: 6, flexShrink: 0,
                        background: optTheme.bg, position: 'relative', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}>
                          {opt.card.lastFour}
                        </span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#bbb', fontFamily: 'Outfit, sans-serif' }}>
                          {opt.recommendation}
                        </div>
                        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{opt.category}</div>
                      </div>

                      <div style={{
                        padding: '4px 10px', borderRadius: 8,
                        background: `${optTheme.accent}10`, border: `1px solid ${optTheme.accent}20`,
                        fontSize: 10, fontWeight: 700, color: optTheme.accent,
                        fontFamily: 'Outfit, sans-serif',
                      }}>Best Pick</div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        )}

        {/* ═══ COMBINED BENEFIT ENGINE ═══ */}
        <Reveal delay={0.25}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>👉</span> Best Possible Savings Strategy
            </div>

            <div className="cards-deck-strategy-grid">
              {savingsStrategies.map((strategy, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.1, duration: 0.5 }}
                  style={{
                    background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16,
                    padding: '22px 24px', transition: 'all 0.3s', cursor: 'default',
                  }}
                  whileHover={{ borderColor: '#222', y: -2 }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{strategy.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>
                    {strategy.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 14 }}>
                    {strategy.desc}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 8,
                    background: 'rgba(58,106,58,0.08)', border: '1px solid rgba(58,106,58,0.15)',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#3a6a3a', fontFamily: 'Outfit, sans-serif' }}>
                      Potential: {strategy.saving}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ═══ NEW CARD SUGGESTIONS ═══ */}
        <Reveal delay={0.3}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>👉</span> Recommended Cards For You
                </div>
                {missingCategories.length > 0 && (
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 4, fontFamily: 'Outfit, sans-serif' }}>
                    Missing coverage: {missingCategories.slice(0, 4).map(cat => CATEGORY_LABELS[cat]).join(', ')}
                    {missingCategories.length > 4 && ` +${missingCategories.length - 4} more`}
                  </div>
                )}
              </div>
            </div>

            <div className="cards-deck-recs-grid">
              {MOCK_RECOMMENDATIONS.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* ═══ FOOTER CTA ═══ */}
        <Reveal delay={0.35}>
          <div style={{
            textAlign: 'center', padding: '48px 0', borderTop: '1px solid #0e0e0e',
          }}>
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 500, fontStyle: 'italic', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Maximize every transaction
            </div>
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>
              SwipeBridge ensures you always use the optimal card for every purchase.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-pill ghost" onClick={() => navigate('/best-deal')}>BestDeal AI</button>
              <button className="btn-pill" onClick={() => navigate('/pay')}>
                Pay Now <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
              </button>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  )
}
