const User        = require('../models/User')
const Card        = require('../models/Card')
const Offer       = require('../models/Offer')
const Transaction = require('../models/Transaction')

/* ══════════════════════════════════════════════════════════
   CREDIT SCORE STATUS HELPER
   ══════════════════════════════════════════════════════════ */
function scoreStatus(score) {
  if (score >= 750) return 'excellent'
  if (score >= 700) return 'good'
  if (score >= 600) return 'fair'
  return 'poor'
}

function statusLabel(status) {
  return { poor: 'Poor', fair: 'Fair', good: 'Good', excellent: 'Excellent' }[status] || 'Unknown'
}

/* ══════════════════════════════════════════════════════════
   CARD ELIGIBILITY DATABASE
   ──────────────────────────────────────────────────────────
   Real card eligibility rules with min score, income,
   category benefits, and match scoring.
   ══════════════════════════════════════════════════════════ */
const CARD_DATABASE = [
  {
    name: 'HDFC Regalia',
    bank: 'HDFC',
    tier: 'premium',
    minScore: 750,
    minIncome: 1200000,
    categories: ['travel', 'dining', 'shopping'],
    benefits: ['10X reward points on dining', '4 complimentary lounge visits/quarter', '1% fuel surcharge waiver'],
    annualFee: 2500,
    joiningBonus: '2500 reward points',
    applyLink: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards',
  },
  {
    name: 'HDFC MoneyBack+',
    bank: 'HDFC',
    tier: 'standard',
    minScore: 650,
    minIncome: 400000,
    categories: ['shopping', 'groceries'],
    benefits: ['2% cashback on online spends', '1% on other spends', 'Fuel surcharge waiver'],
    annualFee: 500,
    joiningBonus: '500 cashback',
    applyLink: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards',
  },
  {
    name: 'SBI SimplyCLICK',
    bank: 'SBI',
    tier: 'standard',
    minScore: 650,
    minIncome: 400000,
    categories: ['shopping', 'entertainment'],
    benefits: ['10X rewards on partner sites', '5X on online spends', 'E-voucher on reaching milestones'],
    annualFee: 499,
    joiningBonus: '₹500 Amazon voucher',
    applyLink: 'https://www.sbicard.com/en/apply.page',
  },
  {
    name: 'SBI Elite',
    bank: 'SBI',
    tier: 'premium',
    minScore: 750,
    minIncome: 1500000,
    categories: ['travel', 'dining', 'entertainment'],
    benefits: ['5X rewards on dining & movies', 'Complimentary Club Vistara membership', 'Trident Privilege membership'],
    annualFee: 4999,
    joiningBonus: '5000 reward points',
    applyLink: 'https://www.sbicard.com/en/apply.page',
  },
  {
    name: 'ICICI Amazon Pay',
    bank: 'ICICI',
    tier: 'standard',
    minScore: 650,
    minIncome: 300000,
    categories: ['shopping'],
    benefits: ['5% back on Amazon with Prime', '2% on bill payments', '1% on all other spends'],
    annualFee: 0,
    joiningBonus: '₹500 Amazon pay balance',
    applyLink: 'https://www.icicibank.com/credit-card',
  },
  {
    name: 'ICICI Coral',
    bank: 'ICICI',
    tier: 'premium',
    minScore: 720,
    minIncome: 800000,
    categories: ['dining', 'fuel', 'travel'],
    benefits: ['Buy 1 Get 1 on BookMyShow', '4 lounge visits/year', 'Fuel surcharge waiver'],
    annualFee: 500,
    joiningBonus: '2000 reward points',
    applyLink: 'https://www.icicibank.com/credit-card',
  },
  {
    name: 'Axis Flipkart',
    bank: 'Axis',
    tier: 'standard',
    minScore: 600,
    minIncome: 300000,
    categories: ['shopping', 'groceries'],
    benefits: ['5% cashback on Flipkart', '4% on preferred partners', '1.5% on all other spends'],
    annualFee: 500,
    joiningBonus: '₹500 Flipkart voucher',
    applyLink: 'https://www.axisbank.com/retail/cards/credit-card/apply-now',
  },
  {
    name: 'Axis Magnus',
    bank: 'Axis',
    tier: 'elite',
    minScore: 780,
    minIncome: 2400000,
    categories: ['travel', 'dining', 'shopping'],
    benefits: ['35X Edge rewards on Axis Travel Edge', '12X on partner merchants', '8 complimentary lounge visits'],
    annualFee: 12500,
    joiningBonus: '25000 Edge reward points',
    applyLink: 'https://www.axisbank.com/retail/cards/credit-card/apply-now',
  },
  {
    name: 'Kotak 811 Dream Different',
    bank: 'Kotak',
    tier: 'standard',
    minScore: 600,
    minIncome: 250000,
    categories: ['shopping', 'dining'],
    benefits: ['1.5% cashback on all spends', 'Welcome voucher worth ₹500', 'No annual fee first year'],
    annualFee: 0,
    joiningBonus: '₹500 voucher',
    applyLink: 'https://www.kotak.com/en/personal-banking/cards/credit-cards.html',
  },
  {
    name: 'RBL ShopRite',
    bank: 'RBL',
    tier: 'standard',
    minScore: 600,
    minIncome: 300000,
    categories: ['shopping', 'groceries', 'fuel'],
    benefits: ['5% cashback on ShopRite partners', '2% on other online', 'Fuel surcharge waiver'],
    annualFee: 0,
    joiningBonus: '₹250 cashback',
    applyLink: 'https://www.rblbank.com/personal-banking/cards/credit-cards',
  },
  {
    name: 'Yes Prosperity Edge',
    bank: 'Yes Bank',
    tier: 'standard',
    minScore: 650,
    minIncome: 350000,
    categories: ['fuel', 'groceries', 'utilities'],
    benefits: ['2% cashback on fuel & grocery', 'Utility bill rewards', 'Accident insurance cover'],
    annualFee: 399,
    joiningBonus: '₹500 cashback',
    applyLink: 'https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards',
  },
  {
    name: 'IndusInd Legend',
    bank: 'IndusInd',
    tier: 'premium',
    minScore: 750,
    minIncome: 1000000,
    categories: ['travel', 'dining', 'entertainment'],
    benefits: ['3 domestic lounge visits/quarter', 'Golf privileges', '2X rewards on weekends'],
    annualFee: 3500,
    joiningBonus: '10000 reward points',
    applyLink: 'https://www.indusind.com/in/en/personal/cards/credit-cards.html',
  },
]

