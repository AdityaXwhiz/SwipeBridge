const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Connect Database
connectDB();

// 2. Essential Middleware (MUST come before routes)
app.use(express.json()); // Parses incoming JSON requests
app.use(cors());         // Enables Cross-Origin Resource Sharing

// 3. Define Routes (MUST come after middleware)
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => res.send('Card Proxy API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));