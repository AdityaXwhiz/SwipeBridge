const Card        = require('../models/Card')
const Offer       = require('../models/Offer')
const Transaction = require('../models/Transaction')

/* ══════════════════════════════════════════════════════════
   UTILITY HELPERS — humanize numbers, vary phrasing
   ══════════════════════════════════════════════════════════ */

/** Turn ₹329 → "₹300–₹350" (approximate range) */
function approxRange(value) {
  if (!value || value <= 0) return '₹0'
  const base = Math.floor(value / 50) * 50
  const top  = base + 50
  if (value < 100) return `around ₹${Math.round(value)}`
  return `₹${base.toLocaleString('en-IN')}–₹${top.toLocaleString('en-IN')}`
}

/** Pick random element from array */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

/** Days until a date */
function daysUntil(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
}

/** Friendly card display name */
function cardDisplayName(card) {
  return card.cardNickname
    ? `${card.bankName} (${card.cardNickname})`
    : card.bankName
}

/** Normalize bank name for fuzzy matching */
function normBank(name) {
  return (name || '').split(' ')[0].toLowerCase()
}

/** Check if an offer matches any user card bank */
function matchesUserBank(offerBank, userBankTokens) {
  const ob = (offerBank || '').toLowerCase()
  return userBankTokens.some(b => ob.includes(b) || b.includes(ob))
}

/* ══════════════════════════════════════════════════════════
   RESPONSE VARIATION TEMPLATES
   ══════════════════════════════════════════════════════════ */
const BEST_CARD_OPENERS = [
  (name) => `Your best bet here is your **${name}** card.`,
  (name) => `I'd go with your **${name}** card for this one.`,
  (name) => `Based on your wallet, **${name}** is the strongest option.`,
  (name) => `Looking at your cards, **${name}** stands out.`,
  (name) => `Your **${name}** card is well-positioned for this.`,
]

const REASONING_PHRASES = [
  (count, cat) => `It has ${count} active ${cat ? cat + ' ' : ''}offer${count > 1 ? 's' : ''} right now`,
  (count, cat) => `There ${count > 1 ? 'are' : 'is'} ${count} matching ${cat ? cat + ' ' : ''}offer${count > 1 ? 's' : ''} for this card`,
  (count, cat) => `I found ${count} relevant ${cat ? cat + ' ' : ''}offer${count > 1 ? 's' : ''} tied to this card`,
]

const SAVINGS_PHRASES = [
  (range) => `which could save you roughly ${range} per transaction`,
  (range) => `with estimated savings around ${range}`,
  (range) => `— that's approximately ${range} in potential savings`,
]

const NO_CARD_PROMPTS = [
  "You haven't added any cards yet — add your credit/debit cards and I'll start finding the best deals for you.",
  "I don't see any cards in your wallet yet. Head to **Add Card** so I can give you real recommendations.",
  "No cards on file yet! Once you add your cards, I can compare offers and find the best one for every purchase.",
]

/* ══════════════════════════════════════════════════════════
   INTENT DETECTION
   ══════════════════════════════════════════════════════════ */
const INTENT_PATTERNS = [
  { intent: 'best_card_shopping',  keywords: ['best card', 'shopping', 'shop', 'buy', 'purchase', 'ecommerce'] },
  { intent: 'best_card_fuel',      keywords: ['fuel', 'petrol', 'diesel', 'gas station', 'gas'] },
  { intent: 'best_card_travel',    keywords: ['travel', 'flight', 'hotel', 'booking', 'trip', 'holiday'] },
  { intent: 'best_card_dining',    keywords: ['dining', 'restaurant', 'food', 'eat', 'zomato', 'swiggy'] },
  { intent: 'best_card_groceries', keywords: ['grocery', 'groceries', 'supermarket', 'bigbasket', 'blinkit'] },
  { intent: 'best_card_merchant',  keywords: ['amazon', 'flipkart', 'myntra', 'croma', 'nykaa', 'ajio'] },
  { intent: 'save_more',           keywords: ['save', 'saving', 'savings', 'reduce', 'cut cost', 'spend less'] },
  { intent: 'best_offers',         keywords: ['offer', 'offers', 'deal', 'deals', 'discount', 'cashback', 'coupon'] },
  { intent: 'new_card',            keywords: ['new card', 'recommend card', 'should i get', 'apply card', 'which card'] },
  { intent: 'spending_analysis',   keywords: ['spending', 'spent', 'analysis', 'analytics', 'breakdown', 'history'] },
  { intent: 'card_info',           keywords: ['my cards', 'card info', 'card details', 'how many cards'] },
]

function detectIntent(question) {
  const q = question.toLowerCase()
  for (const pattern of INTENT_PATTERNS) {
    if (pattern.keywords.some(k => q.includes(k))) return pattern.intent
  }
  return 'general'
}

