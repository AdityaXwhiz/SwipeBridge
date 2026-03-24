const express = require('express')
const { getProfile, updateProfile, getTrustScore } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/profile',     getProfile)
router.patch('/profile',   updateProfile)
router.get('/trust-score', getTrustScore)

module.exports = router
