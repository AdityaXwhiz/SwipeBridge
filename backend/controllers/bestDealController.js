/**
 * BestDeal AI Controller
 * ---------------------
 * In production:
 *  - Replace MOCK_PRICES with real calls to retailer APIs / price-scraping service
 *  - Connect CARD_OFFERS to your live Card collection in MongoDB
 *  - Use a job queue (Bull / BullMQ) to refresh prices in the background
 */

/* ── MOCK PLATFORM PRICES ── (replace with real API calls) */
const MOCK_CATALOG = [
  {
    id: '1', name: 'iPhone 15 128GB', category: 'Electronics',
    platforms: [
      { name: 'Amazon',   price: 79900, delivery: '1-2 days', rating: 4.5, reviews: 12400 },
      { name: 'Flipkart', price: 78999, delivery: '2-3 days', rating: 4.4, reviews: 9800  },
      { name: 'Croma',    price: 80900, delivery: '3-4 days', rating: 4.3, reviews: 3200  },
    ],
  },
  {
    id: '2', name: 'Samsung Galaxy S24', category: 'Electronics',
    platforms: [
      { name: 'Amazon',   price: 74999, delivery: '1-2 days', rating: 4.4, reviews: 8700  },
      { name: 'Flipkart', price: 72999, delivery: '1-2 days', rating: 4.5, reviews: 11200 },
    ],
  },
  {
    id: '3', name: 'MacBook Air M3', category: 'Computers',
    platforms: [
      { name: 'Amazon',   price: 114900, delivery: '1-2 days', rating: 4.8, reviews: 6700 },
      { name: 'Flipkart', price: 112999, delivery: '2-3 days', rating: 4.7, reviews: 4200 },
    ],
  },
]

/* ── MOCK CARD OFFERS ── (replace with Card.find() from MongoDB) */
const CARD_OFFERS = [
  { card: 'HDFC Regalia',    discount: 15, type: 'instant',  platforms: ['Amazon']              },
  { card: 'Axis Magnus',     discount: 12, type: 'points',   platforms: ['Amazon','Flipkart']   },
  { card: 'ICICI Amazon',    discount: 5,  type: 'cashback', platforms: ['Amazon']              },
  { card: 'Kotak 811',       discount: 8,  type: 'instant',  platforms: ['Flipkart','Myntra']   },
  { card: 'SBI SimplyCLICK', discount: 10, type: 'cashback', platforms: ['Amazon','Flipkart']   },
]

const PLATFORM_FEE_RATE = 0.012   // 1.2% CardProxy service fee

function calcOptimized(platformName, price) {
  const offers = CARD_OFFERS.filter(o => o.platforms.includes(platformName))
  if (!offers.length) return { card: null, discount: 0, saving: 0, fee: 0, finalPrice: price, type: null }

  const best       = offers.reduce((a, b) => a.discount > b.discount ? a : b)
  const savingAmt  = Math.round(price * (best.discount / 100))
  const fee        = Math.round((price - savingAmt) * PLATFORM_FEE_RATE)
  const finalPrice = price - savingAmt + fee
  const netSaving  = savingAmt - fee

  return { card: best.card, discount: best.discount, saving: netSaving, fee, finalPrice, type: best.type }
}

/* ─────────────────────────────────────────────────────────
   GET /api/bestdeal/products
   Returns paginated product catalog
───────────────────────────────────────────────────────── */
exports.getProducts = (req, res) => {
  const { q, category } = req.query
  let results = MOCK_CATALOG

  if (q) {
    const query = q.toLowerCase()
    results = results.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  if (category) {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase())
  }

  res.json({ success: true, count: results.length, products: results.map(p => ({
    id: p.id, name: p.name, category: p.category,
    platformCount: p.platforms.length,
    minPrice: Math.min(...p.platforms.map(pl => pl.price)),
  })) })
}

/* ─────────────────────────────────────────────────────────
   GET /api/bestdeal/scan/:productId
   Scans all platforms + applies card optimization for one product
───────────────────────────────────────────────────────── */
exports.scanProduct = (req, res) => {
  const product = MOCK_CATALOG.find(p => p.id === req.params.productId)
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' })
  }

  /* Build per-platform results */
  const platformResults = product.platforms.map(p => {
    const opt = calcOptimized(p.name, p.price)
    return {
      platform:    p.name,
      listedPrice: p.price,
      delivery:    p.delivery,
      rating:      p.rating,
      reviews:     p.reviews,
      cardOffer:   opt.card ? {
        card:       opt.card,
        discount:   opt.discount,
        type:       opt.type,
        saving:     opt.saving,
        fee:        opt.fee,
      } : null,
      effectivePrice: opt.finalPrice,
    }
  })

  /* Find the true best deal */
  const bestDeal = platformResults.reduce((a, b) => a.effectivePrice < b.effectivePrice ? a : b)
  const bestPrice = platformResults.reduce((a, b) => a.listedPrice < b.listedPrice ? a : b)

  const listedMin = bestPrice.listedPrice
  const trueSaving = listedMin - bestDeal.effectivePrice

  res.json({
    success: true,
    product: { id: product.id, name: product.name, category: product.category },
    platforms: platformResults,
    summary: {
      platformsScanned:  platformResults.length,
      lowestListedPrice: listedMin,
      lowestListedAt:    bestPrice.platform,
      trueBestPrice:     bestDeal.effectivePrice,
      trueBestAt:        bestDeal.platform,
      bestCard:          bestDeal.cardOffer?.card || null,
      totalSavings:      trueSaving > 0 ? trueSaving : 0,
    },
  })
}

/* ─────────────────────────────────────────────────────────
   POST /api/bestdeal/optimize
   Accepts { productName, platforms: [{name, price}] }
   Used for custom / user-submitted price checks
───────────────────────────────────────────────────────── */
exports.optimizePrices = (req, res) => {
  const { productName, platforms } = req.body

  if (!productName || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ success: false, message: 'productName and platforms[] are required.' })
  }

  const results = platforms.map(p => {
    const opt = calcOptimized(p.name, p.price)
    return {
      platform:       p.name,
      listedPrice:    p.price,
      effectivePrice: opt.finalPrice,
      saving:         opt.saving,
      cardOffer:      opt.card ? { card: opt.card, discount: opt.discount, type: opt.type, fee: opt.fee } : null,
    }
  })

  const best      = results.reduce((a, b) => a.effectivePrice < b.effectivePrice ? a : b)
  const listedMin = Math.min(...results.map(r => r.listedPrice))

  res.json({
    success: true,
    productName,
    platforms: results,
    recommendation: {
      platform:   best.platform,
      price:      best.effectivePrice,
      card:       best.cardOffer?.card || null,
      totalSaved: listedMin - best.effectivePrice,
    },
  })
}