function extractMerchant(question) {
  const merchants = ['amazon', 'flipkart', 'myntra', 'croma', 'nykaa', 'ajio', 'swiggy', 'zomato', 'bigbasket', 'blinkit', 'zepto', 'uber', 'ola', 'makemytrip', 'goibibo', 'paytm', 'phonepe']
  const q = question.toLowerCase()
  return merchants.find(m => q.includes(m)) || null
}

function extractCategory(question) {
  const categories = ['shopping', 'dining', 'travel', 'fuel', 'entertainment', 'groceries', 'utilities', 'health', 'education', 'insurance']
  const q = question.toLowerCase()
  return categories.find(c => q.includes(c)) || null
}

/* ══════════════════════════════════════════════════════════
   SHARED DATA LOADER
   ──────────────────────────────────────────────────────────
   Avoids redundant DB calls across handlers.
   ══════════════════════════════════════════════════════════ */
async function loadUserContext(userId) {
  const [cards, offers, transactions] = await Promise.all([
    Card.find({ owner: userId, isActive: true }).lean(),
    Offer.find({ isActive: true, expiresAt: { $gt: new Date() } }).sort('-discountValue').lean(),
    Transaction.find({ user: userId, status: 'completed' }).sort('-createdAt').limit(40).lean(),
  ])

  const bankTokens = [...new Set(cards.map(c => normBank(c.bankName)).filter(Boolean))]
  const userCategories = [...new Set(cards.flatMap(c => (c.categories || []).map(cc => cc.toLowerCase())))]

  /* Split offers into card-matched vs unmatched */
  const matchedOffers = []
  const unmatchedOffers = []
  offers.forEach(o => {
    if (matchesUserBank(o.bank, bankTokens)) matchedOffers.push(o)
    else unmatchedOffers.push(o)
  })

  /* Card usage from transactions */
  const cardUsage = {}
  transactions.forEach(t => {
    if (!cardUsage[t.proxyCard]) cardUsage[t.proxyCard] = { count: 0, spent: 0, saved: 0 }
    cardUsage[t.proxyCard].count++
    cardUsage[t.proxyCard].spent += t.amountPaid || 0
    cardUsage[t.proxyCard].saved += t.amountSaved || 0
  })

  /* Avg transaction value */
  const avgTxn = transactions.length > 0
    ? transactions.reduce((s, t) => s + (t.amountPaid || 0), 0) / transactions.length
    : 0

  return { cards, offers, transactions, bankTokens, userCategories, matchedOffers, unmatchedOffers, cardUsage, avgTxn }
}

/* ══════════════════════════════════════════════════════════
   RESPONSE GENERATORS
   ══════════════════════════════════════════════════════════ */

async function handleBestCardForCategory(userId, category, question) {
  const ctx = await loadUserContext(userId)
  if (!ctx.cards.length) return { answer: pick(NO_CARD_PROMPTS), actionType: 'add_card' }

  /* Filter offers by category */
  const catOffers = ctx.matchedOffers.filter(o =>
    !category || (o.category || '').toLowerCase() === category.toLowerCase()
  )

  if (!catOffers.length && !ctx.offers.filter(o => !category || (o.category || '').toLowerCase() === category.toLowerCase()).length) {
    return {
      answer: `No active ${category || ''} offers in the system right now. These tend to rotate — check back in a day or two.`,
      actionType: 'no_offers',
    }
  }

  if (catOffers.length > 0) {
    /* Group by card and rank */
    const cardScores = {}
    ctx.cards.forEach(c => {
      const bt = normBank(c.bankName)
      const matching = catOffers.filter(o => matchesUserBank(o.bank, [bt]))
      if (matching.length) {
        const avgDiscount = matching.reduce((s, o) => s + (o.discountValue || 0), 0) / matching.length
        cardScores[cardDisplayName(c)] = { card: c, offers: matching, avgDiscount, count: matching.length }
      }
    })

    const ranked = Object.entries(cardScores).sort((a, b) => {
      /* Primary: offer count, secondary: avg discount */
      const diff = b[1].count - a[1].count
      return diff !== 0 ? diff : b[1].avgDiscount - a[1].avgDiscount
    })

    if (ranked.length > 0) {
      const [bestName, bestData] = ranked[0]
      const best = bestData.offers[0]
      const savingsEst = ctx.avgTxn > 0 ? Math.round(ctx.avgTxn * (bestData.avgDiscount / 100)) : null

      let answer = pick(BEST_CARD_OPENERS)(bestName)
      answer += ' ' + pick(REASONING_PHRASES)(bestData.count, category)
      if (savingsEst && savingsEst > 0) {
        answer += ', ' + pick(SAVINGS_PHRASES)(approxRange(savingsEst))
      }
      answer += '.'

      /* Add top offer detail */
      answer += `\n\nTop offer: **${best.discount}** on ${best.merchant}`
      const dl = daysUntil(best.expiresAt)
      if (dl <= 3) answer += ` ⚡ (expires in ${dl} day${dl > 1 ? 's' : ''}!)`

      /* Missed savings hint if they used a different card recently for this category */
      if (ranked.length > 1) {
        const others = ranked.slice(1).map(r => r[0]).join(', ')
        answer += `\n\nFor reference, ${others} also ${ranked.length === 2 ? 'has' : 'have'} offers in ${category || 'this area'}, but fewer.`
      }

      return {
        answer,
        offer: { merchant: best.merchant, discount: best.discount, card: bestName, type: best.type, expiresAt: best.expiresAt },
        actionType: 'best_card',
      }
    }
  }

  /* No card-matched offers — suggest best general + recommend new card */
  const generalOffers = ctx.offers.filter(o => !category || (o.category || '').toLowerCase() === category.toLowerCase())
  if (generalOffers.length > 0) {
    const best = generalOffers[0]
    let answer = `For ${category || 'this category'}, the strongest offer right now is **${best.discount}** on ${best.merchant} via ${best.bank || 'select cards'}.`
    answer += `\n\nNone of your current cards qualify for this one though. If ${category} is a regular spend area for you, it might be worth looking into a card from **${best.bank}**.`
    return { answer, actionType: 'general_offer' }
  }

  return { answer: `Nothing active for ${category} right now — these offers rotate frequently, so check back soon.`, actionType: 'no_offers' }
}

