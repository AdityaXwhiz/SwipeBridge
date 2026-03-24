const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  orderId: {
    type: String, unique: true,
    default: () => 'CP-' + Date.now() + '-' + Math.floor(Math.random()*10000),
  },
  productName:  { type: String, required: true },
  productPrice: { type: Number, required: true },
  proxyCard:    { type: String, required: true },   // e.g. "HDFC Regalia"
  discountPct:  { type: Number, required: true },
  discountAmt:  { type: Number, required: true },
  platformFee:  { type: Number, required: true },
  amountPaid:   { type: Number, required: true },
  amountSaved:  { type: Number, required: true },
  paymentMethod:{ type: String, enum: ['upi','debit_card','net_banking','wallet'], default: 'upi' },
  status: {
    type: String,
    enum: ['pending','processing','completed','failed','refunded'],
    default: 'completed',
  },
  trustPointsEarned: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)
