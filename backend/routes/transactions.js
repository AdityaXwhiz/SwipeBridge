const express = require('express')
const { getTransactions, createTransaction, getStats } = require('../controllers/transactionsController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/',       getTransactions)
router.post('/',      createTransaction)
router.get('/stats',  getStats)

module.exports = router