async function handleBestCardForMerchant(userId, merchant) {
  const ctx = await loadUserContext(userId)
  if (!ctx.cards.length) return { answer: pick(NO_CARD_PROMPTS), actionType: 'add_card' }

  const merchantOffers = ctx.offers.filter(o => (o.merchant || '').toLowerCase().includes(merchant.toLowerCase()))

  if (!merchantOffers.length) {
    return {
      answer: `No active offers for ${merchant.charAt(0).toUpperCase() + merchant.slice(1)} right now. This merchant's offers tend to come and go — I'll surface them when they're live.`,
      actionType: 'no_offers',
    }
  }

  const matched = merchantOffers.filter(o => matchesUserBank(o.bank, ctx.bankTokens))
  const merchantCap = merchant.charAt(0).toUpperCase() + merchant.slice(1)

  if (matched.length > 0) {
    const best = matched[0]
    const matchingCard = ctx.cards.find(c => matchesUserBank(best.bank, [normBank(c.bankName)]))
    const cardName = matchingCard ? cardDisplayName(matchingCard) : best.bank
    const savingsEst = ctx.avgTxn > 0 ? Math.round(ctx.avgTxn * ((best.discountValue || 0) / 100)) : null

    let answer = pick(BEST_CARD_OPENERS)(cardName)
    answer += ` For ${merchantCap}, it gives you **${best.discount}**`
    if (savingsEst) answer += ` — that's roughly ${approxRange(savingsEst)} back on a typical purchase`
    answer += '.'

    const dl = daysUntil(best.expiresAt)
    if (dl <= 5) answer += ` Heads up — this expires in about ${dl} day${dl > 1 ? 's' : ''}.`

    /* If other cards also have offers */
    const otherMatched = matched.filter(o => o !== best)
    if (otherMatched.length > 0) {
      const altCard = ctx.cards.find(c => matchesUserBank(otherMatched[0].bank, [normBank(c.bankName)]))
      if (altCard && altCard !== matchingCard) {
        answer += `\n\nAlternately, your ${cardDisplayName(altCard)} also has ${otherMatched[0].discount} on ${merchantCap}.`
      }
    }

    return {
      answer,
      offer: { merchant: best.merchant, discount: best.discount, card: cardName, type: best.type, expiresAt: best.expiresAt },
      actionType: 'best_card',
    }
  }

  /* No match — show best available and suggest */
  const best = merchantOffers[0]
  let answer = `The best current offer on ${merchantCap} is **${best.discount}** via ${best.bank || 'select cards'}.`
  answer += `\n\nUnfortunately none of your cards qualify. If you shop here often, a **${best.bank}** card could be worth considering — it'd open up ${merchantOffers.length} active offer${merchantOffers.length > 1 ? 's' : ''}.`
  return { answer, actionType: 'general_offer' }
}

