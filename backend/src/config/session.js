const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);//NPM package that stores Express sessions in MySQL instead of memory.
const mysql = require('mysql2/promise');
require('dotenv').config();

const sessionStore = new MySQLStore({ //sessionStore → Reads .env → Connects to MySQL.

    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000 // 24 hours
});

const sessionConfig = {  //sessionConfig → Uses sessionStore → Configures sessions.
    key: 'airbnb_session',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
};

module.exports = sessionConfig;

