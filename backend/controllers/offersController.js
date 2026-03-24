/* ── GET /api/offers ── returns current best offers ── */
/* In production this would query a live card-offers database / partner API */

const OFFERS = [
  { id:1, merchant:'Amazon',      card:'HDFC Regalia',     discount:'15%', type:'instant',  tag:'Shopping', value:15 },
  { id:2, merchant:'MakeMyTrip',  card:'Axis Magnus',      discount:'20x', type:'points',   tag:'Travel',   value:12 },
  { id:3, merchant:'Swiggy',      card:'ICICI Coral',      discount:'10%', type:'cashback', tag:'Dining',   value:10 },
  { id:4, merchant:'Flipkart',    card:'Kotak 811',        discount:'8%',  type:'instant',  tag:'Shopping', value:8  },
  { id:5, merchant:'Uber',        card:'SBI SimplyCLICK',  discount:'15%', type:'cashback', tag:'Travel',   value:15 },
  { id:6, merchant:'BookMyShow',  card:'HDFC Millennia',   discount:'25%', type:'instant',  tag:'Entertainment', value:25 },
]

exports.getOffers = (req, res) => {
  const { category } = req.query
  const filtered = category
    ? OFFERS.filter(o => o.tag.toLowerCase() === category.toLowerCase())
    : OFFERS
  res.json({ success: true, count: filtered.length, offers: filtered })
}

/* ── POST /api/offers/optimize ── AI-style offer ranking for a given amount ── */
exports.optimizeOffer = (req, res) => {
  const { amount, merchant } = req.body
  if (!amount) return res.status(400).json({ success: false, message: 'Amount is required.' })

  /* Simple ranking: calculate actual rupee savings for each card */
  const ranked = OFFERS.map(o => {
    const savingRupees = o.type === 'points'
      ? Math.round(amount * 0.124)          // Approx point value
      : Math.round(amount * (o.value / 100))
    const platformFee  = Math.round((amount - savingRupees) * 0.012)
    const netSaving    = savingRupees - platformFee
    const amountToPay  = amount - savingRupees + platformFee
    return { ...o, savingRupees, platformFee, netSaving, amountToPay }
  }).sort((a, b) => b.netSaving - a.netSaving)

  res.json({ success: true, ranked })
}
