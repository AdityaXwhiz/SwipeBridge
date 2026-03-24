import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowIcon } from '../components/ui/Icons'

const SPEND_DATA = [
  { label:'Food',     val:82,  amt:'₹8.2k',  color:'#1e2e1e' },
  { label:'Shopping', val:100, amt:'₹12.4k', color:'#1e1e2e' },
  { label:'Travel',   val:57,  amt:'₹7.1k',  color:'#1a2e2e' },
  { label:'Bills',    val:43,  amt:'₹5.3k',  color:'#2e2e1a' },
  { label:'Health',   val:26,  amt:'₹3.2k',  color:'#2e1a1a' },
  { label:'Other',    val:18,  amt:'₹2.2k',  color:'#1e1e1e' },
]

const METRICS = [
  { label:'Total Saved',  value:'₹3,240', change:'↑ 18% vs last month', pos:true  },
  { label:'Transactions', value:'23',     change:'↑ 4 new this week',    pos:true  },
  { label:'Avg per Txn',  value:'₹141',   change:'↑ 8% improvement',     pos:true  },
  { label:'CIBIL Score',  value:'762',    change:'↑ +12 this month',      pos:true  },
]

const OFFERS = [
  { emoji:'🛒', title:'Amazon — HDFC Regalia',   detail:'15% instant discount', tag:'Save 15%', tagColor:'#3a6a3a' },
  { emoji:'✈️', title:'MakeMyTrip — Axis Magnus', detail:'20x reward points',    tag:'20x pts',  tagColor:'#4a4a8a' },
  { emoji:'🍕', title:'Swiggy — ICICI Coral',     detail:'10% cashback · Min ₹400', tag:'10% back', tagColor:'#6a5a1a' },
  { emoji:'📱', title:'Flipkart — Kotak 811',     detail:'Extra 8% on electronics', tag:'8% off',  tagColor:'#5a2a2a' },
]

