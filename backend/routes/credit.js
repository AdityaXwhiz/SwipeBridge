const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const { fetchCreditScore, getCreditScore, getEligibility } = require('../controllers/creditController')

/* ── POST /api/credit/score ── fetch score from bureau (consent required) ── */
router.post('/score', protect, fetchCreditScore)

/* ── GET /api/credit/score  ── retrieve stored score ── */
router.get('/score', protect, getCreditScore)

/* ── GET /api/credit/eligibility ── card eligibility based on score ── */
router.get('/eligibility', protect, getEligibility)

module.exports = router
