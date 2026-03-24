const { validationResult } = require('express-validator')
const Card = require('../models/Card')

/* ── GET /api/cards ── get all cards for logged-in user ── */
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({ owner: req.user._id, isActive: true }).sort('-createdAt')
    res.json({ success: true, count: cards.length, cards })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch cards.' })
  }
}

/* ── POST /api/cards ── add a new card ── */
exports.addCard = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }

  const { holderName, cardNumber, expiry, network, bankName, cardNickname, categories, tier, maxMonthly } = req.body

  try {
    // Store only last 4 digits — never the full number
    const lastFour = cardNumber.replace(/\s/g,'').slice(-4)

    const card = await Card.create({
      owner: req.user._id,
      holderName,
      bankName,
      network,
      lastFour,
      expiry,
      cardNickname: cardNickname || '',
      categories:   categories   || [],
      tier:         tier         || 'premium',
      maxMonthly:   maxMonthly   || null,
    })

    res.status(201).json({ success: true, card })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not add card.', error: err.message })
  }
}

/* ── DELETE /api/cards/:id ── remove a card ── */
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, owner: req.user._id })
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' })

    card.isActive = false
    await card.save()

    res.json({ success: true, message: 'Card removed from network.' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not remove card.' })
  }
}

/* ── GET /api/cards/network ── public cards for proxy matching (no personal data) ── */
exports.getNetworkCards = async (req, res) => {
  try {
    const cards = await Card.find({ isActive: true })
      .select('network bankName categories tier')
      .limit(50)
    res.json({ success: true, count: cards.length, cards })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch network cards.' })
  }
}
