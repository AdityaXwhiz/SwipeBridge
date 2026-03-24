const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true, maxlength: 80,
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String, required: [true, 'Password is required'], minlength: 6, select: false,
  },
  trustScore: { type: Number, default: 30, min: 0, max: 100 },
  trustStatus: {
    type: String,
    enum: ['basic','verified','trusted','premium'],
    default: 'basic',
  },
  cibilScore:       { type: Number, default: null },
  totalSaved:       { type: Number, default: 0    },
  totalTransactions:{ type: Number, default: 0    },
  plan: {
    type: String, enum: ['free','pro','premium'], default: 'free',
  },
  kycVerified: { type: Boolean, default: false },
  createdAt:   { type: Date,    default: Date.now },
}, { timestamps: true })

/* ── Hash password before save ── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

/* ── Compare password ── */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

/* ── Update trust status based on score ── */
userSchema.methods.updateTrustStatus = function () {
  const s = this.trustScore
  if      (s >= 90) this.trustStatus = 'premium'
  else if (s >= 70) this.trustStatus = 'trusted'
  else if (s >= 40) this.trustStatus = 'verified'
  else              this.trustStatus = 'basic'
}

/* ── Strip sensitive fields from JSON output ── */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
