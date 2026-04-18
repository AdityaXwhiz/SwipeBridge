const Offer = require('../models/Offer')
const Card  = require('../models/Card')

/* ══════════════════════════════════════════════════════════
   GET /api/offers
   ──────────────────────────────────────────────────────────
   Smart offers engine:
   1. Fetch all active, non-expired offers from DB
   2. If the user has saved cards, rank offers by relevance:
      - Tier 1 (highest):  matches BOTH card bank AND card category
      - Tier 2:            matches card category only
      - Tier 3:            matches card bank only
      - Tier 4:            no match (still shown, lowest rank)
   3. Within each tier, sort by discountValue (descending)
   4. Supports ?category= query filter (case-insensitive)
   ══════════════════════════════════════════════════════════ */
exports.getOffers = async (req, res) => {
  try {
    /* ── Build base query: active + not expired ── */
    const query = { isActive: true, expiresAt: { $gt: new Date() } }

    /* ── Optional category filter (case-insensitive, trimmed) ── */
    const { category } = req.query
    if (category) {
      const sanitized = category.trim().toLowerCase()
      if (sanitized) {
        query.category = sanitized
      }
    }

    /* ── Fetch offers from DB ── */
    const offers = await Offer.find(query).sort('-discountValue').lean({ virtuals: true })

    /* ── Fetch user's cards for smart ranking ── */
    let userBanks = []
    let userCategories = []

    if (req.user) {
      const cards = await Card.find({ owner: req.user._id, isActive: true })
        .select('bankName categories')
        .lean()

      /* Normalize bank names: "HDFC Bank" → "hdfc", "SBI" → "sbi" */
      userBanks = [...new Set(
        cards.map(c => (c.bankName || '').split(' ')[0].toLowerCase()).filter(Boolean)
      )]
      userCategories = [...new Set(
        cards.flatMap(c => (c.categories || []).map(cat => cat.toLowerCase()))
      )]
    }

    /* ── Rank offers by relevance to user's cards ── */
    const ranked = offers.map(offer => {
      const offerBank = (offer.bank || '').toLowerCase()
      const offerCategory = (offer.category || '').toLowerCase()

      const bankMatch    = userBanks.some(b => offerBank.includes(b) || b.includes(offerBank))
      const categoryMatch = userCategories.includes(offerCategory)

      let relevanceScore = 0
      if (bankMatch && categoryMatch)  relevanceScore = 3   // Tier 1: both match
      else if (categoryMatch)          relevanceScore = 2   // Tier 2: category match
      else if (bankMatch)              relevanceScore = 1   // Tier 3: bank match
      // Tier 4: relevanceScore stays 0

      /* ── Composite sort key: relevance × 1000 + discountValue ── */
      const sortKey = relevanceScore * 1000 + (offer.discountValue || 0)

      /* ── Build card name for frontend display ── */
      const card = offer.bank || 'Any Card'

      return {
        id:        offer._id,
        merchant:  offer.merchant,
        category:  offer.category,
        discount:  offer.discount,
        type:      offer.type,
        card,
        tag:       offer.tag || '',
        expires:   offer.expires || '',
        expiresAt: offer.expiresAt,
        relevanceScore,
        _sortKey:  sortKey,
      }
    })

    /* ── Sort: highest relevance first, then by discount value ── */
    ranked.sort((a, b) => b._sortKey - a._sortKey)

    /* ── Strip internal sort key before sending ── */
    const result = ranked.map(({ _sortKey, ...rest }) => rest)

    res.json({ success: true, count: result.length, offers: result })
  } catch (err) {
    console.error('Offers fetch error:', err)
    res.status(500).json({ success: false, message: 'Could not fetch offers.' })
  }
}

/* ══════════════════════════════════════════════════════════
   POST /api/offers/optimize
   ──────────────────────────────────────────────────────────
   AI-style offer ranking for a given payment amount.
   Returns all active offers ranked by actual ₹ savings.
   ══════════════════════════════════════════════════════════ */
exports.optimizeOffer = async (req, res) => {
  try {
    const { amount, merchant } = req.body
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required.' })
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' })
    }

    /* ── Fetch active offers ── */
    const query = { isActive: true, expiresAt: { $gt: new Date() } }
    if (merchant) {
      query.merchant = { $regex: new RegExp(merchant.trim(), 'i') }
    }
    const offers = await Offer.find(query).lean({ virtuals: true })

    /* ── Calculate actual rupee savings for each ── */
    const ranked = offers.map(offer => {
      const savingRupees = offer.type === 'Reward Points'
        ? Math.round(numAmount * 0.124)
        : Math.round(numAmount * ((offer.discountValue || 0) / 100))

      const platformFee = Math.round((numAmount - savingRupees) * 0.012)
      const netSaving   = savingRupees - platformFee
      const amountToPay = numAmount - savingRupees + platformFee

      return {
        id:       offer._id,
        merchant: offer.merchant,
        card:     offer.bank || 'Any Card',
        discount: offer.discount,
        type:     offer.type,
        tag:      offer.tag,
        category: offer.category,
        savingRupees,
        platformFee,
        netSaving,
        amountToPay,
      }
    }).sort((a, b) => b.netSaving - a.netSaving)

    res.json({ success: true, ranked })
  } catch (err) {
    console.error('Offer optimization error:', err)
    res.status(500).json({ success: false, message: 'Could not optimize offers.' })
  }
}
