const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...')
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`)
    console.error(`   Error Code: ${err.code}`)
    console.error(`   Error Name: ${err.name}`)
    // Don't exit here so we can see the logs if it retries or for debugging
    // process.exit(1)
  }
}

module.exports = connectDB
