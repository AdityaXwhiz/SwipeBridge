const Razorpay = require('razorpay')
const crypto = require('crypto')
const Transaction = require('../models/Transaction')
const User = require('../models/User')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/* ── POST /api/payment/create-order ── */
exports.createOrder = async (req, res) => {
    const { amount, productName, proxyCard, discountPct } = req.body

    if (!amount || amount < 1) {
        return res.status(400).json({ success: false, message: 'Amount must be at least ₹1.' })
    }

    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency: 'INR',
            receipt: 'CP-' + Date.now(),
            notes: {
                userId: req.user._id.toString(),
                productName: productName || '',
                proxyCard: proxyCard || '',
                discountPct: String(discountPct || 0),
            },
        })

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            key: process.env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
        })
    } catch (err) {
        console.error('Razorpay order error:', err)
        res.status(500).json({ success: false, message: 'Could not create payment order.', error: err.message })
    }
}

/* ── POST /api/payment/verify ── */
exports.verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        productName,
        productPrice,
        proxyCard,
        discountPct,
        paymentMethod,
    } = req.body

    // 1. Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex')

    if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature.' })
    }

    try {
        // 2. Calculate amounts
        const discountAmt = Math.round(productPrice * ((discountPct || 0) / 100))
        const platformFee = Math.round((productPrice - discountAmt) * 0.012)
        const amountPaid = productPrice - discountAmt + platformFee
        const amountSaved = discountAmt - platformFee

        // 3. Create transaction record
        const transaction = await Transaction.create({
            user: req.user._id,
            productName,
            productPrice,
            proxyCard: proxyCard || 'Direct',
            discountPct: discountPct || 0,
            discountAmt,
            platformFee,
            amountPaid,
            amountSaved: Math.max(amountSaved, 0),
            paymentMethod: paymentMethod || 'razorpay',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'completed',
        })

        // 4. Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                totalSaved: Math.max(amountSaved, 0),
                totalTransactions: 1,
                trustScore: 3,
            },
        })
        const user = await User.findById(req.user._id)
        user.updateTrustStatus()
        await user.save()

        res.status(201).json({ success: true, transaction })
    } catch (err) {
        console.error('Payment verify error:', err)
        res.status(500).json({ success: false, message: 'Payment verified but could not save transaction.', error: err.message })
    }
}
