const express = require('express')
const { getProducts, scanProduct, optimizePrices } = require('../controllers/bestDealController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/products',            getProducts)    // GET  /api/bestdeal/products?q=iphone
router.get('/scan/:productId',     scanProduct)    // GET  /api/bestdeal/scan/1
router.post('/optimize',           optimizePrices) // POST /api/bestdeal/optimize

module.exports = router
