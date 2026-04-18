import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowIcon } from '../components/ui/Icons'
import { useGoogleLogin } from '@react-oauth/google'

function Input({ label, id, type='text', value, onChange, placeholder, error, autoComplete }) {
  return (
    <div>
      <label className="pay-input-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pay-input"
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')

  const { login, signup, forgotPassword, googleAuth, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email'
    if (mode !== 'forgot' && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (mode === 'signup' && form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setServerError('')
    setServerSuccess('')
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        navigate('/dashboard')
      } else if (mode === 'signup') {
        await signup(form.name, form.email, form.password)
        navigate('/dashboard')
      } else if (mode === 'forgot') {
        const res = await forgotPassword(form.email)
        setServerSuccess(res.data?.message || 'Password reset link sent!')
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setServerError('')
      try {
        await googleAuth(tokenResponse.access_token)
        navigate('/dashboard')
      } catch (err) {
        setServerError(err.response?.data?.message || 'Google sign in failed. Please try again.')
        setLoading(false)
      }
    },
    onError: () => setServerError('Google sign in was cancelled or failed.')
  })

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setErrors({})
    setServerError('')
    setServerSuccess('')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', paddingTop:64, display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 20px' }}>

      {/* Ambient blobs */}
      <div style={{ position:'fixed', top:'20%', right:'10%', width:500, height:500, background:'radial-gradient(circle,rgba(255,255,255,0.02) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:'10%', left:'5%', width:400, height:400, background:'radial-gradient(circle,rgba(255,255,255,0.015) 0%,transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:440 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, fontSize:17, letterSpacing:'-0.02em', color:'#fff', display:'inline-flex', alignItems:'center', gap:10, marginBottom:32, fontStyle:'italic' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }}/>
            SwipeBridge
          </div>
          <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:500, fontSize:'clamp(1.8rem,4vw,2.4rem)', letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:10, fontStyle:'italic' }}>
            {mode === 'login' ? 'Welcome back.' : mode === 'forgot' ? 'Reset password.' : 'Create your account.'}
          </h1>
          <p style={{ fontSize:14, color:'#444', lineHeight:1.6 }}>
            {mode === 'login'
              ? 'Sign in to access your savings dashboard.'
              : mode === 'forgot' 
              ? "We'll send you a link to get back into your account."
              : 'Start saving on every purchase — no card needed.'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'#0a0a0a', border:'1px solid #151515', borderRadius:24, padding:'36px 32px' }}>

          {serverError && (
            <div style={{ background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#f87171', marginBottom:24 }}>
              {serverError}
            </div>
          )}
          {serverSuccess && (
            <div style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#4ade80', marginBottom:24 }}>
              {serverSuccess}
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {mode === 'signup' && (
              <Input label="Full name" id="name" value={form.name} onChange={set('name')}
                placeholder="Arjun Mehta" error={errors.name} autoComplete="name"/>
            )}
            <Input label="Email address" id="email" type="email" value={form.email} onChange={set('email')}
              placeholder="you@example.com" error={errors.email} autoComplete="email"/>
            
            {mode !== 'forgot' && (
              <Input label="Password" id="password" type="password" value={form.password} onChange={set('password')}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} error={errors.password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/>
            )}
            
            {mode === 'signup' && (
              <Input label="Confirm password" id="confirm" type="password" value={form.confirm} onChange={set('confirm')}
                placeholder="Re-enter your password" error={errors.confirm} autoComplete="new-password"/>
            )}
          </div>

          <button
            className="btn-pill full"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop:28, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Send Link' : 'Create Account'}
            {!loading && <span className="arrow-circle"><ArrowIcon size={14} color="white"/></span>}
          </button>

          {mode === 'login' && (
            <div style={{ marginTop:16, textAlign:'right' }}>
              <span onClick={() => { setMode('forgot'); setErrors({}); setServerError(''); setServerSuccess(''); }} style={{ fontSize:12, color:'#333', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#666'} onMouseLeave={e=>e.target.style.color='#333'}>
                Forgot password?
              </span>
            </div>
          )}
          {mode === 'forgot' && (
             <div style={{ marginTop:16, textAlign:'center' }}>
              <span onClick={() => { setMode('login'); setErrors({}); setServerError(''); setServerSuccess(''); }} style={{ fontSize:12, color:'#444', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#444'}>
                Back to login
              </span>
             </div>
          )}

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:16, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'#141414' }}/>
            <span style={{ fontSize:11, color:'#2a2a2a', fontWeight:600 }}>OR</span>
            <div style={{ flex:1, height:1, background:'#141414' }}/>
          </div>

          {/* OAuth placeholder */}
          <button className="btn-pill ghost full" onClick={handleGoogle} disabled={loading} style={{ justifyContent:'center', gap:12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#555" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#555" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#555" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#555" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        {/* Switch mode */}
        <div style={{ marginTop:28, textAlign:'center', fontSize:13, color:'#333' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={switchMode} style={{ color:'#888', fontWeight:600, cursor:'pointer', transition:'color 0.2s' }}
            onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#888'}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </div>

        {/* Trust badges */}
        <div style={{ marginTop:32, display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
          {['PCI-DSS compliant','AES-256 encryption','Zero hidden fees'].map(b => (
            <div key={b} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="#52525b"/><path d="M3.5 6.5l2 2 4-4" stroke="#a1a1aa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize:11, color:'#2a2a2a' }}>{b}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