async function handleSaveMore(userId) {
  const ctx = await loadUserContext(userId)
  const tips = []

  if (!ctx.cards.length) {
    tips.push(pick(NO_CARD_PROMPTS))
    return { answer: tips.join('\n\n'), actionType: 'add_card' }
  }

  /* Transaction-based insights */
  if (ctx.transactions.length > 0) {
    const totalSpent = ctx.transactions.reduce((s, t) => s + (t.amountPaid || 0), 0)
    const totalSaved = ctx.transactions.reduce((s, t) => s + (t.amountSaved || 0), 0)
    const txCount = ctx.transactions.length

    tips.push(`📊 Looking at your last ${txCount > 15 ? '15–20' : txCount > 5 ? '5–10' : 'few'} transactions — you've spent around ${approxRange(totalSpent)} total and saved approximately ${approxRange(totalSaved)}.`)

    /* Find most used card and check if it's optimal */
    const topUsage = Object.entries(ctx.cardUsage).sort((a, b) => b[1].count - a[1].count)
    if (topUsage.length > 0) {
      const [topCard, topData] = topUsage[0]
      const topCardOffers = ctx.matchedOffers.filter(o => {
        const bt = normBank(topCard)
        return matchesUserBank(o.bank, [bt])
      }).length

      if (topUsage.length > 1) {
        const [secondCard, secondData] = topUsage[1]
        const secondOffers = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [normBank(secondCard)])).length

        if (secondOffers > topCardOffers && secondData.count < topData.count) {
          tips.push(`💡 You use **${topCard}** the most (${topData.count} transactions), but **${secondCard}** actually has more active offers (${secondOffers} vs ${topCardOffers}). Switching for some purchases could boost your savings.`)
        } else {
          tips.push(`💳 **${topCard}** is your go-to card (${topData.count} recent transactions${topCardOffers > 0 ? `, ${topCardOffers} active offers` : ''}). ${topCardOffers > 0 ? 'Good choice — it\'s well-covered.' : 'Though it doesn\'t have many active offers right now.'}`)
        }
      }
    }

    /* Missed savings estimate */
    if (ctx.matchedOffers.length > 0) {
      const bestAvgDiscount = Math.max(...ctx.matchedOffers.map(o => o.discountValue || 0))
      const potentialExtra = Math.round(totalSpent * (bestAvgDiscount / 100) - totalSaved)
      if (potentialExtra > 50) {
        tips.push(`🔍 Rough estimate — you could have saved an additional ${approxRange(potentialExtra)} by consistently using your best-matched card. Not a huge miss, but it adds up.`)
      }
    }
  } else {
    tips.push("📊 No transaction history yet. Once you start making purchases through SwipeBridge, I'll be able to spot saving patterns and give you specific tips.")
  }

  /* Offer-based tips */
  if (ctx.matchedOffers.length > 0) {
    const expiringSoon = ctx.matchedOffers.filter(o => daysUntil(o.expiresAt) <= 3)
    if (expiringSoon.length > 0) {
      tips.push(`⚡ **${expiringSoon.length} offer${expiringSoon.length > 1 ? 's' : ''} expiring soon** that match your cards — worth checking before they're gone.`)
    } else {
      tips.push(`🎯 You have **${ctx.matchedOffers.length} active offer${ctx.matchedOffers.length > 1 ? 's' : ''}** matching your cards right now. The top one is ${ctx.matchedOffers[0].discount} on ${ctx.matchedOffers[0].merchant}.`)
    }
  }

  /* Unused cards with offers */
  const usedCardNames = new Set(Object.keys(ctx.cardUsage).map(normBank))
  const unusedWithOffers = ctx.cards.filter(c => {
    const bn = normBank(c.bankName)
    return !usedCardNames.has(bn) && ctx.matchedOffers.some(o => matchesUserBank(o.bank, [bn]))
  })

  if (unusedWithOffers.length > 0) {
    const c = unusedWithOffers[0]
    const offerCount = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [normBank(c.bankName)])).length
    tips.push(`🃏 Your **${cardDisplayName(c)}** card has ${offerCount} active offer${offerCount > 1 ? 's' : ''} but you haven't used it recently. Might be worth trying for your next purchase.`)
  }

  return { answer: tips.join('\n\n'), actionType: 'savings_tips' }
}

async function handleBestOffers(userId) {
  const ctx = await loadUserContext(userId)

  if (!ctx.offers.length) {
    return { answer: "No active offers in the system right now. These get refreshed regularly — try again later.", actionType: 'no_offers' }
  }

  /* Prioritize: card-matched first, then expiring soon, then highest discount */
  const prioritized = [
    ...ctx.matchedOffers.sort((a, b) => {
      const dlA = daysUntil(a.expiresAt), dlB = daysUntil(b.expiresAt)
      if (dlA <= 3 && dlB > 3) return -1
      if (dlB <= 3 && dlA > 3) return 1
      return (b.discountValue || 0) - (a.discountValue || 0)
    }),
  ]

  let answer = ''
  const seenMerchants = new Set()

  if (prioritized.length > 0) {
    answer += `🎯 **Offers for your cards** (${prioritized.length} found)\n\n`
    let shown = 0
    for (const o of prioritized) {
      if (seenMerchants.has(o.merchant)) continue
      seenMerchants.add(o.merchant)
      const dl = daysUntil(o.expiresAt)
      const tag = dl <= 3 ? ' ⚡ Expiring soon' : dl <= 7 ? '' : ''
      answer += `${shown + 1}. **${o.merchant}** — ${o.discount} (${o.bank})${tag}${o.tag ? ` · ${o.tag}` : ''}\n`
      shown++
      if (shown >= 5) break
    }
  } else {
    answer += `None of your current cards match active offers right now.\n`
  }

  /* Show a couple of top general offers the user is missing */
  const topUnmatched = ctx.unmatchedOffers.filter(o => !seenMerchants.has(o.merchant)).slice(0, 3)
  if (topUnmatched.length > 0) {
    answer += `\n\n🌟 **Offers you're missing** (no matching card)\n\n`
    topUnmatched.forEach((o, i) => {
      answer += `${i + 1}. **${o.merchant}** — ${o.discount} via ${o.bank}${o.tag ? ` · ${o.tag}` : ''}\n`
    })
    if (ctx.cards.length > 0) {
      answer += `\n_Consider a card from ${topUnmatched[0].bank} to unlock these._`
    }
  }

  return { answer: answer.trim(), actionType: 'offers_list' }
}

