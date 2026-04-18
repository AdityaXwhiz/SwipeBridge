const jwt  = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '1025548658828-98eupesd7u14i18683on6eb34f1pcr22.apps.googleusercontent.com')

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

/* ── POST /api/auth/forgot-password ── */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' })
  }

  try {
    // Generate a test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount()
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })

    const info = await transporter.sendMail({
      from: '"SwipeBridge Support" <support@swipebridge.com>',
      to: email,
      subject: "Password Reset Request - SwipeBridge",
      text: "Please click the link below to reset your password: http://localhost:5173/reset-password?token=mock_reset_token_123",
      html: "<p>You requested a password reset. Please click the link below to reset your password:</p><a href='http://localhost:5173/reset-password?token=mock_reset_token_123'>Reset Password</a>"
    })

    console.log("Password reset email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info))
    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email successfully.'
    })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ success: false, message: 'Failed to send reset email.' })
  }
}

/* ── POST /api/auth/google ── */
exports.googleAuth = async (req, res) => {
  const { credential } = req.body // this is the access_token from frontend
  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential missing.' })
  }

  try {
    // Fetch user profile using the access_token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` }
    })
    
    if (!userInfoResponse.ok) {
      throw new Error('Invalid Google access token.')
    }
    
    const payload = await userInfoResponse.json()
    const { email, name } = payload
    
    if (!email) throw new Error('Email not provided by Google.')
    
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({ name, email, password: 'google_dummy_password_123_' + Date.now() })
    }
    
    const token = signToken(user._id)
    res.json({
      success: true,
      token,
      user: user.toSafeObject()
    })
  } catch (err) {
    console.error('Google Auth Error:', err)
    res.status(500).json({ success: false, message: 'Google authentication failed.', error: err.message })
  }
}

