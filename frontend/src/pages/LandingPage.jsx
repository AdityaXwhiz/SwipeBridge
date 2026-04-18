import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Ticker from '../components/ui/Ticker'
import Footer from '../components/layout/Footer'
import { ArrowIcon, CheckIcon } from '../components/ui/Icons'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

/* ── DATA ── */
const stats = [
  { num: '$2.4M+', label: 'Saved by users this year', sub: 'Across all card categories' },
  { num: '94%', label: 'Average discount captured', sub: 'vs. paying with your own card' },
  { num: '180+', label: 'Premium cards in network', sub: 'Visa, Mastercard & Amex' },
  { num: '12K+', label: 'Active members', sub: 'And growing every week' },
]

const howItWorks = [
  { step: '01', title: 'Browse a deal', desc: "Find an offer — dining, travel, shopping — that requires a premium card you don't own." },
  { step: '02', title: 'We route it', desc: 'Our engine matches your purchase to the optimal card in our network, invisibly.' },
  { step: '03', title: 'You save', desc: 'You pay the discounted price plus a small service fee. We keep the difference as commission.' },
]

const features = [
  { icon: '◈', title: 'Hidden transaction routing', desc: 'Every purchase is routed through real premium card networks with zero visible intermediary.' },
  { icon: '⬡', title: 'Smart card matching', desc: 'AI picks the highest-discount card from 180+ options for every single transaction in real time.' },
  { icon: '⬟', title: 'Usage-based tiers', desc: 'The more you spend through us, the deeper your discounts get. Rewards that actually scale.' },
  { icon: '◉', title: 'Earn as a card holder', desc: "Own a premium card? List it on our platform and earn passive commission every time it's used." },
  { icon: '⊞', title: 'Instant settlement', desc: 'No holds, no delays. Funds clear in seconds across all supported networks.' },
  { icon: '◎', title: 'Full spend analytics', desc: 'See exactly how much you saved per category, per card, per month — in one dashboard.' },
]

const supportedCards = [
  { name: 'Visa Infinite', color: '#1a3a8f', accent: '#4f8ef7', tag: 'Travel' },
  { name: 'Mastercard World', color: '#8b1a1a', accent: '#f7714f', tag: 'Dining' },
  { name: 'Amex Platinum', color: '#1a5c3a', accent: '#4ff7a0', tag: 'Lounge' },
  { name: 'Amex Gold', color: '#5c4a1a', accent: '#f7c94f', tag: 'Shopping' },
  { name: 'Visa Signature', color: '#3a1a8b', accent: '#b04ff7', tag: 'Cashback' },
  { name: 'Mastercard Black', color: '#1a1a1a', accent: '#aaaaaa', tag: 'Premium' },
]

const testimonials = [
  { quote: 'I saved ₹18,000 on a flight booking just by routing through SwipeBridge. Insane value.', name: 'Aryan S.', role: 'Frequent traveller', avatar: 'AS' },
  { quote: "Listed my Amex Platinum and made back the annual fee in two months. Passive income I never expected.", name: 'Priya M.', role: 'Card holder & earner', avatar: 'PM' },
  { quote: "The AI picks the right card every time. I've stopped thinking about which card to use.", name: 'Rohan K.', role: 'Power user', avatar: 'RK' },
]

const trustBadges = ['No card ownership needed', 'Zero hidden fees', 'Cancel anytime']

const philosophyText = "We believe the future of payments isn't about owning every card — it's about accessing every benefit. SwipeBridge is built on a radical idea: that premium card discounts should be available to everyone, not just the privileged few who can afford annual fees."

const numberFacts = [
  { number: '₹0', label: 'Annual fee for users', desc: 'Access every premium card discount without paying a single rupee in membership.' },
  { number: '3.2s', label: 'Average routing time', desc: 'Our engine matches and routes your transaction to the optimal card in seconds.' },
  { number: '99.98%', label: 'Uptime guarantee', desc: 'Enterprise-grade infrastructure ensuring your payments never fail.' },
]