async function handleNewCard(userId) {
  const ctx = await loadUserContext(userId)

  if (!ctx.cards.length) {
    return {
      answer: "You haven't added any cards yet. Start by adding your existing cards — once I see what you have, I can tell you exactly what's missing from your wallet.",
      actionType: 'add_card',
    }
  }

  /* Analyze spending categories */
  const categorySpend = {}
  ctx.transactions.forEach(t => {
    const name = (t.productName || '').toLowerCase()
    let cat = 'general'
    if (name.match(/amazon|flipkart|shop|myntra|buy/)) cat = 'shopping'
    else if (name.match(/fuel|petrol|diesel|hp |indian oil|bharat/)) cat = 'fuel'
    else if (name.match(/food|swiggy|zomato|dine|restaurant/)) cat = 'dining'
    else if (name.match(/flight|hotel|travel|trip|ola|uber/)) cat = 'travel'
    else if (name.match(/grocer|bigbasket|blinkit|zepto/)) cat = 'groceries'
    categorySpend[cat] = (categorySpend[cat] || 0) + (t.amountPaid || 0)
  })

  const sortedCategories = Object.entries(categorySpend).filter(e => e[0] !== 'general').sort((a, b) => b[1] - a[1])

  /* Check coverage gaps */
  const coveredCategories = new Set(ctx.userCategories)
  const uncoveredSpend = sortedCategories.filter(([cat]) => !coveredCategories.has(cat))

  /* Find banks with most unmatched offers */
  const missingBankOffers = {}
  ctx.unmatchedOffers.forEach(o => {
    const bank = o.bank || 'Unknown'
    missingBankOffers[bank] = (missingBankOffers[bank] || 0) + 1
  })
  const topMissingBank = Object.entries(missingBankOffers).sort((a, b) => b[1] - a[1])[0]

  let answer = `You currently have **${ctx.cards.length} card${ctx.cards.length > 1 ? 's' : ''}**: ${ctx.cards.map(c => cardDisplayName(c)).join(', ')}.\n\n`

  if (uncoveredSpend.length > 0 && ctx.transactions.length > 5) {
    const [topCat, topAmt] = uncoveredSpend[0]
    answer += `📈 Based on your recent transactions, **${topCat}** is a significant spending area (around ${approxRange(topAmt)}), but none of your cards have specific ${topCat} rewards. A card with strong ${topCat} cashback could make a real difference here.\n\n`
  }

  if (topMissingBank && topMissingBank[1] >= 2) {
    answer += `💡 A **${topMissingBank[0]}** card would unlock **${topMissingBank[1]} active offers** you're currently not eligible for.\n\n`
  }

  if (uncoveredSpend.length === 0 && (!topMissingBank || topMissingBank[1] < 2)) {
    answer += `Honestly, your wallet looks pretty solid for now. You've got good coverage across your spending categories. I'd only suggest a new card if you start shopping more in a category that's not covered, or if a bank runs a particularly strong sign-up bonus.\n\n`
  }

  answer += `🎯 **Bottom line:** ${uncoveredSpend.length > 0 || (topMissingBank && topMissingBank[1] >= 3) ? 'There\'s room to optimize — adding the right card could meaningfully increase your savings.' : 'No urgent need for a new card. Focus on maximizing the ones you have.'}`

  return { answer, actionType: 'new_card_recommendation' }
}

