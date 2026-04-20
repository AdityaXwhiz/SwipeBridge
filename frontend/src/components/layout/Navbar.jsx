import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:1000,
      height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 36px',
      background:'rgba(0,0,0,0.92)', backdropFilter:'blur(16px)',
      borderBottom:'1px solid #0e0e0e',
    }}>
      <NavLink to="/" style={{ textDecoration:'none' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, fontSize:17, letterSpacing:'-0.02em', color:'#fff', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontStyle:'italic' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
          SwipeBridge
        </div>
      </NavLink>

      <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:2 }}>
        {[
          { to:'/',           label:'Home'       },
          { to:'/best-deal',  label:'BestDeal AI'},
          { to:'/dashboard',  label:'Dashboard'  },
          { to:'/cards-deck', label:'Cards Deck' },
          { to:'/pay',        label:'Pay'        },
          { to:'/add-card',   label:'Add Card'   },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            padding:'7px 14px', borderRadius:9999,
            fontSize:13, fontWeight:500,
            color: isActive ? '#fff' : '#a1a1aa',
            textDecoration:'none', transition:'color 0.15s',
            fontFamily:'Outfit, sans-serif',
          })}>
            {label}
          </NavLink>
        ))}
        {/* ── Assistant with glow effect ── */}
        <NavLink to="/assistant" className="nav-assistant-link" style={({ isActive }) => ({
          padding:'7px 16px', borderRadius:9999,
          fontSize:13, fontWeight:600,
          color: isActive ? '#fff' : '#d4d4d8',
          textDecoration:'none',
          fontFamily:'Outfit, sans-serif',
        })}>
          Assistant ✨
        </NavLink>

        <NavLink to="/privacy" style={({ isActive }) => ({
          padding:'7px 14px', borderRadius:9999,
          fontSize:12, fontWeight:500,
          color: isActive ? '#fff' : '#71717a',
          textDecoration:'none',
          fontFamily:'Outfit, sans-serif',
        })}>
          Privacy
        </NavLink>

        <NavLink to="/terms" style={({ isActive }) => ({
          padding:'7px 14px', borderRadius:9999,
          fontSize:12, fontWeight:500,
          color: isActive ? '#fff' : '#71717a',
          textDecoration:'none',
          fontFamily:'Outfit, sans-serif',
        })}>
          Terms
        </NavLink>

        <NavLink to="/refund" style={({ isActive }) => ({
          padding:'7px 14px', borderRadius:9999,
          fontSize:12, fontWeight:500,
          color: isActive ? '#fff' : '#71717a',
          textDecoration:'none',
          fontFamily:'Outfit, sans-serif',
        })}>
          Refund
        </NavLink>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {user ? (
          <>
            <span style={{ fontSize:13, color:'#a1a1aa', fontFamily:'Outfit, sans-serif' }}>
              {user.name?.split(' ')[0]}
            </span>
            <button className="btn-pill ghost" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className="btn-pill ghost" onClick={() => navigate('/auth')}>
              Sign in
            </button>
            <button className="btn-pill" onClick={() => navigate('/auth?mode=signup')}>
              Get started
              <span className="arrow-circle">→</span>
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
