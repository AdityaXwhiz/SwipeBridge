import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ padding:'32px 36px', borderTop:'1px solid #111', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, letterSpacing:'-0.02em', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
        CardProxy
      </div>
      <div style={{ display:'flex', gap:24 }}>
        {['Privacy','Terms','Security'].map(l => (
          <span key={l} style={{ fontSize:13, color:'#2a2a2a', cursor:'pointer', transition:'color 0.2s' }}
            onMouseEnter={e => e.target.style.color='#555'}
            onMouseLeave={e => e.target.style.color='#2a2a2a'}
          >{l}</span>
        ))}
      </div>
      <div style={{ fontSize:12, color:'#2a2a2a' }}>© 2025 CardProxy</div>
    </footer>
  )
}