async function handleSpendingAnalysis(userId) {
  const ctx = await loadUserContext(userId)

  if (!ctx.transactions.length) {
    return {
      answer: "No transaction history yet. Once you start using SwipeBridge for purchases, I'll break down your spending patterns and highlight where you can optimize.",
      actionType: 'no_data',
    }
  }

  const totalSpent = ctx.transactions.reduce((s, t) => s + (t.amountPaid || 0), 0)
  const totalSaved = ctx.transactions.reduce((s, t) => s + (t.amountSaved || 0), 0)
  const txCount = ctx.transactions.length

  let answer = `📊 **Your recent activity** (last ${txCount > 20 ? '20–30' : txCount > 10 ? '10–15' : txCount} transactions)\n\n`
  answer += `💰 Total spent: around ${approxRange(totalSpent)}\n`
  answer += `💎 Total saved: approximately ${approxRange(totalSaved)}\n`
  answer += `📌 Avg per transaction: ~₹${Math.round(ctx.avgTxn).toLocaleString('en-IN')}\n\n`

  answer += `🏦 **By card:**\n`
  const sortedUsage = Object.entries(ctx.cardUsage).sort((a, b) => b[1].spent - a[1].spent)
  sortedUsage.forEach(([card, data]) => {
    const relativeUse = Math.round((data.count / txCount) * 100)
    const matchOffers = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [normBank(card)])).length
    answer += `• **${card}**: ${data.count} txns (${relativeUse}% of usage), saved around ${approxRange(data.saved)}`
    if (matchOffers > 0) answer += ` · ${matchOffers} active offer${matchOffers > 1 ? 's' : ''}`
    answer += '\n'
  })

  /* Flag if a lower-used card has more offers */
  if (sortedUsage.length >= 2) {
    const [topName] = sortedUsage[0]
    const topOffers = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [normBank(topName)])).length
    for (const [altName, altData] of sortedUsage.slice(1)) {
      const altOffers = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [normBank(altName)])).length
      if (altOffers > topOffers && altData.count < sortedUsage[0][1].count) {
        answer += `\n💡 **Quick optimization:** Your ${altName} has ${altOffers} active offers vs ${topOffers} for ${topName}, but you use it less. Swapping some usage over could increase savings.`
        break
      }
    }
  }

  return { answer, actionType: 'spending_analysis' }
}

async function handleCardInfo(userId) {
  const ctx = await loadUserContext(userId)

  if (!ctx.cards.length) {
    return {
      answer: "No cards in your wallet yet. Head to **Add Card** to get started — I'll need at least one card to give you useful recommendations.",
      actionType: 'add_card',
    }
  }

  let answer = `You have **${ctx.cards.length} active card${ctx.cards.length > 1 ? 's' : ''}**:\n\n`
  ctx.cards.forEach((c, i) => {
    const bn = normBank(c.bankName)
    const usage = ctx.cardUsage[c.bankName] || ctx.cardUsage[c.cardNickname]
    const offerCount = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [bn])).length
    answer += `${i + 1}. **${cardDisplayName(c)}** (••••${c.lastFour}) — ${c.network}, ${c.tier}`
    if (offerCount > 0) answer += ` · ${offerCount} active offer${offerCount > 1 ? 's' : ''}`
    if (usage) answer += ` · ${usage.count} recent txns`
    else answer += ` · not used recently`
    answer += '\n'
  })

  /* Highlight any unused cards with offers */
  const usedBanks = new Set(Object.keys(ctx.cardUsage).map(normBank))
  const dormant = ctx.cards.filter(c => !usedBanks.has(normBank(c.bankName)))
  if (dormant.length > 0) {
    const dormantWithOffers = dormant.filter(c => ctx.matchedOffers.some(o => matchesUserBank(o.bank, [normBank(c.bankName)])))
    if (dormantWithOffers.length > 0) {
      answer += `\n⚠️ **${dormantWithOffers.map(c => cardDisplayName(c)).join(', ')}** ${dormantWithOffers.length > 1 ? 'have' : 'has'} active offers but you haven't used ${dormantWithOffers.length > 1 ? 'them' : 'it'} recently.`
    }
  }

  return { answer, actionType: 'card_info' }
}

async function handleGeneral(userId, question) {
  const ctx = await loadUserContext(userId)

  let answer = `I'm your SwipeBridge financial assistant — I work with your actual cards, offers, and transactions to give you personalized advice.\n\n`
  answer += `Here's what I can help with:\n\n`
  answer += `• **"Best card for [shopping/dining/Amazon/etc]"** — I'll compare your cards\n`
  answer += `• **"How can I save more?"** — tips based on your spending patterns\n`
  answer += `• **"Show best offers"** — offers ranked by your card eligibility\n`
  answer += `• **"Spending analysis"** — breakdown of recent transactions\n`
  answer += `• **"Should I get a new card?"** — gap analysis of your wallet\n`

  if (ctx.cards.length > 0) {
    answer += `\n\nRight now you have ${ctx.cards.length} card${ctx.cards.length > 1 ? 's' : ''}`
    if (ctx.matchedOffers.length > 0) answer += ` with ${ctx.matchedOffers.length} matching offer${ctx.matchedOffers.length > 1 ? 's' : ''}`
    answer += `. What would you like to know?`
  } else {
    answer += `\n\nStart by adding your cards — I'll be much more useful once I know what's in your wallet.`
  }

  return { answer, actionType: 'general_help' }
}