/* ── CRED-style Scroll Highlight Paragraph ── */
function ScrollHighlightParagraph({ text, className = '' }) {
  const containerRef = useRef(null)
  const words = text.split(' ')
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.3"]
  })

  return (
    <div ref={containerRef} className={className} style={{ padding: '120px 0' }}>
      <p style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '-0.01em',
        fontStyle: 'italic',
        maxWidth: 800,
      }}>
        {words.map((word, i) => (
          <ScrollWord
            key={i}
            word={word}
            index={i}
            total={words.length}
            scrollProgress={scrollYProgress}
          />
        ))}
      </p>
    </div>
  )
}

function ScrollWord({ word, index, total, scrollProgress }) {
  const start = index / total
  const end = (index + 1) / total
  const opacity = useTransform(scrollProgress, [start, end], [0.12, 1])
  const color = useTransform(scrollProgress, [start, end], ['#1a1a1a', '#ffffff'])

  return (
    <motion.span style={{ color, opacity, display: 'inline', transition: 'none' }}>
      {word}{' '}
    </motion.span>
  )
}


/* ── Reveal Section Wrapper ── */
function RevealSection({ children, delay = 0, ...props }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}


/* ── Number Counter ── */
function AnimatedNumber({ number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ display: 'inline-block' }}
    >
      {number}
    </motion.span>
  )
}


/* ── CARD COMPONENTS ── */

