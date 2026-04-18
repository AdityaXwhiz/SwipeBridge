const express = require('express')
const { body  } = require('express-validator')
const { signup, login, getMe, logout, forgotPassword, googleAuth } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max:80 }),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min:6 }).withMessage('Password must be at least 6 characters'),
  ],
  signup
)

router.post('/login',
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
)

router.post('/forgot-password', forgotPassword)
router.post('/google', googleAuth)

router.get('/me',     protect, getMe)
router.post('/logout', protect, logout)

module.exports = router
