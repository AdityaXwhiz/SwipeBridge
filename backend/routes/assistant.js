const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const { query, getInsights } = require('../controllers/assistantController')

/* ── POST /api/assistant/query ── process user question ── */
router.post('/query', protect, query)

/* ── GET /api/assistant/insights ── smart insights panel ── */
router.get('/insights', protect, getInsights)

module.exports = router