function RealisticCard({ name, color, accent, tag, index }) {
  const gradients = [
    'linear-gradient(135deg, #1f4287, #071e3d)',
    'linear-gradient(135deg, #2b1010, #8b1a1a)',
    'linear-gradient(135deg, #2f4f4f, #1a5c3a)',
    'linear-gradient(135deg, #d4af37, #855c0b)',
    'linear-gradient(135deg, #533483, #3a1a8b)',
    'radial-gradient(circle at 100% 0%, #333333, #0a0a0a)',
  ]
  const bg = gradients[index % gradients.length] || color;

  return (
    <div style={{
      width: 280, height: 176, borderRadius: 16,
      background: bg,
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 20px 40px rgba(0,0,0,0.6)',
      position: 'relative', overflow: 'hidden',
      padding: '20px 24px', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#fff',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.15), transparent 60%)',
        opacity: 0.8, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(4px)' }}>{tag}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <path d="M8.5 14c-.3-1.6-.3-3.2 0-4.8"></path>
          <path d="M11.5 16.5c-.7-2.3-.7-4.7 0-7"></path>
          <path d="M14.5 19c-1.1-3.2-1.1-6.8 0-10"></path>
          <path d="M17.5 21.5c-1.5-4.2-1.5-8.8 0-13"></path>
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', marginBottom: 16 }}>
        <div style={{ width: 42, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #e5ca77, #d4af37, #b8941e)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.2)' }}>
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
          <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 14, width: 1, background: 'rgba(0,0,0,0.15)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 14, width: 1, background: 'rgba(0,0,0,0.15)' }} />
          <div style={{ position: 'absolute', top: 8, bottom: 8, left: 10, right: 10, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 4 }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: 16, letterSpacing: '0.1em', opacity: 0.9, marginBottom: 4, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
            •••• •••• •••• {3000 + index * 317}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', opacity: 0.85, textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>{name}</div>
        </div>

        <div style={{ position: 'relative' }}>
          {name.includes('Visa') && (
            <div style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 24, letterSpacing: '-0.05em', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>VISA</div>
          )}
          {name.includes('Mastercard') && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: -10, mixBlendMode: 'screen' }} />
            </div>
          )}
          {name.includes('Amex') && (
            <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1, textAlign: 'center', color: '#fff', padding: 4, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4, background: 'rgba(0,0,0,0.2)' }}>AMEX</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepCard({ step, title, desc, index }) {
  return (
    <RevealSection delay={index * 0.1}>
      <div style={{ background: '#0a0a0a', border: '1px solid #151515', borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s, transform 0.3s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#151515'; e.currentTarget.style.transform = '' }}>
        <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: '"Cormorant Garamond",serif', fontWeight: 600, fontSize: '4rem', color: '#0e0e0e', lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none' }}>{step}</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0e0e0e', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 12, color: '#71717a', fontWeight: 700 }}>{step}</div>
        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </RevealSection>
  )
}

function TestimonialCard({ quote, name, role, avatar, index }) {
  return (
    <RevealSection delay={index * 0.12}>
      <div style={{ background: '#0a0a0a', border: '1px solid #151515', borderRadius: 20, padding: '28px', transition: 'border-color 0.3s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#151515'}>
        <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 28, color: '#1e1e1e', marginBottom: 16, lineHeight: 1 }}>"</div>
        <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>{quote}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.05em' }}>{avatar}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#71717a' }}>{role}</div>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}


/* ── PAGE ── */
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#000', paddingTop: 64 }}>

      {/* Ambient glow orbs */}
      <div className="ambient-glow" style={{ top: '10%', right: '15%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,142,247,0.3), transparent)' }} />
      <div className="ambient-glow" style={{ top: '60%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(180,79,247,0.2), transparent)', animationDelay: '-7s' }} />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 36px', position: 'relative', overflow: 'hidden' }}>

        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, width: '100%', maxWidth: 1200, margin: '0 auto', alignItems: 'center', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
          <div>
            <div style={{ pointerEvents: 'auto' }}>
              <div className="anim-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 9999, padding: '5px 14px 5px 5px', marginBottom: 32 }}>
                <span style={{ background: '#1a1a1a', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase' }}>New</span>
                <span style={{ fontSize: 12, color: '#a1a1aa' }}>Credit card proxy platform</span>
              </div>

              <h1 className="anim-2" style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
                Every card's<br />discount.<br /><span style={{ color: '#1a1a1a' }}>Zero cards.</span>
              </h1>

              <p className="anim-3" style={{ marginTop: 28, fontSize: 15, color: '#a1a1aa', lineHeight: 1.7, maxWidth: 380, fontFamily: 'Outfit,sans-serif' }}>
                Access premium credit card discounts without owning them. Our proxy engine routes your purchases through the best card in our network — you save, we earn a small fee.
              </p>

              <div className="anim-4" style={{ marginTop: 36, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-pill" onClick={() => navigate('/add-card')}>
                  Add Your Card &amp; Earn
                  <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
                </button>
                <a href="#how-it-works" style={{ fontSize: 13, color: '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#e4e4e7'} onMouseLeave={e => e.target.style.color = '#a1a1aa'}>
                  See how it works →
                </a>
              </div>

              <div className="anim-5" style={{ marginTop: 44, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                {trustBadges.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckIcon />
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-visual" style={{ position: 'relative', width: '100%', height: 600, perspective: 1200, pointerEvents: 'none', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
            {/* Hero fintech accent visual — blended with overlay */}
            <img src="/hero-fintech.png" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, filter: 'blur(1px)', pointerEvents: 'none', zIndex: 0 }} />
            <motion.div
              className="orbit-track"
              style={{
                position: 'absolute',
                right: -250,
                top: '50%',
                width: 0, height: 0,
                transformStyle: 'preserve-3d',
                pointerEvents: 'auto'
              }}
              animate={{ rotateZ: [0, -360] }}
              transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
            >
              {supportedCards.map((card, i) => {
                const totalCards = supportedCards.length > 10 ? supportedCards.length : 12;
                const angle = i * (360 / totalCards);
                const radius = 550;

                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 0, top: 0,
                      transformOrigin: 'center center',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(-${radius}px) rotate(-80deg)`,
                      willChange: 'transform',
                    }}
                  >
                    <RealisticCard index={i} {...card} />
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── CRED-STYLE PHILOSOPHY / SCROLL HIGHLIGHT ── */}
      <section style={{ padding: '20px 36px', maxWidth: 900, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 0, fontFamily: 'Outfit,sans-serif' }}>Our philosophy</div>
        </RevealSection>
        <ScrollHighlightParagraph text={philosophyText} />
      </section>

      <div className="cinematic-divider" />

      {/* ── STATS ── */}
      <section style={{ padding: '100px 36px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#111', border: '1px solid #111', borderRadius: 20, overflow: 'hidden' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: '#000', padding: '36px 28px' }}>
                <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.6rem,2.5vw,2.4rem)', fontWeight: 600, letterSpacing: '-0.04em', fontStyle: 'italic' }}>
                  <AnimatedNumber number={s.num} />
                </div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 8, fontWeight: 500, fontFamily: 'Outfit,sans-serif' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ── NUMBER FACTS (CRED-style big numbers) ── */}
      <section style={{ padding: '80px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>By the numbers</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 460, fontStyle: 'italic' }}>
              Numbers that speak louder
            </h2>
          </div>
        </RevealSection>
        <div className="philosophy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {numberFacts.map((f, i) => (
            <RevealSection key={i} delay={i * 0.12}>
              <div style={{
                background: '#0a0a0a', border: '1px solid #121212',
                borderRadius: 24, padding: '44px 32px',
                transition: 'border-color 0.3s, transform 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#121212'; e.currentTarget.style.transform = '' }}>
                <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 500, letterSpacing: '-0.04em', marginBottom: 8, fontStyle: 'italic' }}>
                  <AnimatedNumber number={f.number} />
                </div>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#999', letterSpacing: '0.02em' }}>{f.label}</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <div className="cinematic-divider" />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '100px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>How it works</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 460, fontStyle: 'italic' }}>
              Three steps to smarter spending
            </h2>
          </div>
        </RevealSection>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {howItWorks.map((s, i) => <StepCard key={i} index={i} {...s} />)}
        </div>
      </section>

      {/* ── SECOND SCROLL HIGHLIGHT ── */}
      <section style={{ padding: '20px 36px', maxWidth: 900, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 0, fontFamily: 'Outfit,sans-serif' }}>The opportunity</div>
        </RevealSection>
        <ScrollHighlightParagraph text="Every year, millions of rupees in card discounts go unclaimed because people don't own the right cards. SwipeBridge turns unused card benefits into a marketplace — connecting card holders who earn commissions with deal seekers who save money." />
      </section>

      <div className="cinematic-divider" />

      {/* ── SUPPORTED CARDS ── */}
      <section style={{ padding: '100px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 24, padding: '48px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, fontFamily: 'Outfit,sans-serif' }}>Network coverage</div>
                <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 500, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
                  180+ premium cards.<br />One platform.
                </h2>
              </div>
              <button className="btn-pill" onClick={() => navigate('/add-card')}>
                List your card
                <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {supportedCards.map((c, i) => (
                <div key={i} style={{ background: c.color, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.accent, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '2px 6px' }}>{c.tag}</span>
                </div>
              ))}
              <div style={{ borderRadius: 12, padding: '10px 16px', border: '1px dashed #1e1e1e', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#71717a' }}>+ 170 more</span>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '60px 36px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>Platform features</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 480, fontStyle: 'italic' }}>
              Built for card holders &amp; deal seekers
            </h2>
          </div>
        </RevealSection>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {features.map((f, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <div className="feature-card">
                <div style={{ fontSize: 22, marginBottom: 16, color: '#71717a' }}>{f.icon}</div>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <div className="cinematic-divider" />

      {/* ── TRUST SECTION (CRED-style split layout) ── */}
      <section style={{ padding: '100px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="trust-grid">
            <div>
              <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16, fontFamily: 'Outfit,sans-serif' }}>Trust & security</div>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, fontStyle: 'italic', marginBottom: 24 }}>
                Your money.<br />Our obsession<br />with safety.
              </h2>
              <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.7, maxWidth: 400 }}>
                Every transaction is encrypted end-to-end. Your card details are never stored in plain text. We are PCI-DSS Level 1 compliant — the highest standard in payment security.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: '🔒', title: 'AES-256 Encryption', desc: 'Military-grade encryption for all card data at rest and in transit.' },
                { icon: '🛡️', title: 'PCI-DSS Level 1', desc: 'The highest security certification for payment processing.' },
                { icon: '📋', title: 'SOC 2 Compliant', desc: 'Audited data handling practices for enterprise-grade trust.' },
                { icon: '🔐', title: 'Zero Storage', desc: 'Full card numbers are tokenized and never stored on our servers.' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: '#0a0a0a', border: '1px solid #121212',
                  borderRadius: 16, padding: '22px 18px',
                  transition: 'border-color 0.3s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#222'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#121212'}>
                  <div style={{ fontSize: 20, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#ccc' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── CTA DUAL ── */}
      <section style={{ padding: '20px 36px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="cta-dual-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '◉', tag: 'For card holders', title: 'Own a premium card?\nPut it to work.', desc: "List your card on our platform. Every time someone routes a purchase through it, you earn a commission — completely passively.", btn: 'Add Your Card', action: () => navigate('/add-card') },
            { icon: '◈', tag: 'For deal seekers', title: 'Access every discount.\nNo card needed.', desc: 'Browse deals across travel, dining, and shopping. We route your payment through the perfect card — you pay less, no questions asked.', btn: 'Start Saving', action: () => navigate('/pay') },
          ].map((block, i) => (
            <RevealSection key={i} delay={i * 0.15}>
              <div style={{ background: '#0a0a0a', border: '1px solid #151515', borderRadius: 24, padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32, height: '100%', transition: 'border-color 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#222'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#151515'}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 9999, padding: '4px 12px 4px 4px', marginBottom: 20 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#141414', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, color: '#71717a' }}>{block.icon}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>{block.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: 'clamp(1.4rem,2.5vw,2rem)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14, whiteSpace: 'pre-line', fontStyle: 'italic' }}>{block.title}</h3>
                  <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.7, maxWidth: 340 }}>{block.desc}</p>
                </div>
                <button className="btn-pill" onClick={block.action}>
                  {block.btn}
                  <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
                </button>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <div className="cinematic-divider" />

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '100px 36px', maxWidth: 1200, margin: '0 auto' }}>
        <RevealSection>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>What users say</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, fontStyle: 'italic' }}>Real savings. Real earners.</h2>
          </div>
        </RevealSection>
        <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {testimonials.map((t, i) => <TestimonialCard key={i} index={i} {...t} />)}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '20px 36px 120px' }}>
        <RevealSection>
          <div style={{ maxWidth: 1200, margin: '0 auto', background: '#0a0a0a', border: '1px solid #151515', borderRadius: 24, padding: '80px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
            {/* Accent visual */}
            <img src="/accent-abstract.png" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }} />
            <div>
              <h3 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: 'clamp(1.6rem,3vw,2.8rem)', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1, fontStyle: 'italic' }}>
                Ready to unlock every<br />card discount?
              </h3>
              <p style={{ fontSize: 14, color: '#a1a1aa', maxWidth: 440, lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
                Whether you want to save on purchases or earn commission on your existing cards — SwipeBridge works both ways.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
              <button className="btn-pill" onClick={() => navigate('/add-card')}>
                Add Your Card &amp; Earn
                <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
              </button>
              <button className="btn-pill" onClick={() => navigate('/pay')}>
                Start Saving Now
                <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
              </button>
            </div>
          </div>
        </RevealSection>
      </section>

      <Footer />
    </div>
  )
}
