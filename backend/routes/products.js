const express = require('express')
const { searchProducts } = require('../controllers/productController')

const router = express.Router()

// GET /api/products/search?query=...
router.get('/search', searchProducts)

module.exports = router