/* ══════════════════════════════════════════════════════════
   SMART INSIGHTS GENERATOR — V2
   ──────────────────────────────────────────────────────────
   Returns structured, tagged insights with explanations.
   Limited to 3–4 most relevant items.
   ══════════════════════════════════════════════════════════ */
async function generateInsights(userId) {
  const ctx = await loadUserContext(userId)

  const insights = {
    bestCard: null,
    potentialSavings: null,
    topOffers: [],
    recommendations: [],
    meta: { txnCount: ctx.transactions.length, cardCount: ctx.cards.length, offerCount: ctx.matchedOffers.length },
  }

  if (!ctx.cards.length) {
    insights.recommendations.push({ text: 'Add your credit cards to unlock personalized insights', tag: null })
    return insights
  }

  /* ── Best card today (by offer relevance + recency) ── */
  const cardScores = {}
  ctx.cards.forEach(c => {
    const bn = normBank(c.bankName)
    const matching = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [bn]))
    const expiringSoon = matching.filter(o => daysUntil(o.expiresAt) <= 3).length
    /* Score: offers + bonus for expiring offers */
    const score = matching.length + (expiringSoon * 2)
    if (score > 0) {
      cardScores[c.bankName] = {
        name: cardDisplayName(c),
        score,
        offerCount: matching.length,
        expiringSoon,
        topDiscount: matching.length > 0 ? matching[0].discountValue || 0 : 0,
      }
    }
  })

  const bestCardEntry = Object.entries(cardScores).sort((a, b) => b[1].score - a[1].score)[0]
  if (bestCardEntry) {
    const [, data] = bestCardEntry
    let reason = `${data.offerCount} active offer${data.offerCount > 1 ? 's' : ''} matching`
    if (data.expiringSoon > 0) reason += ` · ${data.expiringSoon} expiring soon`
    insights.bestCard = { name: data.name, reason, explanation: `Based on current offer availability and expiry dates across your cards` }
  }

  /* ── Potential savings (approximate range) ── */
  if (ctx.matchedOffers.length > 0 && ctx.avgTxn > 0) {
    const avgDiscount = ctx.matchedOffers.slice(0, 5).reduce((s, o) => s + (o.discountValue || 0), 0) / Math.min(ctx.matchedOffers.length, 5)
    const rawSaving = Math.round(ctx.avgTxn * (avgDiscount / 100))
    const low  = Math.floor(rawSaving / 50) * 50
    const high = low + 50
    insights.potentialSavings = {
      low: Math.max(low, 0),
      high,
      explanation: ctx.transactions.length > 0
        ? `Based on your avg transaction of ~₹${Math.round(ctx.avgTxn).toLocaleString('en-IN')}`
        : 'Estimated from current offer rates',
    }
  } else if (ctx.matchedOffers.length > 0) {
    insights.potentialSavings = {
      low: 0, high: 0,
      explanation: 'Make some purchases to see projected savings',
    }
  }

  /* ── Top offers (avoid repeating merchants, add tags) ── */
  const seenMerchants = new Set()
  const sortedOffers = [...ctx.matchedOffers].sort((a, b) => {
    const dlA = daysUntil(a.expiresAt), dlB = daysUntil(b.expiresAt)
    if (dlA <= 3 && dlB > 3) return -1
    if (dlB <= 3 && dlA > 3) return 1
    return (b.discountValue || 0) - (a.discountValue || 0)
  })

  for (const o of sortedOffers) {
    if (seenMerchants.has(o.merchant)) continue
    seenMerchants.add(o.merchant)

    const dl = daysUntil(o.expiresAt)
    const usage = ctx.cardUsage[o.bank] || Object.entries(ctx.cardUsage).find(([k]) => normBank(k) === normBank(o.bank))?.[1]
    let tag = ''
    if (dl <= 3)           tag = 'Expiring soon'
    else if (o.tag)        tag = o.tag
    else if (usage && usage.count >= 3) tag = 'High usage'

    insights.topOffers.push({
      merchant: o.merchant,
      discount: o.discount,
      card: o.bank,
      tag,
      category: o.category,
      daysLeft: dl,
    })

    if (insights.topOffers.length >= 4) break
  }

  /* ── Recommendations (max 3–4, with tags & explanations) ── */
  const recs = []

  /* Unused card with offers */
  const usedBanks = new Set(Object.keys(ctx.cardUsage).map(normBank))
  const unusedWithOffers = ctx.cards.filter(c => {
    const bn = normBank(c.bankName)
    return !usedBanks.has(bn) && ctx.matchedOffers.some(o => matchesUserBank(o.bank, [bn]))
  })
  if (unusedWithOffers.length > 0) {
    const c = unusedWithOffers[0]
    const ct = ctx.matchedOffers.filter(o => matchesUserBank(o.bank, [normBank(c.bankName)])).length
    recs.push({
      text: `Your ${cardDisplayName(c)} has ${ct} offer${ct > 1 ? 's' : ''} but hasn't been used recently`,
      tag: 'Unused card',
      explanation: 'Activating this card for matching purchases could boost savings',
    })
  }

  /* Missed savings */
  if (ctx.transactions.length >= 5) {
    const totalSaved = ctx.transactions.reduce((s, t) => s + (t.amountSaved || 0), 0)
    const totalSpent = ctx.transactions.reduce((s, t) => s + (t.amountPaid || 0), 0)
    const maxDiscount = ctx.matchedOffers.length > 0 ? Math.max(...ctx.matchedOffers.map(o => o.discountValue || 0)) : 0
    const idealSaved = Math.round(totalSpent * (maxDiscount / 100))
    const missed = idealSaved - totalSaved
    if (missed > 100) {
      recs.push({
        text: `You could have saved an additional ${approxRange(missed)} with optimal card usage`,
        tag: 'Missed savings',
        explanation: 'Based on comparing your actual savings vs best available offers',
      })
    }
  }

  /* Expiring soon */
  const expiringSoon = ctx.matchedOffers.filter(o => daysUntil(o.expiresAt) <= 3)
  if (expiringSoon.length > 0) {
    recs.push({
      text: `${expiringSoon.length} offer${expiringSoon.length > 1 ? 's' : ''} matching your cards expire in ~3 days`,
      tag: 'Expiring soon',
      explanation: `${expiringSoon.map(o => o.merchant).slice(0, 2).join(', ')}${expiringSoon.length > 2 ? ' and more' : ''}`,
    })
  }

  /* Coverage gap */
  if (ctx.transactions.length > 5) {
    const spendingCats = new Set()
    ctx.transactions.forEach(t => {
      const name = (t.productName || '').toLowerCase()
      if (name.match(/amazon|flipkart|shop/)) spendingCats.add('shopping')
      else if (name.match(/food|swiggy|zomato/)) spendingCats.add('dining')
      else if (name.match(/fuel|petrol/)) spendingCats.add('fuel')
      else if (name.match(/flight|hotel|travel/)) spendingCats.add('travel')
    })
    const uncovered = [...spendingCats].filter(c => !ctx.userCategories.includes(c))
    if (uncovered.length > 0 && recs.length < 4) {
      recs.push({
        text: `You spend in ${uncovered[0]} but no card has specific ${uncovered[0]} rewards`,
        tag: 'Coverage gap',
        explanation: 'A card with category-specific rewards could increase cashback here',
      })
    }
  }

  insights.recommendations = recs.slice(0, 4)

  return insights
}

