import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Ticker from '../components/ui/Ticker'
import Footer from '../components/layout/Footer'
import { ArrowIcon, CheckIcon } from '../components/ui/Icons'

/* ── DATA ── */
const stats = [
  { num:'$2.4M+', label:'Saved by users this year',  sub:'Across all card categories'   },
  { num:'94%',    label:'Average discount captured',  sub:'vs. paying with your own card' },
  { num:'180+',   label:'Premium cards in network',   sub:'Visa, Mastercard & Amex'       },
  { num:'12K+',   label:'Active members',             sub:'And growing every week'        },
]

const howItWorks = [
  { step:'01', title:'Browse a deal',  desc:"Find an offer — dining, travel, shopping — that requires a premium card you don't own." },
  { step:'02', title:'We route it',    desc:'Our engine matches your purchase to the optimal card in our network, invisibly.'        },
  { step:'03', title:'You save',       desc:'You pay the discounted price plus a small service fee. We keep the difference as commission.' },
]

const features = [
  { icon:'◈', title:'Hidden transaction routing', desc:'Every purchase is routed through real premium card networks with zero visible intermediary.' },
  { icon:'⬡', title:'Smart card matching',        desc:'AI picks the highest-discount card from 180+ options for every single transaction in real time.' },
  { icon:'⬟', title:'Usage-based tiers',          desc:'The more you spend through us, the deeper your discounts get. Rewards that actually scale.' },
  { icon:'◉', title:'Earn as a card holder',       desc:"Own a premium card? List it on our platform and earn passive commission every time it's used." },
  { icon:'⊞', title:'Instant settlement',          desc:'No holds, no delays. Funds clear in seconds across all supported networks.' },
  { icon:'◎', title:'Full spend analytics',        desc:'See exactly how much you saved per category, per card, per month — in one dashboard.' },
]

const supportedCards = [
  { name:'Visa Infinite',    color:'#1a3a8f', accent:'#4f8ef7', tag:'Travel'   },
  { name:'Mastercard World', color:'#8b1a1a', accent:'#f7714f', tag:'Dining'   },
  { name:'Amex Platinum',    color:'#1a5c3a', accent:'#4ff7a0', tag:'Lounge'   },
  { name:'Amex Gold',        color:'#5c4a1a', accent:'#f7c94f', tag:'Shopping' },
  { name:'Visa Signature',   color:'#3a1a8b', accent:'#b04ff7', tag:'Cashback' },
  { name:'Mastercard Black', color:'#1a1a1a', accent:'#aaaaaa', tag:'Premium'  },
]

const testimonials = [
  { quote:'I saved ₹18,000 on a flight booking just by routing through CardProxy. Insane value.',                                 name:'Aryan S.', role:'Frequent traveller',    avatar:'AS' },
  { quote:"Listed my Amex Platinum and made back the annual fee in two months. Passive income I never expected.",                  name:'Priya M.', role:'Card holder & earner', avatar:'PM' },
  { quote:"The AI picks the right card every time. I've stopped thinking about which card to use.",                                name:'Rohan K.', role:'Power user',           avatar:'RK' },
]

const trustBadges = ['No card ownership needed','Zero hidden fees','Cancel anytime']

/* ── MINI COMPONENTS ── */
function CreditCardVisual({ name, color, accent, tag, index }) {
  const offsets = [0,18,36,54,72,90]
  return (
    <div style={{
      position:'absolute', left:`${offsets[index]*0.6}px`, top:`${offsets[index]*0.3}px`,
      zIndex: supportedCards.length - index,
      width:260, height:158, borderRadius:16,
      background: color, border:'1px solid rgba(255,255,255,0.08)',
      boxShadow:'0 20px 40px rgba(0,0,0,0.5)',
      padding:'18px 20px', display:'flex', flexDirection:'column', justifyContent:'space-between',
      transition:'transform 0.3s', cursor:'default',
    }}
    onMouseEnter={e => e.currentTarget.style.transform='translateY(-8px) scale(1.02)'}
    onMouseLeave={e => e.currentTarget.style.transform=''}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:accent, background:'rgba(255,255,255,0.06)', borderRadius:6, padding:'3px 8px' }}>{tag}</span>
        <div style={{ width:28, height:20, borderRadius:4, background:'linear-gradient(135deg,#d4af37,#ffd700,#b8941e)', opacity:0.85 }} />
      </div>
      <div>
        <div style={{ fontSize:11, letterSpacing:'0.18em', color:'rgba(255,255,255,0.5)', marginBottom:6 }}>
          •••• •••• •••• {3000 + index * 317}
        </div>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.85)', letterSpacing:'-0.01em' }}>{name}</div>
      </div>
    </div>
  )
}

