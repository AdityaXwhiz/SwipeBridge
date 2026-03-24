const jwt  = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')

/* ── helper: sign JWT ── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

/* ── POST /api/auth/signup ── */
exports.signup = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }

  const { name, email, password } = req.body

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    const user = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during signup.', error: err.message })
  }
}

/* ── POST /api/auth/login ── */
exports.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' })
    }

    const token = signToken(user._id)

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message })
  }
}

/* ── GET /api/auth/me ── */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ success: true, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch user.' })
  }
}

/* ── POST /api/auth/logout ── */
exports.logout = (req, res) => {
  // JWT is stateless; client removes the token.
  res.json({ success: true, message: 'Logged out successfully.' })
}
