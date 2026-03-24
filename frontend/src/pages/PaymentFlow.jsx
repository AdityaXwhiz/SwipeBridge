import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowIcon } from '../components/ui/Icons'

const STEPS = [
  { n:1, label:'Product'  },
  { n:2, label:'Optimizer'},
  { n:3, label:'Payment'  },
  { n:4, label:'Done'     },
]

const TITLES = ['','Choose your product','Find the best offer','Confirm payment','Payment successful']
const SUBS   = ['','Select a product to route through the AI optimizer.','Our engine ranks every card offer by real rupee value.','Prepay securely — we execute the proxy payment instantly.','Your order is confirmed and savings applied.']

const CARD_OPTS = [
  { id:'hdfc',  icon:'💎', bank:'HDFC Regalia',  offer:'15% instant discount via Proxy', save:'₹13,499', label:'you save',     best:true  },
  { id:'axis',  icon:'⭐', bank:'Axis Magnus',   offer:'20x pts = ₹11,200 value',        save:'₹11,200', label:'equiv. value', best:false },
  { id:'kotak', icon:'🏦', bank:'Kotak 811',     offer:'Flat ₹1,000 off · No conditions', save:'₹1,000',  label:'you save',     best:false },
]

const PAY_METHODS = [
  { id:'upi',  icon:'📱', label:'UPI',          sub:'GPay, PhonePe, Paytm'     },
  { id:'card', icon:'💳', label:'Debit Card',   sub:'Visa, MC, RuPay'          },
  { id:'nb',   icon:'🏦', label:'Net Banking',  sub:'All major banks'           },
  { id:'wallet',icon:'👝',label:'Wallet',       sub:'Paytm, Amazon Pay'         },
]

