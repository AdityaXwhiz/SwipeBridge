const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
  merchant: {
    type: String, required: true, trim: true,
  },
  category: {
    type: String, required: true, trim: true, lowercase: true,
    enum: ['shopping', 'dining', 'travel', 'fuel', 'entertainment', 'groceries', 'utilities', 'health', 'education', 'insurance'],
  },
  discount: {
    type: String, required: true, trim: true,   // e.g. "10% off", "₹2000 off", "Buy 1 Get 1"
  },
  /* Numeric value of the discount for ranking (percentage or flat ₹ equivalent) */
  discountValue: {
    type: Number, default: 0,
  },
  type: {
    type: String, required: true, trim: true,
    enum: ['Bank Offer', 'Merchant Offer', 'Seasonal Deal', 'Cashback', 'Reward Points'],
    default: 'Bank Offer',
  },
  /* Which bank this offer is tied to (case-insensitive matching) */
  bank: {
    type: String, trim: true, default: '',
  },
  tag: {
    type: String, trim: true, default: '',       // e.g. "Hot", "New", "Flash", "Limited", "Popular"
  },
  /* Redirect URL for the merchant offer page */
  link: {
    type: String, trim: true, default: '',
  },
  expiresAt: {
    type: Date, required: true,
  },
  isActive: {
    type: Boolean, default: true,
  },
}, { timestamps: true })

/* ── Index for fast lookups ── */
offerSchema.index({ category: 1, isActive: 1 })
offerSchema.index({ bank: 1, isActive: 1 })
offerSchema.index({ expiresAt: 1 })

/* ── Virtual: human-readable expiry string ── */
offerSchema.virtual('expires').get(function () {
  const now = new Date()
  const diff = this.expiresAt - now
  if (diff <= 0) return 'Expired'
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return '1 day left'
  return `${days} days left`
})

/* ── Ensure virtuals are included in JSON ── */
offerSchema.set('toJSON', { virtuals: true })
offerSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Offer', offerSchema)
