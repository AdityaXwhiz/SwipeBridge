const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  holderName:   { type: String, required: true, trim: true },
  bankName:     { type: String, required: true, trim: true },
  network:      { type: String, required: true, enum: ['Visa','Mastercard','American Express','RuPay','Discover'] },
  lastFour:     { type: String, required: true, length: 4 },
  expiry:       { type: String, required: true },      // MM/YY — raw card number never stored
  cardNickname: { type: String, default: '' },
  categories:   [{ type: String }],
  tier: {
    type: String, enum: ['standard','premium','elite'], default: 'premium',
  },
  maxMonthly:        { type: Number, default: null },
  isActive:          { type: Boolean, default: true  },
  totalEarned:       { type: Number,  default: 0     },
  totalTransactions: { type: Number,  default: 0     },
  createdAt:         { type: Date,    default: Date.now },
}, { timestamps: true })

/* ── Never return the full card number ── */
cardSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  return obj
}

module.exports = mongoose.model('Card', cardSchema)