/* ══════════════════════════════════════════════════════════
   POST /api/assistant/query
   ══════════════════════════════════════════════════════════ */
exports.query = async (req, res) => {
  try {
    const { question } = req.body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question is required.' })
    }

    const userId   = req.user._id
    const intent   = detectIntent(question)
    const merchant = extractMerchant(question)
    const category = extractCategory(question)

    let response

    switch (intent) {
      case 'best_card_shopping':
        response = await handleBestCardForCategory(userId, 'shopping', question); break
      case 'best_card_fuel':
        response = await handleBestCardForCategory(userId, 'fuel', question); break
      case 'best_card_travel':
        response = await handleBestCardForCategory(userId, 'travel', question); break
      case 'best_card_dining':
        response = await handleBestCardForCategory(userId, 'dining', question); break
      case 'best_card_groceries':
        response = await handleBestCardForCategory(userId, 'groceries', question); break
      case 'best_card_merchant':
        response = merchant
          ? await handleBestCardForMerchant(userId, merchant)
          : await handleBestCardForCategory(userId, category || 'shopping', question)
        break
      case 'save_more':
        response = await handleSaveMore(userId); break
      case 'best_offers':
        response = await handleBestOffers(userId); break
      case 'new_card':
        response = await handleNewCard(userId); break
      case 'spending_analysis':
        response = await handleSpendingAnalysis(userId); break
      case 'card_info':
        response = await handleCardInfo(userId); break
      default:
        response = await handleGeneral(userId, question)
    }

    res.json({ success: true, intent, ...response })
  } catch (err) {
    console.error('Assistant query error:', err)
    res.status(500).json({ success: false, message: 'Could not process your question.' })
  }
}

/* ══════════════════════════════════════════════════════════
   GET /api/assistant/insights
   ══════════════════════════════════════════════════════════ */
exports.getInsights = async (req, res) => {
  try {
    const insights = await generateInsights(req.user._id)
    res.json({ success: true, insights })
  } catch (err) {
    console.error('Insights error:', err)
    res.status(500).json({ success: false, message: 'Could not generate insights.' })
  }
}
