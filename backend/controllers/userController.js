const User = require('../models/User')

/* ── GET /api/user/profile ── */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ success: true, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch profile.' })
  }
}

/* ── PATCH /api/user/profile ── */
exports.updateProfile = async (req, res) => {
  const allowed = ['name']
  const updates = {}
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field] })

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ success: true, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update profile.' })
  }
}

/* ── GET /api/user/trust-score ── */
exports.getTrustScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('trustScore trustStatus')
    const PERKS = {
      basic:    [],
      verified: ['Offer discovery', 'Up to 5 proxy payments/month'],
      trusted:  ['EMI up to ₹50,000', 'Credit line ₹25,000', 'Unlimited payments'],
      premium:  ['0% platform fee', 'Credit line ₹2,00,000', 'Priority support', 'All perks'],
    }
    res.json({
      success: true,
      score:   user.trustScore,
      status:  user.trustStatus,
      perks:   PERKS[user.trustStatus] || [],
      nextMilestone: user.trustScore < 40 ? 40 : user.trustScore < 70 ? 70 : user.trustScore < 90 ? 90 : 100,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch trust score.' })
  }
}
