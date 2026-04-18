const express = require('express')
const { createOrder, verifyPayment } = require('../controllers/paymentController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.post('/create-order', createOrder)
router.post('/verify', verifyPayment)

module.exports = router
