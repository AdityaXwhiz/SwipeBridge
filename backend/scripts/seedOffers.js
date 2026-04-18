/**
 * Seed script — populates the offers collection with sample data.
 *
 * Usage:
 *   node scripts/seedOffers.js
 *
 * It connects to the same Mongo instance defined in .env,
 * drops any existing offers, and inserts fresh sample data.
 */

require('dotenv').config()
const mongoose = require('mongoose')
const Offer = require('../models/Offer')

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

const SAMPLE_OFFERS = [
  // ── Shopping ──
  { merchant: 'Amazon',     category: 'shopping',      discount: '10% off up to ₹1500',   discountValue: 10, type: 'Bank Offer',     bank: 'HDFC',  tag: 'Hot',       link: 'https://www.amazon.in/gp/browse.html?node=3704997031',       expiresAt: daysFromNow(5)  },
  { merchant: 'Flipkart',   category: 'shopping',      discount: '12% instant discount',   discountValue: 12, type: 'Bank Offer',     bank: 'ICICI', tag: 'Flash',     link: 'https://www.flipkart.com/offers-store',                      expiresAt: daysFromNow(2)  },
  { merchant: 'Myntra',     category: 'shopping',      discount: '15% off on ₹2999+',      discountValue: 15, type: 'Merchant Offer', bank: '',      tag: 'Popular',   link: 'https://www.myntra.com/offers',                              expiresAt: daysFromNow(7)  },
  { merchant: 'Ajio',       category: 'shopping',      discount: '₹500 off on ₹2500+',     discountValue: 8,  type: 'Bank Offer',     bank: 'Axis',  tag: '',          link: 'https://www.ajio.com/offers',                                expiresAt: daysFromNow(10) },
  { merchant: 'Amazon',     category: 'shopping',      discount: '5% cashback on RuPay',    discountValue: 5,  type: 'Bank Offer',     bank: 'SBI',   tag: 'Exclusive', link: 'https://www.amazon.in/b?node=15441628031',                   expiresAt: daysFromNow(8)  },
  { merchant: 'Flipkart',   category: 'shopping',      discount: '10% off via Axis cards',  discountValue: 10, type: 'Bank Offer',     bank: 'Axis',  tag: 'Limited Time', link: 'https://www.flipkart.com/offers-store?otracker=hp_bannerads_slot_1', expiresAt: daysFromNow(3)  },
  { merchant: 'Croma',      category: 'shopping',      discount: '₹3000 off on laptops',    discountValue: 12, type: 'Bank Offer',     bank: 'HDFC',  tag: 'Exclusive', link: 'https://www.croma.com/offers-deals',                         expiresAt: daysFromNow(6)  },
  { merchant: 'Nykaa',      category: 'shopping',      discount: '20% off on ₹1500+',       discountValue: 20, type: 'Merchant Offer', bank: '',      tag: 'New',       link: 'https://www.nykaa.com/offers/deal-of-the-day',               expiresAt: daysFromNow(4)  },

  // ── Dining ──
  { merchant: 'Swiggy',     category: 'dining',        discount: '20% off up to ₹120',     discountValue: 20, type: 'Bank Offer',     bank: 'SBI',   tag: 'New',       link: 'https://www.swiggy.com/offers',                              expiresAt: daysFromNow(6)  },
  { merchant: 'Zomato',     category: 'dining',        discount: '₹100 off on ₹399+',      discountValue: 10, type: 'Bank Offer',     bank: 'HDFC',  tag: 'Exclusive', link: 'https://www.zomato.com/bank-offers',                         expiresAt: daysFromNow(8)  },
  { merchant: 'Dominos',    category: 'dining',        discount: 'Buy 1 Get 1 Free',        discountValue: 50, type: 'Merchant Offer', bank: '',      tag: 'Hot',       link: 'https://www.dominos.co.in/menu/deals-and-offers',            expiresAt: daysFromNow(4)  },
  { merchant: 'EatSure',    category: 'dining',        discount: '30% off on first order',  discountValue: 30, type: 'Bank Offer',     bank: 'HDFC',  tag: '',          link: 'https://www.eatsure.com/offers',                             expiresAt: daysFromNow(9)  },
  { merchant: 'Swiggy',     category: 'dining',        discount: 'Flat ₹75 off via ICICI',  discountValue: 8,  type: 'Bank Offer',     bank: 'ICICI', tag: 'Limited Time', link: 'https://www.swiggy.com/offers',                          expiresAt: daysFromNow(3)  },
  { merchant: 'Zomato',     category: 'dining',        discount: '15% off via Axis',        discountValue: 15, type: 'Bank Offer',     bank: 'Axis',  tag: '',          link: 'https://www.zomato.com/bank-offers',                         expiresAt: daysFromNow(5)  },

  // ── Travel ──
  { merchant: 'MakeMyTrip', category: 'travel',        discount: '₹2000 off on flights',   discountValue: 15, type: 'Seasonal Deal',  bank: 'ICICI', tag: 'Limited Time', link: 'https://www.makemytrip.com/offers/bankoffers.html',      expiresAt: daysFromNow(3)  },
  { merchant: 'Yatra',      category: 'travel',        discount: '₹1500 off on hotels',     discountValue: 12, type: 'Bank Offer',     bank: 'Axis',  tag: '',          link: 'https://www.yatra.com/offers',                               expiresAt: daysFromNow(5)  },
  { merchant: 'IRCTC',      category: 'travel',        discount: '5% cashback on trains',   discountValue: 5,  type: 'Cashback',       bank: 'SBI',   tag: '',          link: 'https://www.irctc.co.in/nget/train-search',                  expiresAt: daysFromNow(14) },
  { merchant: 'Cleartrip',  category: 'travel',        discount: '₹1000 off via HDFC',      discountValue: 10, type: 'Bank Offer',     bank: 'HDFC',  tag: 'Exclusive', link: 'https://www.cleartrip.com/offers/domestic',                  expiresAt: daysFromNow(7)  },
  { merchant: 'Goibibo',    category: 'travel',        discount: 'Flat 12% off on buses',   discountValue: 12, type: 'Merchant Offer', bank: '',      tag: 'Popular',   link: 'https://www.goibibo.com/offers/',                            expiresAt: daysFromNow(10) },

  // ── Fuel ──
  { merchant: 'IndianOil',  category: 'fuel',          discount: '₹50 cashback per txn',    discountValue: 5,  type: 'Bank Offer',     bank: 'HDFC',  tag: '',          link: 'https://iocl.com/loyaltyprogram',                            expiresAt: daysFromNow(12) },
  { merchant: 'BPCL',       category: 'fuel',          discount: '₹75 cashback on ₹2000+',  discountValue: 7,  type: 'Bank Offer',     bank: 'ICICI', tag: 'New',       link: 'https://www.bharatpetroleum.in/other-services/SmartDrive.aspx', expiresAt: daysFromNow(10) },
  { merchant: 'HP',         category: 'fuel',          discount: '1% fuel surcharge waiver', discountValue: 3,  type: 'Bank Offer',     bank: 'Axis',  tag: '',          link: 'https://www.hindustanpetroleum.com/HP-Pay', expiresAt: daysFromNow(30) },

  // ── Entertainment ──
  { merchant: 'BookMyShow', category: 'entertainment', discount: 'Buy 1 Get 1 on movies',   discountValue: 50, type: 'Merchant Offer', bank: 'Kotak', tag: 'Popular',   link: 'https://in.bookmyshow.com/offers',                           expiresAt: daysFromNow(5)  },
  { merchant: 'PVR',        category: 'entertainment', discount: '25% off on F&B',          discountValue: 25, type: 'Bank Offer',     bank: 'HDFC',  tag: '',          link: 'https://www.pvrcinemas.com/offers',                          expiresAt: daysFromNow(7)  },
  { merchant: 'Netflix',    category: 'entertainment', discount: '₹200 cashback on annual', discountValue: 8,  type: 'Cashback',       bank: 'ICICI', tag: 'Exclusive', link: 'https://www.netflix.com/in/signup/planform',                 expiresAt: daysFromNow(15) },
  { merchant: 'Spotify',    category: 'entertainment', discount: '3 months free premium',   discountValue: 30, type: 'Merchant Offer', bank: '',      tag: 'Limited Time', link: 'https://www.spotify.com/in-en/premium/',                expiresAt: daysFromNow(5)  },

  // ── Groceries ──
  { merchant: 'BigBasket',  category: 'groceries',     discount: '15% off on ₹1500+',       discountValue: 15, type: 'Bank Offer',     bank: 'Axis',  tag: '',          link: 'https://www.bigbasket.com/offers/',                          expiresAt: daysFromNow(9)  },
  { merchant: 'Blinkit',    category: 'groceries',     discount: '₹100 off on first order', discountValue: 10, type: 'Merchant Offer', bank: '',      tag: 'New',       link: 'https://blinkit.com/',                                       expiresAt: daysFromNow(4)  },
  { merchant: 'JioMart',    category: 'groceries',     discount: '10% off via SBI cards',   discountValue: 10, type: 'Bank Offer',     bank: 'SBI',   tag: '',          link: 'https://www.jiomart.com/all-offers',                         expiresAt: daysFromNow(6)  },
  { merchant: 'Zepto',      category: 'groceries',     discount: 'Flat ₹75 off on ₹599+',   discountValue: 8,  type: 'Merchant Offer', bank: '',      tag: 'Hot',       link: 'https://www.zeptonow.com/',                                  expiresAt: daysFromNow(3)  },

  // ── Utilities ──
  { merchant: 'Paytm',      category: 'utilities',     discount: '₹50 cashback on recharge', discountValue: 3, type: 'Cashback',       bank: '',      tag: '',          link: 'https://paytm.com/recharge',                                 expiresAt: daysFromNow(20) },
  { merchant: 'PhonePe',    category: 'utilities',     discount: '₹30 cashback on bills',   discountValue: 2,  type: 'Cashback',       bank: 'HDFC',  tag: '',          link: 'https://www.phonepe.com/bill-payments/',                     expiresAt: daysFromNow(14) },

  // ── Health ──
  { merchant: 'PharmEasy',  category: 'health',        discount: '20% off on medicines',    discountValue: 20, type: 'Merchant Offer', bank: '',      tag: '',          link: 'https://pharmeasy.in/offers',                                expiresAt: daysFromNow(8)  },
  { merchant: '1mg',        category: 'health',        discount: '₹200 off on ₹1000+',     discountValue: 12, type: 'Bank Offer',     bank: 'ICICI', tag: '',          link: 'https://www.1mg.com/offers',                                 expiresAt: daysFromNow(10) },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ Connected to MongoDB')

    await Offer.deleteMany({})
    console.log('🗑️  Cleared existing offers')

    const inserted = await Offer.insertMany(SAMPLE_OFFERS)
    console.log(`🌱 Seeded ${inserted.length} offers`)

    await mongoose.disconnect()
    console.log('✅ Done — disconnected')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