function SidebarIcon({ path }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={path}/></svg>
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const barsRef   = useRef(null)
  const animated  = useRef(false)

  useEffect(() => {
    if (!barsRef.current || animated.current) return
    animated.current = true
    setTimeout(() => {
      barsRef.current?.querySelectorAll('[data-h]').forEach(el => {
        el.style.height = el.dataset.h + 'px'
      })
    }, 150)
  }, [])

  return (
    <div style={{ paddingTop:64 }}>
      <div className="dash-grid">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <span className="sidebar-label">Main</span>
          <button className="sidebar-item active">
            <SidebarIcon path="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
            Overview
          </button>
          <button className="sidebar-item" onClick={() => navigate('/pay')}>
            <SidebarIcon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            Pay Now
            <span className="sidebar-pip">!</span>
          </button>
          <button className="sidebar-item" onClick={() => navigate('/best-deal')}>
            <SidebarIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            BestDeal AI
          </button>
          <button className="sidebar-item">
            <SidebarIcon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            Analytics
          </button>
          <button className="sidebar-item" onClick={() => navigate('/add-card')}>
            <SidebarIcon path="M12 4v16m-8-8h16"/>
            Add Card
          </button>

          <span className="sidebar-label">Account</span>
          <button className="sidebar-item">
            <SidebarIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            Profile
          </button>
          <button className="sidebar-item">
            <SidebarIcon path="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            Settings
          </button>

          <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid #111' }}>
            <button className="sidebar-item" onClick={() => { logout(); navigate('/') }}>
              <SidebarIcon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="dash-main">

          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
            <div>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.6rem', letterSpacing:'-0.02em', lineHeight:1.1 }}>
                Good morning, {user?.name?.split(' ')[0] || 'Arjun'} 👋
              </h1>
              <p style={{ fontSize:13, color:'#444', marginTop:4 }}>You've saved ₹3,240 this month · 23 transactions</p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-pill ghost" onClick={() => navigate('/add-card')}>+ Add Card</button>
              <button className="btn-pill" onClick={() => navigate('/pay')}>
                Pay Now <span className="arrow-circle"><ArrowIcon size={13} color="white"/></span>
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="metrics-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
            {METRICS.map((m,i) => (
              <div key={i} className="metric-card">
                <div style={{ fontSize:11, fontWeight:700, color:'#2a2a2a', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>{m.label}</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.7rem', fontWeight:800, letterSpacing:'-0.03em', marginBottom:6 }}>{m.value}</div>
                <div style={{ fontSize:12, color:'#3a5a3a', fontWeight:600 }}>{m.change}</div>
              </div>
            ))}
          </div>

          {/* Trust + Offers */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:16, marginBottom:24 }}>

            {/* Trust score */}
            <div style={{ background:'#0c0c0c', border:'1px solid #141414', borderRadius:16, padding:24 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:18 }}>Trust Score</div>
              <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:18 }}>
                <div style={{ position:'relative', width:80, height:80, flexShrink:0 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r="32" stroke="#1a1a1a" strokeWidth="6" fill="none"/>
                    <circle cx="40" cy="40" r="32" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="36"/>
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800, lineHeight:1, color:'#fff' }}>84</span>
                    <span style={{ fontSize:9, fontWeight:700, color:'#2a2a2a', letterSpacing:'0.06em', fontFamily:'DM Sans,sans-serif' }}>/100</span>
                  </div>
                </div>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#111', border:'1px solid #1e1e1e', borderRadius:9999, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#666', marginBottom:8 }}>
                    ● Trusted
                  </div>
                  <div style={{ fontSize:12, color:'#333', lineHeight:1.5 }}>16 pts to<br/><strong style={{ color:'#555' }}>Premium</strong></div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {['EMI up to ₹50,000 unlocked','Credit line: ₹25,000'].map(p => (
                  <div key={p} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#555' }}>
                    <span style={{ color:'#3a5a3a', fontSize:10 }}>✓</span>{p}
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#2a2a2a' }}>
                  <span style={{ fontSize:10 }}>○</span> 0% fee unlocks at 90+
                </div>
              </div>
            </div>

            {/* Offers */}
            <div style={{ background:'#0c0c0c', border:'1px solid #141414', borderRadius:16, padding:24 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Top Offers Today</div>
                <span style={{ fontSize:12, color:'#333', cursor:'pointer' }}
                  onMouseEnter={e=>e.target.style.color='#666'} onMouseLeave={e=>e.target.style.color='#333'}>View all →</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {OFFERS.map((o,i) => (
                  <div key={i} onClick={() => navigate('/pay')}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'#0a0a0a', border:'1px solid #141414', borderRadius:10, cursor:'pointer', transition:'border-color 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#222'} onMouseLeave={e=>e.currentTarget.style.borderColor='#141414'}>
                    <div style={{ width:36, height:36, borderRadius:8, background:'#141414', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{o.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#bbb' }}>{o.title}</div>
                      <div style={{ fontSize:11, color:'#333', marginTop:2 }}>{o.detail}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:o.tagColor }}>{o.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linked cards */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Linked Cards</div>
              <span style={{ fontSize:12, color:'#333', cursor:'pointer', transition:'color 0.2s' }}
                onClick={() => navigate('/add-card')}
                onMouseEnter={e=>e.target.style.color='#666'} onMouseLeave={e=>e.target.style.color='#333'}>
                + Add card
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { bg:'#1a3a8f', net:'Visa',       name:'HDFC REGALIA', last:'4291', exp:'12/27' },
                { bg:'#2d1b69', net:'Mastercard',  name:'AXIS MAGNUS',  last:'8834', exp:'03/26' },
              ].map((c,i) => (
                <div key={i} style={{ height:150, borderRadius:16, padding:18, display:'flex', flexDirection:'column', justifyContent:'space-between', background:c.bg, border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', transition:'transform 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.06)', borderRadius:5, padding:'3px 8px' }}>{c.net}</span>
                    <div style={{ width:26, height:18, borderRadius:4, background:'linear-gradient(135deg,#d4af37,#ffd700,#b8941e)', opacity:0.8 }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, letterSpacing:'0.18em', color:'rgba(255,255,255,0.35)', marginBottom:6 }}>•••• •••• •••• {c.last}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.7)', letterSpacing:'0.02em' }}>{c.name}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{c.exp}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={() => navigate('/add-card')}
                style={{ height:150, borderRadius:16, padding:18, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, background:'#0c0c0c', border:'1px dashed #1e1e1e', cursor:'pointer', transition:'border-color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#333'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e1e1e'}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#111', border:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#333' }}>+</div>
                <div style={{ fontSize:12, color:'#2a2a2a', textAlign:'center' }}>Add a card</div>
              </div>
            </div>
          </div>

          {/* Spend chart */}
          <div style={{ background:'#0c0c0c', border:'1px solid #141414', borderRadius:16, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Monthly Spending</div>
                <div style={{ fontSize:12, color:'#2a2a2a', marginTop:2 }}>₹38,400 total · June 2025</div>
              </div>
            </div>
            <div ref={barsRef} style={{ display:'flex', alignItems:'flex-end', gap:10, height:110, marginBottom:16 }}>
              {SPEND_DATA.map((d,i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#2a2a2a' }}>{d.amt}</div>
                  <div data-h={d.val} style={{ width:'100%', borderRadius:'3px 3px 0 0', background:d.color, height:0, transition:`height 0.9s cubic-bezier(0.23,1,0.32,1) ${i*80}ms` }}/>
                  <div style={{ fontSize:10, color:'#1e1e1e' }}>{d.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#0a0a0a', border:'1px solid #111', borderRadius:10, padding:'12px 14px', fontSize:12, color:'#333', lineHeight:1.6 }}>
              ◎ <strong style={{ color:'#555' }}>AI insight:</strong> You spend 32% on shopping. Consider HDFC Millennia for 5% extra cashback on e-commerce.
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
