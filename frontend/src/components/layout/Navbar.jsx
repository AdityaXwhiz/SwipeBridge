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
      background:'rgba(8,8,8,0.9)', backdropFilter:'blur(12px)',
      borderBottom:'1px solid #111',
    }}>
      <NavLink to="/" style={{ textDecoration:'none' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15, letterSpacing:'-0.02em', color:'#fff', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />
          CardProxy
        </div>
      </NavLink>

      <div style={{ display:'flex', alignItems:'center', gap:2 }}>
        {[
          { to:'/',           label:'Home'       },
          { to:'/best-deal',  label:'BestDeal AI'},
          { to:'/dashboard',  label:'Dashboard'  },
          { to:'/pay',        label:'Pay'        },
          { to:'/add-card',   label:'Add Card'   },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            padding:'7px 14px', borderRadius:9999,
            fontSize:13, fontWeight:500,
            color: isActive ? '#fff' : '#555',
            textDecoration:'none', transition:'color 0.15s',
          })}>
            {label}
          </NavLink>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {user ? (
          <>
            <span style={{ fontSize:13, color:'#444' }}>
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
