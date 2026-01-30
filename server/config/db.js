const mongoose = require('mongoose');

/**
 * Database Configuration
 * Connects to MongoDB using Mongoose
 */

const connectDB = async () => {
    try {
        // MongoDB connection string - use environment variable if available
        const dbUrl = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';
        console.log(`📡 Connecting to: ${dbUrl.includes('mongodb+srv') ? 'Cloud MongoDB' : 'Local MongoDB'}`);
        const conn = await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
