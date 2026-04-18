import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

/* ── Quick action suggestions ── */
const QUICK_ACTIONS = [
  { label: '💳 Best card for shopping', query: 'Best card for shopping' },
  { label: '💰 How can I save more?',   query: 'How can I save more?' },
  { label: '🎁 Show best offers',        query: 'Show best offers' },
  { label: '🆕 Should I get a new card?', query: 'Should I get a new card?' },
]

/* ── Markdown-lite renderer ── */
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
}

/* ── Time ago helper ── */
function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60_000) return 'Updated just now'
  if (diff < 300_000) return 'Updated a few minutes ago'
  return 'Updated recently'
}

export default function Assistant() {
  const { user } = useAuth()
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [insights, setInsights]     = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightsTs, setInsightsTs] = useState(null)
  const chatEndRef = useRef(null)
  const inputRef   = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    try {
      setInsightsLoading(true)
      const res = await api.get('/assistant/insights')
      if (res.data.success) {
        setInsights(res.data.insights)
        setInsightsTs(Date.now())
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err)
    } finally {
      setInsightsLoading(false)
    }
  }

  async function sendMessage(text) {
    const question = (text || input).trim()
    if (!question || loading) return

    const userMsg = { role: 'user', content: question, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/assistant/query', { question })
      const assistantMsg = {
        role: 'assistant',
        content: res.data.answer || 'Sorry, I couldn\'t process that question.',
        intent: res.data.intent,
        offer: res.data.offer,
        actionType: res.data.actionType,
        ts: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
      fetchInsights()
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: err.response?.data?.message || 'Something went wrong. Please try again.',
        ts: Date.now(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const showQuickActions = messages.length === 0

  /* ── Tag color mapping ── */
  function tagStyle(tag) {
    const t = (tag || '').toLowerCase()
    if (t.includes('expir'))   return { background: '#ef4444', color: '#fff' }
    if (t.includes('missed'))  return { background: '#f97316', color: '#fff' }
    if (t.includes('unused'))  return { background: '#8b5cf6', color: '#fff' }
    if (t.includes('high'))    return { background: '#3b82f6', color: '#fff' }
    if (t.includes('gap'))     return { background: '#eab308', color: '#000' }
    if (t.includes('popular')) return { background: '#22c55e', color: '#000' }
    return { background: '#facc15', color: '#000' }
  }

  return (
    <div className="assistant-page">
      {/* ── LEFT: Chat Interface ── */}
      <div className="assistant-chat">
        {/* Header */}
        <div className="assistant-chat-header">
          <div className="assistant-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h2 className="assistant-header-title">Financial Assistant</h2>
            <p className="assistant-header-sub">Personalized insights from your cards, transactions & offers</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="assistant-chat-body">
          {showQuickActions && (
            <div className="assistant-welcome">
              <div className="assistant-welcome-icon">✨</div>
              <h3 className="assistant-welcome-title">
                Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! How can I help?
              </h3>
              <p className="assistant-welcome-sub">
                I analyze your actual cards, recent transactions, and live offers to give you actionable advice — not generic tips.
              </p>

              <div className="assistant-quick-actions">
                {QUICK_ACTIONS.map((qa, i) => (
                  <button
                    key={i}
                    className="assistant-quick-btn"
                    onClick={() => sendMessage(qa.query)}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`assistant-msg ${msg.role} ${msg.isError ? 'error' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {msg.role === 'assistant' && (
                <div className="assistant-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
              )}
              <div className="assistant-msg-bubble">
                <div
                  className="assistant-msg-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
                {msg.offer && (
                  <div className="assistant-offer-card">
                    <div className="assistant-offer-merchant">{msg.offer.merchant}</div>
                    <div className="assistant-offer-discount">{msg.offer.discount}</div>
                    <div className="assistant-offer-meta">
                      via {msg.offer.card} · {msg.offer.type}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="assistant-msg assistant">
              <div className="assistant-msg-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="assistant-msg-bubble">
                <div className="assistant-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="assistant-input-wrap">
          <div className="assistant-input-box">
            <input
              ref={inputRef}
              className="assistant-input"
              type="text"
              placeholder="Ask about your cards, offers, savings..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="assistant-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="assistant-input-hint">
            Try: "best card for amazon", "spending breakdown", "show dining offers"
          </p>
        </div>
      </div>

      {/* ── RIGHT: Smart Insights Panel ── */}
      <div className="assistant-insights">
        <div className="assistant-insights-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Smart Insights
          </div>
          {insightsTs && (
            <span className="insights-updated-label">{timeAgo(insightsTs)}</span>
          )}
        </div>

        {/* Data context badge */}
        {insights?.meta && !insightsLoading && (
          <div className="insights-context-badge">
            Based on {insights.meta.cardCount} card{insights.meta.cardCount !== 1 ? 's' : ''}
            {insights.meta.txnCount > 0 && ` · ${insights.meta.txnCount > 20 ? '20+' : insights.meta.txnCount} recent transactions`}
            {insights.meta.offerCount > 0 && ` · ${insights.meta.offerCount} matching offer${insights.meta.offerCount !== 1 ? 's' : ''}`}
          </div>
        )}

        {insightsLoading ? (
          <div className="assistant-insights-loading">
            <div className="scan-ring" style={{ width: 28, height: 28 }} />
            <span>Analyzing your data...</span>
          </div>
        ) : (
          <>
            {/* Best Card Today */}
            <div className="insight-card">
              <div className="insight-label">Best card to use today</div>
              <div className="insight-value">
                {insights?.bestCard ? (
                  <>
                    <span className="insight-highlight">{insights.bestCard.name}</span>
                    <span className="insight-reason">{insights.bestCard.reason}</span>
                    {insights.bestCard.explanation && (
                      <span className="insight-explanation">{insights.bestCard.explanation}</span>
                    )}
                  </>
                ) : (
                  <span className="insight-empty">Add cards to see recommendation</span>
                )}
              </div>
            </div>

            {/* Potential Savings */}
            <div className="insight-card savings">
              <div className="insight-label">Potential savings per transaction</div>
              <div className="insight-value">
                {insights?.potentialSavings ? (
                  <>
                    <span className="insight-savings-amount">
                      ₹{insights.potentialSavings.low.toLocaleString('en-IN')}–₹{insights.potentialSavings.high.toLocaleString('en-IN')}
                    </span>
                    <span className="insight-explanation">{insights.potentialSavings.explanation}</span>
                  </>
                ) : (
                  <>
                    <span className="insight-savings-amount">₹0</span>
                    <span className="insight-explanation">Add cards and make transactions to see projected savings</span>
                  </>
                )}
              </div>
            </div>

            {/* Top Offers */}
            <div className="insight-card">
              <div className="insight-label">Top offers for your cards</div>
              {insights?.topOffers?.length > 0 ? (
                <div className="insight-offers-list">
                  {insights.topOffers.map((o, i) => (
                    <div key={i} className="insight-offer-item">
                      <div style={{ flex: 1 }}>
                        <div className="insight-offer-merchant">{o.merchant}</div>
                        <div className="insight-offer-discount">{o.discount}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {o.daysLeft <= 7 && (
                          <span className="insight-offer-expiry">
                            {o.daysLeft <= 1 ? 'Today!' : `${o.daysLeft}d left`}
                          </span>
                        )}
                        {o.tag && (
                          <span className="insight-offer-tag" style={tagStyle(o.tag)}>{o.tag}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="insight-empty">No matching offers right now</span>
              )}
            </div>

            {/* Recommendations */}
            {insights?.recommendations?.length > 0 && (
              <div className="insight-card">
                <div className="insight-label">Actionable recommendations</div>
                <div className="insight-recs-list-v2">
                  {insights.recommendations.map((r, i) => (
                    <div key={i} className="insight-rec-item-v2">
                      <div className="insight-rec-header">
                        {r.tag && (
                          <span className="insight-rec-tag" style={tagStyle(r.tag)}>{r.tag}</span>
                        )}
                        <span className="insight-rec-text">{r.text}</span>
                      </div>
                      {r.explanation && (
                        <span className="insight-rec-explanation">{r.explanation}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
