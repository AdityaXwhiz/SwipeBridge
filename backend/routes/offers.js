const express = require('express')
const { getOffers, optimizeOffer } = require('../controllers/offersController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.get('/',        protect, getOffers)
router.post('/optimize', protect, optimizeOffer)

module.exports = router