function StepCard({ step, title, desc }) {
  return (
    <div style={{ background:'#0c0c0c', border:'1px solid #1e1e1e', borderRadius:20, padding:'32px 28px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:20, right:24, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'4rem', color:'#111', lineHeight:1, letterSpacing:'-0.04em', userSelect:'none' }}>{step}</div>
      <div style={{ width:32, height:32, borderRadius:8, background:'#141414', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, fontSize:12, color:'#444', fontWeight:700 }}>{step}</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, marginBottom:10, letterSpacing:'-0.01em' }}>{title}</div>
      <div style={{ fontSize:14, color:'#555', lineHeight:1.65 }}>{desc}</div>
    </div>
  )
}

function TestimonialCard({ quote, name, role, avatar }) {
  return (
    <div style={{ background:'#0c0c0c', border:'1px solid #1a1a1a', borderRadius:20, padding:'28px' }}>
      <div style={{ fontSize:22, color:'#1e1e1e', marginBottom:16, lineHeight:1 }}>"</div>
      <p style={{ fontSize:14, color:'#666', lineHeight:1.7, marginBottom:24 }}>{quote}</p>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:'50%', background:'#1a1a1a', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#555', letterSpacing:'0.05em' }}>{avatar}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'#ccc' }}>{name}</div>
          <div style={{ fontSize:11, color:'#333' }}>{role}</div>
        </div>
      </div>
    </div>
  )
}

