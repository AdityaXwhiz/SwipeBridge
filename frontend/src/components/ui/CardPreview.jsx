const NET_COLORS = {
  'Visa':              { bg:'#1a3a8f', accent:'#4f8ef7' },
  'Mastercard':        { bg:'#8b1a1a', accent:'#f7714f' },
  'American Express':  { bg:'#1a5c3a', accent:'#4ff7a0' },
  'RuPay':             { bg:'#5c1a5a', accent:'#f74fd8' },
  'Discover':          { bg:'#5c4a1a', accent:'#f7c94f' },
}

export default function CardPreview({ form }) {
  const scheme = NET_COLORS[form.network] || { bg:'#1a1a1a', accent:'#555' }
  const rawDigits = (form.cardNumber || '').replace(/\s/g,'')
  const masked = rawDigits.length > 4
    ? `•••• •••• •••• ${rawDigits.slice(-4)}`
    : '•••• •••• •••• ••••'

  return (
    <div style={{
      width:300, height:182, borderRadius:18,
      background: scheme.bg,
      border:'1px solid rgba(255,255,255,0.08)',
      boxShadow:'0 30px 60px rgba(0,0,0,0.6)',
      padding:'22px 24px',
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      transition:'background 0.4s',
      flexShrink:0,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          {form.network && (
            <span style={{
              fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
              color: scheme.accent, background:'rgba(255,255,255,0.06)',
              borderRadius:6, padding:'3px 8px',
            }}>{form.network}</span>
          )}
        </div>
        <div style={{ width:30, height:22, borderRadius:5, background:'linear-gradient(135deg,#d4af37,#ffd700,#b8941e)', opacity:0.8 }} />
      </div>
      <div>
        <div style={{ fontSize:13, letterSpacing:'0.22em', color:'rgba(255,255,255,0.35)', marginBottom:8 }}>
          {masked}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.07em', marginBottom:2 }}>CARD HOLDER</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
              {form.holderName || 'YOUR NAME'}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.07em', marginBottom:2 }}>EXPIRES</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>
              {form.expiry || 'MM/YY'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { NET_COLORS }
