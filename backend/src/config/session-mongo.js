const session = require('express-session');
const MongoStore = require('connect-mongo');

const MONGO_USER = process.env.MONGO_USER || 'admin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'airbnb_mongo_2024';
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DATABASE || 'airbnb_db';

const MONGODB_URI = process.env.MONGODB_URI || 
    `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

// Create MongoDB session store with error handling
let mongoStore;
try {
    mongoStore = MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60,       // 1 day in seconds
        autoRemove: 'native',    // Auto remove expired sessions
        touchAfter: 24 * 3600,   // Lazy session update (24 hours)
        // Add connection options to handle DNS failures gracefully
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
    });
    
    // Handle store errors without crashing
    mongoStore.on('error', (error) => {
        console.error('❌ MongoDB Session Store Error:', error);
        // Don't throw - allow app to continue
    });
    
    mongoStore.on('connected', () => {
        console.log('✅ MongoDB Session Store Connected');
    });
} catch (error) {
    console.error('❌ Failed to create MongoDB session store:', error);
    console.log('⚠️  Using memory store as fallback');
    mongoStore = undefined; // Will use memory store
}

// MongoDB session store configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'airbnb_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    store: mongoStore, // Will use memory store if mongoStore is undefined
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        httpOnly: true,
        // FORCE INSECURE for this specific deployment to allow HTTP
        secure: false, 
        sameSite: 'lax'
    },
    name: 'airbnb.sid' // Custom session cookie name
};

// Log session store connection (only if MongoDB store is used)
if (mongoStore) {
    mongoStore.on('error', (error) => {
        console.error('❌ MongoDB Session Store Error:', error);
    });

    mongoStore.on('connected', () => {
        console.log('✅ MongoDB Session Store Connected');
    });
} else {
    console.log('⚠️  Using memory session store (MongoDB not available)');
}

module.exports = sessionConfig;