function StepIndicator({ current }) {
  return (
    <div className="step-dot-row">
      {STEPS.map((s, i) => (
        <div key={s.n} style={{ display:'flex', alignItems:'center', gap:0 }}>
          <div className={`step-dot${s.n < current ? ' done' : s.n === current ? ' active' : ''}`}>
            {s.n < current ? '✓' : s.n}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line${s.n < current ? ' done' : ''}`}/>
          )}
        </div>
      ))}
    </div>
  )
}

function fireConfetti() {
  const colors = ['#fff','#888','#555','#ccc','#333','#444']
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div')
    p.className = 'confetti-piece'
    const size = 5 + Math.random() * 7
    p.style.cssText = `
      left:${Math.random()*100}vw; top:-20px;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>.5?'50%':'2px'};
      animation:confettiFall ${1.5+Math.random()*2}s ${Math.random()*0.8}s linear both;
      pointer-events:none; z-index:9998;`
    document.body.appendChild(p)
    setTimeout(() => p.remove(), 4000)
  }
}

/* ── shared surface style ── */
const surface = { background:'#0c0c0c', border:'1px solid #1e1e1e', borderRadius:20, padding:'28px' }

export default function PaymentFlow() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned]   = useState(false)
  const [selected, setSelected] = useState('hdfc')
  const [payMethod, setPayMethod] = useState('upi')

  function goTo(n) {
    setStep(n)
    window.scrollTo(0, 0)
    if (n === 2 && !scanned) {
      setScanning(true)
      setTimeout(() => { setScanning(false); setScanned(true) }, 2200)
    }
    if (n === 4) fireConfetti()
  }

  /* ── STEP 1 ── */
  const Step1 = (
    <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:24, alignItems:'start' }} className="pay-grid">
      <div style={surface}>
        <div style={{ width:'100%', height:140, borderRadius:12, background:'#111', border:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, marginBottom:20 }}>🖥️</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:17, marginBottom:4 }}>Sony 65" Bravia OLED 4K TV</div>
        <div style={{ fontSize:12, color:'#555', marginBottom:12 }}>Amazon.in · Prime delivery</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14 }}>
          <span style={{ fontSize:13, color:'#2a2a2a', textDecoration:'line-through' }}>₹1,40,000</span>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, letterSpacing:'-0.02em' }}>₹89,990</span>
        </div>
        <div style={{ fontSize:13, color:'#333', lineHeight:1.65, marginBottom:20 }}>OLED panel, 4K HDR, Dolby Vision, Google TV. Cards with active Amazon partnerships unlock up to 15%.</div>
        <button className="btn-pill full" onClick={() => goTo(2)}>
          Find Best Offer
          <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ background:'#0c0c0c', border:'1px solid #1a1a1a', borderRadius:16, padding:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#2a2a2a', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14 }}>Available offers</div>
          {[
            { card:'HDFC Regalia', offer:'15% off',      color:'#3a6a3a' },
            { card:'Axis Magnus',  offer:'20x pts',      color:'#4a4a8a' },
            { card:'ICICI Amazon', offer:'5% cashback',  color:'#5a4a1a' },
            { card:'Kotak 811',    offer:'₹1,000 off',   color:'#3a3a3a' },
          ].map((r,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'#0a0a0a', border:'1px solid #111', borderRadius:10, fontSize:13, marginBottom:i<3?8:0 }}>
              <span style={{ color:'#444' }}>{r.card}</span>
              <span style={{ color:r.color, fontWeight:700 }}>{r.offer}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'#0a0a0a', border:'1px solid #111', borderRadius:14, padding:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#444', marginBottom:8 }}>◈ AI will calculate</div>
          <div style={{ fontSize:12, color:'#2a2a2a', lineHeight:1.7 }}>• Real ₹ value of reward points<br/>• Annual fee amortization<br/>• Net effective discount<br/>• Platform fee impact</div>
        </div>
      </div>
    </div>
  )

  /* ── STEP 2 ── */
  const Step2 = (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }} className="pay-grid">
      <div style={surface}>
        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:16 }}>◈ AI Offer Optimizer</div>
        {scanning ? (
          <div style={{ textAlign:'center', padding:'28px 0' }}>
            <div className="scan-ring"/>
            <div style={{ fontSize:13, color:'#444' }}>Scanning 180+ cards…</div>
            <div style={{ fontSize:11, color:'#2a2a2a', marginTop:4 }}>Calculating real rupee value</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:11, color:'#2a2a2a', marginBottom:12, letterSpacing:'0.04em' }}>Ranked by net savings:</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {CARD_OPTS.map(o => (
                <div key={o.id} className={`card-opt${selected===o.id?' selected':''}`} onClick={() => setSelected(o.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:'#141414', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{o.icon}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color: selected===o.id?'#fff':'#666', marginBottom:2 }}>{o.bank}</div>
                      <div style={{ fontSize:11, color:'#333' }}>{o.offer}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:800, color: selected===o.id?'#fff':'#555' }}>{o.save}</div>
                    <div style={{ fontSize:10, color:'#2a2a2a' }}>{o.label}</div>
                    {o.best && <span style={{ fontSize:9, fontWeight:700, background:'#fff', color:'#080808', borderRadius:9999, padding:'2px 7px', letterSpacing:'0.06em', textTransform:'uppercase' }}>BEST</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div>
        {scanning ? (
          <div style={{ background:'#0c0c0c', border:'1px solid #1e1e1e', borderRadius:16, padding:32, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#2a2a2a', marginBottom:12 }}>Crunching the numbers</div>
            <div className="scan-ring" style={{ width:36, height:36 }}/>
          </div>
        ) : (
          <div style={{ background:'#0c0c0c', border:'1px solid #1e1e1e', borderRadius:16, padding:24 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:16 }}>Savings Breakdown</div>
            <div style={{ background:'#0a0a0a', border:'1px solid #111', borderRadius:12, padding:16, marginBottom:12 }}>
              {[
                { label:'Product price',          val:'₹89,990',  color:'#888'   },
                { label:'HDFC Regalia (15%)',      val:'−₹13,499', color:'#3a6a3a'},
                { label:'Platform fee (1.2%)',     val:'+₹916',    color:'#444'   },
              ].map((r,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13 }}>
                  <span style={{ color:'#444' }}>{r.label}</span>
                  <span style={{ color:r.color, fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid #141414', marginTop:8, paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:700 }}>
                <span style={{ color:'#ccc' }}>You pay</span>
                <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:800 }}>₹77,407</span>
              </div>
            </div>
            <div style={{ background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:10, padding:12, fontSize:12, color:'#3a6a3a', fontWeight:600, textAlign:'center', marginBottom:16 }}>
              Net saving: ₹12,583 · 14% effective discount
            </div>
            <button className="btn-pill full" onClick={() => goTo(3)}>
              Proceed to Payment
              <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  /* ── STEP 3 ── */
  const Step3 = (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }} className="pay-grid">
      <div style={surface}>
        <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:4 }}>Prepay to CardProxy</div>
        <div style={{ fontSize:12, color:'#444', marginBottom:20 }}>We complete the purchase using HDFC Regalia on your behalf</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:'2.4rem', fontWeight:800, letterSpacing:'-0.03em', marginBottom:4 }}>₹77,407</div>
        <div style={{ fontSize:12, color:'#3a6a3a', fontWeight:600, marginBottom:24 }}>You save ₹12,583 on this order</div>
        <div style={{ fontSize:11, fontWeight:700, color:'#2a2a2a', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Payment method</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {PAY_METHODS.map(m => (
            <div key={m.id} className={`pay-method${payMethod===m.id?' selected':''}`} onClick={() => setPayMethod(m.id)}>
              <div style={{ width:36, height:36, borderRadius:8, background:'#141414', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color: payMethod===m.id?'#ccc':'#555' }}>{m.label}</div>
                <div style={{ fontSize:11, color:'#2a2a2a' }}>{m.sub}</div>
              </div>
              <div className="pm-radio"><div className="pm-radio-dot"/></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'#0c0c0c', border:'1px solid #1e1e1e', borderRadius:16, padding:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#2a2a2a', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14 }}>Order summary</div>
          {[
            { label:'Sony OLED 65"',         val:'₹89,990',  c:'#666'    },
            { label:'HDFC Regalia discount',  val:'−₹13,499', c:'#3a6a3a' },
            { label:'Service fee',            val:'+₹916',    c:'#444'    },
          ].map((r,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' }}>
              <span style={{ color:'#333' }}>{r.label}</span><span style={{ color:r.c }}>{r.val}</span>
            </div>
          ))}
          <div style={{ borderTop:'1px solid #111', paddingTop:10, marginTop:8, display:'flex', justifyContent:'space-between', fontWeight:700 }}>
            <span style={{ color:'#aaa' }}>Total</span>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800 }}>₹77,407</span>
          </div>
        </div>
        <div style={{ background:'#0a0a0a', border:'1px solid #111', borderRadius:12, padding:14, fontSize:12, color:'#2a2a2a', lineHeight:1.6 }}>
          🔒 Your prepayment is held in escrow. We only charge after confirming the discount is applied.
        </div>
        <button className="btn-pill full" style={{ padding:'14px 20px' }} onClick={() => goTo(4)}>
          Pay ₹77,407 Securely
          <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
        </button>
        <div style={{ fontSize:11, color:'#1e1e1e', textAlign:'center' }}>Powered by Razorpay · PCI-DSS compliant</div>
      </div>
    </div>
  )

  /* ── STEP 4 ── */
  const Step4 = (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div className="success-ring" style={{ width:72, height:72, borderRadius:'50%', background:'#111', border:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 32px', fontSize:26 }}>✓</div>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'2rem', letterSpacing:'-0.02em', marginBottom:12 }}>Payment successful</h2>
      <p style={{ fontSize:14, color:'#444', maxWidth:400, margin:'0 auto 36px', lineHeight:1.7 }}>
        CardProxy completed your purchase using HDFC Regalia. Your Sony TV arrives in 2–3 business days.
      </p>
      <div style={{ background:'#0c0c0c', border:'1px solid #1a1a1a', borderRadius:16, padding:'24px 28px', maxWidth:380, margin:'0 auto 36px', textAlign:'left' }}>
        {[
          ['Order ID',       '#CP-2025-83921'],
          ['Proxy card',     'HDFC Regalia'  ],
          ['Amount paid',    '₹77,407'       ],
          ['You saved',      '₹12,583'       ],
          ['Trust score',    '+3 points'     ],
        ].map(([l,v], i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 4 ? '1px solid #0f0f0f' : 'none', fontSize:13 }}>
            <span style={{ color:'#333' }}>{l}</span>
            <span style={{ color: l==='You saved'||l==='Trust score' ? '#3a6a3a' : '#666', fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
        <button className="btn-pill" onClick={() => navigate('/dashboard')}>
          View Dashboard <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>
        </button>
        <button className="btn-pill ghost" onClick={() => { setStep(1); setScanned(false); setScanning(false) }}>New Payment</button>
      </div>
    </div>
  )

  const stepContent = [null, Step1, Step2, Step3, Step4]

  return (
    <div style={{ paddingTop:64, minHeight:'100vh' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'48px 36px' }}>

        <button onClick={() => navigate('/dashboard')} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6, marginBottom:32, fontFamily:'DM Sans,sans-serif', padding:0, transition:'color 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.color='#888'} onMouseLeave={e=>e.currentTarget.style.color='#333'}>
          ← Back to dashboard
        </button>

        <StepIndicator current={step}/>

        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(2rem,5vw,3rem)', letterSpacing:'-0.03em', lineHeight:1.05, marginBottom:8 }}>
          {TITLES[step]}
        </h1>
        <p style={{ fontSize:14, color:'#444', marginBottom:40 }}>{SUBS[step]}</p>

        {stepContent[step]}
      </div>
    </div>
  )
}
