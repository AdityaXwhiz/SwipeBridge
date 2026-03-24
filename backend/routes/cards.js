const express = require('express')
const { body  } = require('express-validator')
const { getCards, addCard, deleteCard, getNetworkCards } = require('../controllers/cardsController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.get('/network', getNetworkCards)                           // public

router.use(protect)                                               // auth required below

router.get('/',    getCards)
router.delete('/:id', deleteCard)

router.post('/',
  [
    body('holderName').trim().notEmpty().withMessage('Cardholder name is required'),
    body('cardNumber').custom(v => {
      const digits = v.replace(/\s/g,'')
      if (digits.length !== 16 || !/^\d+$/.test(digits)) throw new Error('Enter a valid 16-digit card number')
      return true
    }),
    body('expiry').matches(/^\d{2}\/\d{2}$/).withMessage('Expiry must be MM/YY'),
    body('cvv').isLength({ min:3, max:4 }).withMessage('CVV must be 3–4 digits'),
    body('network').notEmpty().withMessage('Network is required'),
    body('bankName').trim().notEmpty().withMessage('Bank name is required'),
    body('categories').isArray({ min:1 }).withMessage('Select at least one category'),
  ],
  addCard
)

module.exports = router
