import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ padding:'40px 36px', borderTop:'1px solid #0e0e0e', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
      <div style={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, fontSize:17, letterSpacing:'-0.02em', color:'#fff', display:'flex', alignItems:'center', gap:10, fontStyle:'italic' }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
        SwipeBridge
      </div>
      <div style={{ display:'flex', gap:24 }}>
        {['Privacy','Terms','Security'].map(l => (
          <span key={l} style={{ fontSize:13, color:'#71717a', cursor:'pointer', transition:'color 0.2s', fontFamily:'Outfit, sans-serif' }}
            onMouseEnter={e => e.target.style.color='#e4e4e7'}
            onMouseLeave={e => e.target.style.color='#71717a'}
          >{l}</span>
        ))}
      </div>
      <div style={{ fontSize:12, color:'#71717a', fontFamily:'Outfit, sans-serif' }}>© 2025 SwipeBridge</div>
    </footer>
  )
}
