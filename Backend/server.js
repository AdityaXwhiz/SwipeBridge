const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();



const app = express();

app.use('/api/auth', require('./routes/auth'));
// Connect Database
connectDB();


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Card Proxy API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
