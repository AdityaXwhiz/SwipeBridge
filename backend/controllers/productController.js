const axios = require('axios')

exports.searchProducts = async (req, res) => {
    const { query } = req.query

    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required' })
    }

    let rapidApiKey = process.env.RAPIDAPI_KEY
    if (rapidApiKey) rapidApiKey = rapidApiKey.trim()

    console.log(`🔍 Product search requested: "${query}" (Key provided: ${rapidApiKey ? 'YES' : 'NO'})`)

    if (!rapidApiKey || rapidApiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
        // Fallback to mock data if no key is provided, so the UI still works
        console.log('No RapidAPI key provided. Yielding mock response.')
        return res.json({
            success: true,
            data: [
                {
                    id: 'mock-1',
                    name: query.charAt(0).toUpperCase() + query.slice(1) + ' (Mocked - Add API Key)',
                    category: 'Search Result',
                    image: '📦',
                    trending: true,
                    platforms: [
                        { name: 'Amazon', price: 14999, delivery: '1-2 days', rating: 4.5, reviews: 1200 },
                        { name: 'Flipkart', price: 14799, delivery: '3-4 days', rating: 4.3, reviews: 800 },
                        { name: 'Myntra', price: 15100, delivery: '2-3 days', rating: 4.6, reviews: 300 }
                    ]
                }
            ]
        })
    }

    try {
        // 1. Fetch from Amazon via RapidAPI (Real-Time Amazon Data by OpenWeb Ninja)
        const options = {
            method: 'GET',
            url: 'https://real-time-amazon-data.p.rapidapi.com/search',
            params: {
                query: query,
                page: '1',
                country: 'IN',
                sort_by: 'RELEVANCE',
                product_condition: 'NEW'
            },
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
            }
        }

        const response = await axios.request(options)
        const products = response.data.data?.products || []

        // 2. Format the top 3-5 results into our unified schema
        // To simulate cross-platform comparison since Flipkart/Myntra APIs are unreliable on RapidAPI,
        // we will slightly adjust the real Amazon price to create synthetic Flipkart/Croma listings for the UI presentation.
        // In a production app, you would make parallel RapidAPI calls to other scrapers.
        const formatted = products.slice(0, 5).map(prod => {
            const basePrice = parseFloat(prod.product_price?.replace(/[^0-9.]/g, '') || 0)
            const realPrice = basePrice > 0 ? basePrice : 0

            return {
                id: prod.asin,
                name: prod.product_title,
                category: prod.category_path?.[0]?.category_name || 'General',
                image: prod.product_photo, // REAL product image URL
                thumb: prod.product_photo,
                trending: prod.is_best_seller || false,
                platforms: [
                    {
                        name: 'Amazon',
                        price: Math.round(realPrice),
                        delivery: prod.delivery || (prod.is_prime ? '1-2 days (Prime)' : '3-5 days'),
                        rating: parseFloat(prod.product_star_rating || 0),
                        reviews: parseInt(prod.product_num_ratings || 0),
                        url: prod.product_url
                    }
                ]
            }
        })

        res.json({
            success: true,
            data: formatted
        })

    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message
        console.error('RapidAPI Search Error:', errorMsg)

        // If it's a subscription error, return a specific message
        if (err.response?.status === 403 || err.response?.status === 401) {
            return res.status(err.response.status).json({
                success: false,
                message: `RapidAPI error: ${errorMsg}. Please ensure you are subscribed to the "Real-Time Amazon Data" API.`,
                error: errorMsg
            })
        }

        res.status(500).json({ success: false, message: 'Failed to fetch products from RapidAPI', error: errorMsg })
    }
}
