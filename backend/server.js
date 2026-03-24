require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const connectDB  = require('./config/db')

/* ── connect database ── */
connectDB()

const app = express()

/* ── security middleware ── */
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

/* ── general middleware ── */
app.use(express.json({ limit: '10kb' }))
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))

/* ── rate limiting ── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
})

/* ── routes ── */
app.use('/api/auth',         authLimiter, require('./routes/auth'))
app.use('/api/cards',        require('./routes/cards'))
app.use('/api/transactions', require('./routes/transactions'))
app.use('/api/offers',       require('./routes/offers'))
app.use('/api/user',         require('./routes/user'))
app.use('/api/bestdeal',     require('./routes/bestDeal'))

/* ── health check ── */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CardProxy API is running', env: process.env.NODE_ENV })
})

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

/* ── global error handler ── */
app.use((err, req, res, next) => {
  console.error(err.stack)
  const status = err.statusCode || 500
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 CardProxy API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
})
