const mongoose = require('mongoose');

const MONGO_USER = process.env.MONGO_USER || 'admin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'airbnb_mongo_2024';
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DATABASE || 'airbnb_db';

// MongoDB Atlas connection string (preferred for production)
// Or fallback to local/Docker MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 
    `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

const connectDB = async () => {
    try {
        // Connect to MongoDB (Atlas or self-hosted)
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        
        const isAtlas = MONGODB_URI.includes('mongodb+srv') || MONGODB_URI.includes('mongodb.net');
        console.log(`✅ MongoDB Connected successfully ${isAtlas ? '(Atlas)' : '(Local)'}`);
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        // Don't exit process, allow app to run with SQLite fallback
        console.log('⚠️  Continuing with SQLite as primary database (MongoDB optional)');
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📴 MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

module.exports = { connectDB, mongoose };