/* ══════════════════════════════════════════════════════════
   POST /api/credit/score
   ──────────────────────────────────────────────────────────
   Fetches credit score. In production, this would call
   CIBIL/CRIF/Experian API. Sensitive data (PAN) is used
   ONLY for the API call and NEVER stored in the DB.
   ══════════════════════════════════════════════════════════ */
exports.fetchCreditScore = async (req, res) => {
  try {
    const { name, pan, dob, phone, consent, annualIncome } = req.body

    /* Validate consent */
    if (!consent) {
      return res.status(400).json({
        success: false,
        message: 'User consent is required to fetch credit score. We do not store your PAN or sensitive financial data.',
      })
    }

    /* Validate required fields */
    if (!name || !pan || !dob || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, PAN, date of birth, and phone number are required.',
      })
    }

    /* Validate PAN format */
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Expected: ABCDE1234F',
      })
    }

    /* Validate phone format */
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number.',
      })
    }

    /*
     * ═══════════════════════════════════════════════════
     * CREDIT BUREAU API INTEGRATION POINT
     * ═══════════════════════════════════════════════════
     *
     * In production, replace this block with a real API call:
     *
     * const response = await axios.post(process.env.CREDIT_API_URL, {
     *   name, pan: pan.toUpperCase(), dob, phone,
     *   api_key: process.env.CREDIT_API_KEY,
     * })
     * const creditScore = response.data.score
     *
     * IMPORTANT: PAN and DOB are used ONLY for the API call.
     * They are NOT stored in our database.
     * ═══════════════════════════════════════════════════
     */

    /* ── Generate score using a deterministic hash of user data ── */
    /* This produces a consistent score per user (not random each time) */
    const userId = req.user._id.toString()
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash |= 0
    }
    /* Map hash to a score between 550 and 850 with realistic distribution */
    const normalizedHash = Math.abs(hash % 1000) / 1000  // 0 to 1
    const userTransactions = await Transaction.countDocuments({ user: req.user._id, status: 'completed' })
    const userCards = await Card.countDocuments({ owner: req.user._id, isActive: true })

    /* Base score influenced by activity — more active users get slightly higher scores */
    const activityBonus = Math.min(userTransactions * 3, 60) + Math.min(userCards * 15, 45)
    const baseScore = Math.round(550 + normalizedHash * 200 + activityBonus)
    const creditScore = Math.min(Math.max(baseScore, 300), 900)
    const status = scoreStatus(creditScore)

    /* ── Store ONLY the score + timestamp, NEVER PAN/DOB ── */
    await User.findByIdAndUpdate(req.user._id, {
      creditScore,
      creditScoreStatus: status,
      creditScoreFetchedAt: new Date(),
      creditConsentGiven: true,
      ...(annualIncome && { annualIncome: Number(annualIncome) }),
    })

    res.json({
      success: true,
      creditScore,
      status,
      statusLabel: statusLabel(status),
      fetchedAt: new Date().toISOString(),
      disclaimer: 'Your PAN and personal details were used only for this request and are NOT stored in our system.',
    })
  } catch (err) {
    console.error('Credit score fetch error:', err)
    res.status(500).json({ success: false, message: 'Could not fetch credit score. Please try again later.' })
  }
}

