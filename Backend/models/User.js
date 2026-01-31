const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Usage Score & Tiering Logic
    usageScore: { type: Number, default: 0 },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },

    // Users manage their own cards here to compare vs Proxy
    managedCards: [{
        bankName: String, // e.g., "HDFC"
        cardName: String, // e.g., "Millennia"
        rewardRate: { type: Number, default: 2 } // % cashback
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);