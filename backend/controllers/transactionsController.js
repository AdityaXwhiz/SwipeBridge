const Transaction = require('../models/Transaction')
const User        = require('../models/User')

/* ── GET /api/transactions ── list user's transactions ── */
exports.getTransactions = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const skip  = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ user: req.user._id }),
    ])

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch transactions.' })
  }
}

/* ── POST /api/transactions ── create a transaction (after prepayment confirmed) ── */
exports.createTransaction = async (req, res) => {
  const { productName, productPrice, proxyCard, discountPct, paymentMethod } = req.body

  if (!productName || !productPrice || !proxyCard || discountPct == null) {
    return res.status(400).json({ success: false, message: 'Missing required transaction fields.' })
  }

  try {
    const discountAmt = Math.round(productPrice * (discountPct / 100))
    const platformFee = Math.round((productPrice - discountAmt) * 0.012)  // 1.2% fee
    const amountPaid  = productPrice - discountAmt + platformFee
    const amountSaved = discountAmt - platformFee

    const transaction = await Transaction.create({
      user: req.user._id,
      productName,
      productPrice,
      proxyCard,
      discountPct,
      discountAmt,
      platformFee,
      amountPaid,
      amountSaved,
      paymentMethod: paymentMethod || 'upi',
    })

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalSaved:        amountSaved,
        totalTransactions: 1,
        trustScore:        3,
      },
    })

    // Refresh trust status
    const user = await User.findById(req.user._id)
    user.updateTrustStatus()
    await user.save()

    res.status(201).json({ success: true, transaction })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not create transaction.', error: err.message })
  }
}

/* ── GET /api/transactions/stats ── spending analytics ── */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id
    const stats  = await Transaction.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $group: {
          _id:          null,
          totalSaved:   { $sum: '$amountSaved'  },
          totalSpent:   { $sum: '$amountPaid'   },
          totalTxns:    { $sum: 1               },
          avgSaving:    { $avg: '$amountSaved'  },
        },
      },
    ])

    res.json({ success: true, stats: stats[0] || { totalSaved:0, totalSpent:0, totalTxns:0, avgSaving:0 } })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not compute stats.' })
  }
}
