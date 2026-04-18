import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowIcon } from '../components/ui/Icons'
import SkeuomorphicCard from '../components/ui/SkeuomorphicCard'
import { motion, useInView } from 'framer-motion'
import api from '../utils/api'

/* ── Reveal animation wrapper ── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SidebarIcon({ path }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={path} /></svg>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [cards, setCards] = useState([])
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [trustScore, setTrustScore] = useState(null)
  const [offers, setOffers] = useState([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [loadingTxns, setLoadingTxns] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')

  /* ── Fetch real data from API ── */
  useEffect(() => {
    api.get('/cards')
      .then(r => setCards(r.data.cards || []))
      .catch(() => {})
      .finally(() => setLoadingCards(false))

    api.get('/transactions')
      .then(r => setTransactions(r.data.transactions || []))
      .catch(() => {})
      .finally(() => setLoadingTxns(false))

    api.get('/transactions/stats')
      .then(r => setStats(r.data))
      .catch(() => {})

    api.get('/user/trust-score')
      .then(r => setTrustScore(r.data))
      .catch(() => {})

    api.get('/offers')
      .then(r => {
        const raw = r.data.offers || []
        setOffers(raw.map(o => ({
          id:       o.id || o._id,
          merchant: o.merchant || '',
          discount: o.discount || '',
          type:     o.type || '',
          card:     o.card || o.bank || '',
          tag:      o.tag || o.category || '',
          expires:  o.expires || '',
        })))
      })
      .catch(() => {})
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cards/${id}`)
      setCards(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      console.error('Failed to delete card', err)
    }
  }

  /* ── Computed values ── */
  const totalSaved = stats?.totalSaved || transactions.reduce((sum, t) => sum + (t.savings || 0), 0)
  const totalTransactions = stats?.totalTransactions || transactions.length
  const avgSaving = totalTransactions > 0 ? Math.round(totalSaved / totalTransactions) : 0
  const recentTransactions = transactions.slice(0, 5)

  /* ── Time-based greeting ── */
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const METRICS = [
    { label: 'Total Saved', value: totalSaved ? `₹${totalSaved.toLocaleString('en-IN')}` : '₹0', change: stats?.savedChange || '—', pos: true },
    { label: 'Transactions', value: String(totalTransactions), change: stats?.txnChange || '—', pos: true },
    { label: 'Avg Saving', value: avgSaving ? `₹${avgSaving}` : '₹0', change: stats?.avgChange || '—', pos: true },
    { label: 'Cards Linked', value: String(cards.length), change: cards.length > 0 ? `${cards.length} active` : 'Add your first card', pos: true },
  ]

  const trustLevel = trustScore?.score || 0
  const trustTier = trustScore?.tier || (trustLevel >= 90 ? 'Premium' : trustLevel >= 70 ? 'Trusted' : 'Standard')
  const trustPerks = trustScore?.perks || []

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="dash-grid">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <span className="sidebar-label">Main</span>
          <button className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
            <SidebarIcon path="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
            Overview
          </button>
          <button className="sidebar-item" onClick={() => navigate('/pay')}>
            <SidebarIcon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            Pay Now
            <span className="sidebar-pip">!</span>
          </button>
          <button className="sidebar-item" onClick={() => navigate('/best-deal')}>
            <SidebarIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            BestDeal AI
          </button>
          <button className={`sidebar-item ${activeSection === 'transactions' ? 'active' : ''}`} onClick={() => setActiveSection('transactions')}>
            <SidebarIcon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            Transactions
          </button>
          <button className="sidebar-item" onClick={() => navigate('/add-card')}>
            <SidebarIcon path="M12 4v16m-8-8h16" />
            Add Card
          </button>
          <button className="sidebar-item" onClick={() => navigate('/cards-deck')}>
            <SidebarIcon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            Cards Deck
          </button>

          <span className="sidebar-label">Account</span>
          <button className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`} onClick={() => setActiveSection('profile')}>
            <SidebarIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            Profile
          </button>
          <button className="sidebar-item">
            <SidebarIcon path="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            Settings
          </button>

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #0e0e0e' }}>
            <button className="sidebar-item" onClick={() => { logout(); navigate('/') }}>
              <SidebarIcon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="dash-main">

          {activeSection === 'overview' && (
            <>
              {/* Hero greeting */}
              <Reveal>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1.1, fontStyle: 'italic' }}>
                      {greeting}, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p style={{ fontSize: 14, color: '#a1a1aa', marginTop: 6, fontFamily: 'Outfit,sans-serif' }}>
                      {totalSaved > 0 ? `You've saved ₹${totalSaved.toLocaleString('en-IN')} across ${totalTransactions} transactions` : 'Start making payments to track your savings here.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-pill ghost" onClick={() => navigate('/add-card')}>+ Add Card</button>
                    <button className="btn-pill" onClick={() => navigate('/pay')}>
                      Pay Now <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
                    </button>
                  </div>
                </div>
              </Reveal>

              {/* Metrics */}
              <Reveal delay={0.1}>
                <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
                  {METRICS.map((m, i) => (
                    <motion.div
                      key={i}
                      className="metric-card"
                      whileHover={{ y: -2, borderColor: '#222' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Outfit,sans-serif' }}>{m.label}</div>
                      <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1.8rem', fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 6, fontStyle: 'italic' }}>{m.value}</div>
                      <div style={{ fontSize: 12, color: m.pos ? '#3a6a3a' : '#555', fontWeight: 600 }}>{m.change}</div>
                    </motion.div>
                  ))}
                </div>
              </Reveal>

              {/* Trust + Offers Row */}
              <Reveal delay={0.15}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 28 }}>

                  {/* Trust score */}
                  <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18, fontFamily: 'Outfit,sans-serif' }}>Trust Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
                      <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="40" cy="40" r="32" stroke="#111" strokeWidth="6" fill="none" />
                          <circle cx="40" cy="40" r="32" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={201 - (trustLevel / 100) * 201} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.23,1,0.32,1)' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, fontWeight: 500, lineHeight: 1, color: '#fff', fontStyle: 'italic' }}>{trustLevel}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#71717a', letterSpacing: '0.06em', fontFamily: 'Outfit,sans-serif' }}>/100</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 8 }}>
                          ● {trustTier}
                        </div>
                        <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5 }}>
                          {trustLevel >= 90 ? 'Maximum perks unlocked' : `${100 - trustLevel} pts to next tier`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {trustPerks.length > 0 ? trustPerks.map(p => (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a1a1aa' }}>
                          <span style={{ color: '#4ade80', fontSize: 10 }}>✓</span>{p}
                        </div>
                      )) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#71717a' }}>
                            <span style={{ fontSize: 10 }}>○</span> Make transactions to build trust
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Best Offers */}
                  <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>Top Offers Today</div>
                      <span style={{ fontSize: 12, color: '#71717a', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = '#e4e4e7'} onMouseLeave={e => e.target.style.color = '#71717a'}>View all →</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {offers.length > 0 ? offers.slice(0, 4).map((o, i) => (
                        <div key={o.id || i} onClick={() => navigate('/pay')}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#080808', border: '1px solid #121212', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#222'} onMouseLeave={e => e.currentTarget.style.borderColor = '#121212'}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                            {o.tag === 'Shopping' ? '🛒' : o.tag === 'Travel' ? '✈️' : o.tag === 'Dining' ? '🍕' : o.tag === 'Entertainment' ? '📱' : '◎'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>{o.merchant} — {o.card}</div>
                            <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{o.discount} {o.type}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#3a6a3a' }}>{o.discount}</span>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#71717a', fontSize: 13 }}>
                          No offers available right now
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Linked cards */}
              <Reveal delay={0.2}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>Linked Cards</div>
                    <span style={{ fontSize: 12, color: '#71717a', cursor: 'pointer', transition: 'color 0.2s' }}
                      onClick={() => navigate('/add-card')}
                      onMouseEnter={e => e.target.style.color = '#e4e4e7'} onMouseLeave={e => e.target.style.color = '#71717a'}>
                      + Add card
                    </span>
                  </div>
                  {loadingCards ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                      <div className="scan-ring" style={{ width: 32, height: 32 }} />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                      {cards.map((c) => (
                        <SkeuomorphicCard key={c._id} card={c} onDelete={() => handleDelete(c._id)} />
                      ))}
                      <div onClick={() => navigate('/add-card')}
                        style={{ height: 188, borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#0a0a0a', border: '1px dashed #1a1a1a', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#333'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0d0d0d', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#71717a' }}>+</div>
                        <div style={{ fontSize: 12, color: '#71717a', textAlign: 'center' }}>Add a card</div>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Recent Transactions */}
              <Reveal delay={0.25}>
                <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>Recent Transactions</div>
                      <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                        {totalTransactions > 0 ? `${totalTransactions} total transactions` : 'No transactions yet'}
                      </div>
                    </div>
                    {totalTransactions > 0 && (
                      <span style={{ fontSize: 12, color: '#71717a', cursor: 'pointer', transition: 'color 0.2s' }}
                        onClick={() => setActiveSection('transactions')}
                        onMouseEnter={e => e.target.style.color = '#e4e4e7'} onMouseLeave={e => e.target.style.color = '#71717a'}>
                        View all →
                      </span>
                    )}
                  </div>

                  {loadingTxns ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                      <div className="scan-ring" style={{ width: 28, height: 28 }} />
                    </div>
                  ) : recentTransactions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {recentTransactions.map((txn, i) => (
                        <div key={txn._id || i} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 0',
                          borderBottom: i < recentTransactions.length - 1 ? '1px solid #0e0e0e' : 'none',
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: '#0d0d0d', border: '1px solid #1a1a1a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, flexShrink: 0,
                          }}>
                            {txn.productName?.includes('flight') || txn.productName?.includes('trip') ? '✈️' :
                              txn.productName?.includes('food') || txn.productName?.includes('swiggy') ? '🍕' :
                              '💳'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>
                              {txn.productName || txn.description || 'Payment'}
                            </div>
                            <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                              {txn.proxyCard || 'Direct'} · {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: '"Cormorant Garamond",serif', color: '#fff', fontStyle: 'italic' }}>
                              ₹{(txn.amount || txn.productPrice || 0).toLocaleString('en-IN')}
                            </div>
                            {txn.savings > 0 && (
                              <div style={{ fontSize: 10, color: '#3a6a3a', fontWeight: 600 }}>Saved ₹{txn.savings}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
                      <div style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 6 }}>No transactions yet</div>
                      <div style={{ fontSize: 12, color: '#71717a', marginBottom: 20 }}>Make your first payment to see it here</div>
                      <button className="btn-pill" onClick={() => navigate('/pay')}>
                        Make a Payment <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
                      </button>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Quick Actions */}
              <Reveal delay={0.3}>
                <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="philosophy-grid">
                  {[
                    { icon: '◈', title: 'BestDeal AI', desc: 'Find the true lowest price across platforms', action: () => navigate('/best-deal') },
                    { icon: '◉', title: 'Add Card & Earn', desc: 'List your premium card and earn commissions', action: () => navigate('/add-card') },
                    { icon: '⊞', title: 'Pay Now', desc: 'Route a payment through the best card offer', action: () => navigate('/pay') },
                  ].map((item, i) => (
                    <div key={i} onClick={item.action} style={{
                      background: '#0a0a0a', border: '1px solid #121212',
                      borderRadius: 16, padding: '22px 20px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#121212'; e.currentTarget.style.transform = '' }}>
                      <div style={{ fontSize: 20, color: '#71717a', marginBottom: 10 }}>{item.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, fontFamily: 'Outfit,sans-serif' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </>
          )}

          {/* ── TRANSACTIONS VIEW ── */}
          {activeSection === 'transactions' && (
            <>
              <Reveal>
                <div style={{ marginBottom: 32 }}>
                  <button onClick={() => setActiveSection('overview')} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: 'Outfit,sans-serif', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'} onMouseLeave={e => e.currentTarget.style.color = '#71717a'}>
                    ← Back to overview
                  </button>
                  <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 4 }}>
                    Transaction History
                  </h1>
                  <p style={{ fontSize: 13, color: '#a1a1aa' }}>{transactions.length} transactions found</p>
                </div>
              </Reveal>

              {transactions.length > 0 ? (
                <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16, padding: 24 }}>
                  {transactions.map((txn, i) => (
                    <div key={txn._id || i} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 0',
                      borderBottom: i < transactions.length - 1 ? '1px solid #0e0e0e' : 'none',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: '#0d0d0d', border: '1px solid #1a1a1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>💳</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc' }}>
                          {txn.productName || txn.description || 'Payment'}
                        </div>
                        <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                          {txn.proxyCard || 'Direct'} · {txn.paymentMethod || '—'} · {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: '"Cormorant Garamond",serif', color: '#fff', fontStyle: 'italic' }}>
                          ₹{(txn.amount || txn.productPrice || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: 11, color: txn.status === 'completed' ? '#3a6a3a' : '#555', fontWeight: 600, marginTop: 2 }}>
                          {txn.status || 'completed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16 }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                  <div style={{ fontSize: 15, color: '#a1a1aa', marginBottom: 8 }}>No transactions yet</div>
                  <div style={{ fontSize: 13, color: '#71717a', marginBottom: 24 }}>Your transaction history will appear here</div>
                  <button className="btn-pill" onClick={() => navigate('/pay')}>
                    Make your first payment <span className="arrow-circle"><ArrowIcon size={13} color="white" /></span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PROFILE VIEW ── */}
          {activeSection === 'profile' && (
            <>
              <Reveal>
                <div style={{ marginBottom: 32 }}>
                  <button onClick={() => setActiveSection('overview')} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: 'Outfit,sans-serif', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'} onMouseLeave={e => e.currentTarget.style.color = '#71717a'}>
                    ← Back to overview
                  </button>
                  <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 500, fontSize: '2rem', letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 4 }}>
                    Your Profile
                  </h1>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div style={{ background: '#0a0a0a', border: '1px solid #121212', borderRadius: 16, padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: '#111', border: '1px solid #1e1e1e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 700, color: '#a1a1aa',
                      fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic',
                    }}>
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', marginBottom: 2 }}>{user?.name || 'User'}</div>
                      <div style={{ fontSize: 13, color: '#a1a1aa' }}>{user?.email || '—'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                      { label: 'Cards linked', value: String(cards.length) },
                      { label: 'Trust tier', value: trustTier },
                      { label: 'Total savings', value: totalSaved ? `₹${totalSaved.toLocaleString('en-IN')}` : '₹0' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: '#080808', border: '1px solid #0e0e0e', borderRadius: 12, padding: '16px 18px' }}>
                        <div style={{ fontSize: 11, color: '#71717a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>{item.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#ccc' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </>
          )}

        </main>
      </div>
    </div>
  )
}