/* ── PAGE ── */
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', background:'#080808', paddingTop:64 }}>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'0 36px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-10%', right:'5%', width:700, height:700, background:'radial-gradient(circle,rgba(255,255,255,0.025) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', left:'-5%', width:400, height:400, background:'radial-gradient(circle,rgba(255,255,255,0.015) 0%,transparent 70%)', pointerEvents:'none' }}/>

        <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, width:'100%', maxWidth:1200, margin:'0 auto', alignItems:'center' }}>
          <div>
            <div className="anim-1" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#111', border:'1px solid #1e1e1e', borderRadius:9999, padding:'5px 14px 5px 5px', marginBottom:32 }}>
              <span style={{ background:'#1e1e1e', borderRadius:9999, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#888', letterSpacing:'0.07em', textTransform:'uppercase' }}>New</span>
              <span style={{ fontSize:12, color:'#555' }}>Credit card proxy platform</span>
            </div>

            <h1 className="anim-2" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(3rem,7vw,5.5rem)', fontWeight:800, lineHeight:1.0, letterSpacing:'-0.03em' }}>
              Every card's<br/>discount.<br/><span style={{ color:'#2a2a2a' }}>Zero cards.</span>
            </h1>

            <p className="anim-3" style={{ marginTop:28, fontSize:15, color:'#555', lineHeight:1.7, maxWidth:380 }}>
              Access premium credit card discounts without owning them. Our proxy engine routes your purchases through the best card in our network — you save, we earn a small fee.
            </p>

            <div className="anim-4" style={{ marginTop:36, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
              <button className="btn-pill" onClick={() => navigate('/add-card')}>
                Add Your Card &amp; Earn
                <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
              </button>
              <a href="#how-it-works" style={{ fontSize:13, color:'#444', textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#aaa'} onMouseLeave={e=>e.target.style.color='#444'}>
                See how it works →
              </a>
            </div>

            <div className="anim-5" style={{ marginTop:44, display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
              {trustBadges.map(t => (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <CheckIcon/>
                  <span style={{ fontSize:12, color:'#444' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
            <div style={{ position:'relative', width:320, height:280 }}>
              {supportedCards.map((card, i) => <CreditCardVisual key={i} index={i} {...card}/>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATS ── */}
      <section style={{ padding:'80px 36px 60px', maxWidth:1200, margin:'0 auto' }}>
        <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'#141414', border:'1px solid #141414', borderRadius:20, overflow:'hidden' }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:'#080808', padding:'36px 28px' }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(1.6rem,2.5vw,2.4rem)', fontWeight:800, letterSpacing:'-0.04em' }}>{s.num}</div>
              <div style={{ fontSize:13, color:'#888', marginTop:8, fontWeight:500 }}>{s.label}</div>
              <div style={{ fontSize:11, color:'#2a2a2a', marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:'60px 36px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:11, color:'#333', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:12 }}>How it works</div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, maxWidth:460 }}>
            Three steps to smarter spending
          </h2>
        </div>
        <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {howItWorks.map((s,i) => <StepCard key={i} {...s}/>)}
        </div>
      </section>

      {/* ── SUPPORTED CARDS ── */}
      <section style={{ padding:'60px 36px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ background:'#0c0c0c', border:'1px solid #1a1a1a', borderRadius:24, padding:'48px 40px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:36, flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:'#333', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:10 }}>Network coverage</div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:800, letterSpacing:'-0.03em' }}>
                180+ premium cards.<br/>One platform.
              </h2>
            </div>
            <button className="btn-pill" onClick={() => navigate('/add-card')}>
              List your card
              <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
            </button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            {supportedCards.map((c,i) => (
              <div key={i} style={{ background:c.color, borderRadius:12, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:c.accent, flexShrink:0 }}/>
                <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap' }}>{c.name}</span>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c.accent, background:'rgba(255,255,255,0.05)', borderRadius:4, padding:'2px 6px' }}>{c.tag}</span>
              </div>
            ))}
            <div style={{ borderRadius:12, padding:'10px 16px', border:'1px dashed #1e1e1e', display:'flex', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#333' }}>+ 170 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'60px 36px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:11, color:'#333', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:12 }}>Platform features</div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1, maxWidth:480 }}>
            Built for card holders &amp; deal seekers
          </h2>
        </div>
        <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {features.map((f,i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize:22, marginBottom:16, color:'#2a2a2a' }}>{f.icon}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, marginBottom:8, letterSpacing:'-0.01em' }}>{f.title}</div>
              <div style={{ fontSize:14, color:'#555', lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA DUAL ── */}
      <section style={{ padding:'20px 36px 60px', maxWidth:1200, margin:'0 auto' }}>
        <div className="cta-dual-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { icon:'◉', tag:'For card holders', title:'Own a premium card?\nPut it to work.', desc:"List your card on our platform. Every time someone routes a purchase through it, you earn a commission — completely passively.", btn:'Add Your Card', action:() => navigate('/add-card') },
            { icon:'◈', tag:'For deal seekers',  title:'Access every discount.\nNo card needed.', desc:'Browse deals across travel, dining, and shopping. We route your payment through the perfect card — you pay less, no questions asked.', btn:'Start Saving', action:() => navigate('/pay') },
          ].map((block, i) => (
            <div key={i} style={{ background:'#0c0c0c', border:'1px solid #1e1e1e', borderRadius:24, padding:'44px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between', gap:32 }}>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#141414', border:'1px solid #222', borderRadius:9999, padding:'4px 12px 4px 4px', marginBottom:20 }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'#1f1f1f', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:9, color:'#555' }}>{block.icon}</span>
                  </div>
                  <span style={{ fontSize:11, color:'#444' }}>{block.tag}</span>
                </div>
                <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(1.4rem,2.5vw,2rem)', letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:14, whiteSpace:'pre-line' }}>{block.title}</h3>
                <p style={{ fontSize:14, color:'#555', lineHeight:1.7, maxWidth:340 }}>{block.desc}</p>
              </div>
              <button className="btn-pill" onClick={block.action}>
                {block.btn}
                <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:'60px 36px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:11, color:'#333', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, marginBottom:12 }}>What users say</div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.1 }}>Real savings. Real earners.</h2>
        </div>
        <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {testimonials.map((t,i) => <TestimonialCard key={i} {...t}/>)}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:'20px 36px 100px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', background:'#0e0e0e', border:'1px solid #1e1e1e', borderRadius:24, padding:'72px 56px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
          <div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(1.6rem,3vw,2.6rem)', letterSpacing:'-0.03em', marginBottom:12, lineHeight:1.1 }}>
              Ready to unlock every<br/>card discount?
            </h3>
            <p style={{ fontSize:14, color:'#555', maxWidth:440, lineHeight:1.7 }}>
              Whether you want to save on purchases or earn commission on your existing cards — CardProxy works both ways.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, flexShrink:0 }}>
            <button className="btn-pill" onClick={() => navigate('/add-card')}>
              Add Your Card &amp; Earn
              <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
            </button>
            <button className="btn-pill" onClick={() => navigate('/pay')}>
              Start Saving Now
              <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