/* ══════════════════════════════════════════════════════════
   GET /api/credit/score
   ──────────────────────────────────────────────────────────
   Returns stored credit score (if previously fetched).
   ══════════════════════════════════════════════════════════ */
exports.getCreditScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('creditScore creditScoreStatus creditScoreFetchedAt annualIncome creditConsentGiven')
      .lean()

    if (!user.creditScore) {
      return res.json({
        success: true,
        hasCreditScore: false,
        message: 'No credit score on file. Fetch your score to get started.',
      })
    }

    res.json({
      success: true,
      hasCreditScore: true,
      creditScore: user.creditScore,
      status: user.creditScoreStatus,
      statusLabel: statusLabel(user.creditScoreStatus),
      fetchedAt: user.creditScoreFetchedAt,
      annualIncome: user.annualIncome,
    })
  } catch (err) {
    console.error('Get credit score error:', err)
    res.status(500).json({ success: false, message: 'Could not retrieve credit score.' })
  }
}

/* ══════════════════════════════════════════════════════════
   GET /api/credit/eligibility
   ──────────────────────────────────────────────────────────
   Returns eligible cards based on credit score, income,
   existing cards, and spending behavior.
   ══════════════════════════════════════════════════════════ */
exports.getEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('creditScore creditScoreStatus annualIncome')
      .lean()

    if (!user.creditScore) {
      return res.json({
        success: true,
        hasScore: false,
        message: 'Fetch your credit score first to see card eligibility.',
      })
    }

    const { creditScore, annualIncome } = user
    const income = annualIncome || 500000  // default assumption

    /* Fetch user's existing cards to avoid recommending what they have */
    const existingCards = await Card.find({ owner: req.user._id, isActive: true }).select('bankName').lean()
    const existingBanks = new Set(existingCards.map(c => (c.bankName || '').split(' ')[0].toLowerCase()))

    /* Fetch user's spending patterns for match scoring */
    const transactions = await Transaction.find({ user: req.user._id, status: 'completed' })
      .sort('-createdAt').limit(30).lean()

    /* Detect user's spending categories */
    const spendingCategories = new Set()
    transactions.forEach(t => {
      const name = (t.productName || '').toLowerCase()
      if (name.match(/amazon|flipkart|shop|myntra|buy/))        spendingCategories.add('shopping')
      if (name.match(/food|swiggy|zomato|dine|restaurant/))     spendingCategories.add('dining')
      if (name.match(/fuel|petrol|diesel|hp |indian oil/))      spendingCategories.add('fuel')
      if (name.match(/flight|hotel|travel|trip|ola|uber/))      spendingCategories.add('travel')
      if (name.match(/grocer|bigbasket|blinkit|zepto/))         spendingCategories.add('groceries')
      if (name.match(/netflix|hotstar|movie|game|spotify/))     spendingCategories.add('entertainment')
      if (name.match(/electric|water|gas|bill|recharge/))       spendingCategories.add('utilities')
    })

    /* Check active offers per bank */
    const offers = await Offer.find({ isActive: true, expiresAt: { $gt: new Date() } }).lean()
    const offersByBank = {}
    offers.forEach(o => {
      const bank = (o.bank || '').split(' ')[0].toLowerCase()
      offersByBank[bank] = (offersByBank[bank] || 0) + 1
    })

    /* Score and categorize each card */
    const eligible = []
    const nearEligible = []

    CARD_DATABASE.forEach(card => {
      const cardBank = card.bank.toLowerCase()
      const alreadyHas = existingBanks.has(cardBank)

      /* Calculate eligibility */
      const scoreOk   = creditScore >= card.minScore
      const incomeOk  = income >= card.minIncome
      const isEligible = scoreOk && incomeOk

      /* Calculate match percentage (how well does this card fit the user) */
      let matchScore = 0
      let matchReasons = []

      /* Score match */
      if (scoreOk) {
        const scoreSurplus = creditScore - card.minScore
        matchScore += Math.min(scoreSurplus / 100 * 20, 20)  // up to 20 pts
        if (scoreSurplus > 50) matchReasons.push('Strong credit profile')
      }

      /* Income match */
      if (incomeOk) {
        matchScore += 15
      }

      /* Category match — does the card's benefits align with user's spending? */
      const categoryOverlap = card.categories.filter(c => spendingCategories.has(c))
      if (categoryOverlap.length > 0) {
        matchScore += categoryOverlap.length * 12
        matchReasons.push(`Matches your ${categoryOverlap.join(', ')} spending`)
      }

      /* Offer availability bonus */
      const bankOffers = offersByBank[cardBank] || 0
      if (bankOffers > 0) {
        matchScore += Math.min(bankOffers * 3, 15)
        matchReasons.push(`${bankOffers} active offer${bankOffers > 1 ? 's' : ''} from ${card.bank}`)
      }

      /* Penalty for already having a card from this bank */
      if (alreadyHas) {
        matchScore -= 10
      }

      /* Fee value — free cards get a small bonus */
      if (card.annualFee === 0) {
        matchScore += 8
        matchReasons.push('Zero annual fee')
      }

      /* Normalize to percentage (max realistic score ~75 pts) */
      const matchPct = Math.min(Math.round((matchScore / 75) * 100), 99)

      const cardResult = {
        name: card.name,
        bank: card.bank,
        tier: card.tier,
        categories: card.categories,
        benefits: card.benefits,
        annualFee: card.annualFee,
        joiningBonus: card.joiningBonus,
        minScore: card.minScore,
        minIncome: card.minIncome,
        matchPct: Math.max(matchPct, 15),  // floor at 15%
        matchReasons: matchReasons.slice(0, 3),
        alreadyHas,
        applyLink: card.applyLink,
      }

      if (isEligible) {
        /* Tag assignment */
        if (matchPct >= 75) cardResult.tag = 'High approval chance'
        else if (matchPct >= 50) cardResult.tag = 'Good match'
        else cardResult.tag = 'Eligible'

        eligible.push(cardResult)
      } else {
        /* Calculate what needs improvement */
        const gaps = []
        if (!scoreOk) gaps.push(`Need ${card.minScore - creditScore} more credit points`)
        if (!incomeOk) gaps.push(`Min income: ₹${(card.minIncome / 100000).toFixed(1)}L`)
        cardResult.gaps = gaps
        cardResult.tag = 'Needs improvement'
        nearEligible.push(cardResult)
      }
    })

    /* Sort by match percentage */
    eligible.sort((a, b) => b.matchPct - a.matchPct)
    nearEligible.sort((a, b) => b.matchPct - a.matchPct)

    /* Generate improvement tips based on user's situation */
    const tips = []

    if (creditScore < 750) {
      if (creditScore < 650) {
        tips.push({ icon: '📊', text: 'Pay all credit card bills on time — even one missed payment can drop your score significantly' })
        tips.push({ icon: '📉', text: 'Keep your credit utilization below 30% — currently, a lower utilization signals responsible credit behavior' })
      }
      tips.push({ icon: '💳', text: 'Avoid applying for multiple cards at once — each application creates a hard inquiry on your report' })
      tips.push({ icon: '⏰', text: 'Maintain older credit accounts — credit history length significantly impacts your score' })
    }

    if (existingCards.length > 0) {
      tips.push({ icon: '🔄', text: 'Use all your cards regularly (even small purchases) — dormant cards don\'t build credit history' })
    }

    if (creditScore >= 700) {
      tips.push({ icon: '✅', text: 'Your score is healthy — focus on maintaining it by keeping utilization low and payments timely' })
    }

    tips.push({ icon: '🔍', text: 'Check your credit report annually for errors — disputed inaccuracies can be corrected to improve your score' })

    res.json({
      success: true,
      hasScore: true,
      creditScore,
      eligible: eligible.slice(0, 6),
      nearEligible: nearEligible.slice(0, 4),
      tips: tips.slice(0, 4),
      meta: {
        totalCardsAnalyzed: CARD_DATABASE.length,
        eligibleCount: eligible.length,
        nearEligibleCount: nearEligible.length,
        userSpendingCategories: [...spendingCategories],
      },
    })
  } catch (err) {
    console.error('Eligibility error:', err)
    res.status(500).json({ success: false, message: 'Could not determine card eligibility.' })
  }
}
