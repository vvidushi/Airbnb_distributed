const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Determine database path - use /data for Docker, local path for dev
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/data/airbnb.db'
    : path.join(__dirname, '../../data/airbnb.db');

// Ensure data directory exists
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys (important for relational integrity)
db.pragma('foreign_keys = ON');

console.log(`📁 SQLite database initialized at: ${dbPath}`);

// Initialize schema if tables don't exist
const initSchema = () => {
    try {
        // Users table
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('traveler', 'owner')),
                phone TEXT,
                profile_pic TEXT,
                favorite_property_ids TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add favorite_property_ids column to existing tables (migration)
        try {
            db.exec(`ALTER TABLE users ADD COLUMN favorite_property_ids TEXT DEFAULT '[]'`);
        } catch (error) {
            // Column already exists, ignore error
            if (!error.message.includes('duplicate column')) {
                console.log('Migration note:', error.message);
            }
        }

        // Properties table (matching MySQL schema for compatibility)
        db.exec(`
            CREATE TABLE IF NOT EXISTS properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                property_name TEXT NOT NULL,
                property_type TEXT,
                description TEXT,
                location TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT,
                country TEXT NOT NULL,
                price_per_night REAL NOT NULL,
                bedrooms INTEGER,
                bathrooms INTEGER,
                max_guests INTEGER,
                amenities TEXT,
                images TEXT,
                status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending', 'unlisted')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        // Create triggers (removed title triggers as title column does not exist)
        // We only use property_name in the current schema
        
        // CLEANUP: Drop old triggers that reference non-existent 'title' column
        try {
            db.exec(`DROP TRIGGER IF EXISTS set_property_title`);
            db.exec(`DROP TRIGGER IF EXISTS update_property_title`);
            console.log('✅ Cleaned up old triggers');
        } catch (error) {
            console.log('Trigger cleanup note:', error.message);
        }
        
        // Migration: Add missing columns to existing properties table
        try {
            db.exec(`ALTER TABLE properties ADD COLUMN property_name TEXT`);
            // Copy title to property_name if title exists
            try {
                db.exec(`UPDATE properties SET property_name = title WHERE property_name IS NULL`);
            } catch (e) {}
        } catch (error) {
            if (!error.message.includes('duplicate column')) {
                console.log('Migration note (property_name):', error.message);
            }
        }
        
        try {
            db.exec(`ALTER TABLE properties ADD COLUMN property_type TEXT`);
        } catch (error) {
            if (!error.message.includes('duplicate column')) {
                console.log('Migration note (property_type):', error.message);
            }
        }
        
        try {
            db.exec(`ALTER TABLE properties ADD COLUMN location TEXT`);
            // Copy address to location if address exists
            try {
                db.exec(`UPDATE properties SET location = address WHERE location IS NULL`);
            } catch (e) {}
        } catch (error) {
            if (!error.message.includes('duplicate column')) {
                console.log('Migration note (location):', error.message);
            }
        }

        // Bookings table
        db.exec(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                property_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                traveler_id INTEGER,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests INTEGER NOT NULL,
                num_guests INTEGER,
                start_date DATE,
                end_date DATE,
                total_price REAL NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        // Migration: Add traveler_id column and sync with user_id
        try {
            db.exec(`ALTER TABLE bookings ADD COLUMN traveler_id INTEGER`);
            // Copy user_id to traveler_id for existing records
            db.exec(`UPDATE bookings SET traveler_id = user_id WHERE traveler_id IS NULL`);
        } catch (error) {
            if (!error.message.includes('duplicate column')) {
                console.log('Migration note (traveler_id):', error.message);
            }
        }
        
        // Add other missing columns for compatibility
        try {
            db.exec(`ALTER TABLE bookings ADD COLUMN num_guests INTEGER`);
            db.exec(`UPDATE bookings SET num_guests = guests WHERE num_guests IS NULL`);
        } catch (error) {
            if (!error.message.includes('duplicate column')) {}
        }
        
        try {
            db.exec(`ALTER TABLE bookings ADD COLUMN start_date DATE`);
            db.exec(`UPDATE bookings SET start_date = check_in WHERE start_date IS NULL`);
        } catch (error) {
            if (!error.message.includes('duplicate column')) {}
        }
        
        try {
            db.exec(`ALTER TABLE bookings ADD COLUMN end_date DATE`);
            db.exec(`UPDATE bookings SET end_date = check_out WHERE end_date IS NULL`);
        } catch (error) {
            if (!error.message.includes('duplicate column')) {}
        }

        console.log('✅ SQLite schema initialized successfully');
    } catch (error) {
        console.error('❌ Schema initialization error:', error);
    }
};

// Initialize schema on startup
initSchema();

// MySQL-compatible wrapper to minimize controller changes
class MySQLCompatiblePool {
    constructor(sqliteDb) {
        this.db = sqliteDb;
    }

    // Convert MySQL-style query with ? placeholders to SQLite
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            try {
                // Handle INSERT into properties - automatically add address if needed
                if (sql.trim().toUpperCase().includes('INSERT INTO PROPERTIES')) {
                    const hasLocation = sql.includes('location');
                    const hasAddress = sql.includes('address');
                    
                    if (hasLocation && !hasAddress) {
                        // Find column positions
                        const columnMatch = sql.match(/INSERT INTO\s+properties\s*\(([^)]+)\)/i);
                        const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
                        
                        if (columnMatch && valuesMatch) {
                            const columns = columnMatch[1].split(',').map(c => c.trim());
                            const valuePlaceholders = valuesMatch[1].split(',').map(v => v.trim());
                            
                            let paramsModified = false;
                            const newParams = [...params];
                            
                            // Add address = location if needed
                            if (hasLocation && !hasAddress) {
                                // Check if address column actually exists in the table schema first
                                // But since we can't check schema here easily, we'll assume it doesn't exist 
                                // or we'll wrap in try/catch if we could.
                                // Actually, address doesn't exist in our new schema, so we should NOT add it.
                                // This entire block was legacy compatibility.
                                // We will ONLY add state if it's missing as that might be in the schema.
                            }
                            
                            // Add state with empty string if missing (required by old schema)
                            const hasState = sql.includes('state');
                            if (!hasState) {
                                columns.push('state');
                                valuePlaceholders.push('?');
                                newParams.push(''); // Default empty string for state
                                paramsModified = true;
                            }
                            
                            if (paramsModified) {
                                sql = sql.replace(
                                    /INSERT INTO\s+properties\s*\([^)]+\)/i,
                                    `INSERT INTO properties (${columns.join(', ')})`
                                );
                                sql = sql.replace(
                                    /VALUES\s*\([^)]+\)/i,
                                    `VALUES (${valuePlaceholders.join(', ')})`
                                );
                                // Update params array
                                params = newParams;
                            }
                        }
                    }
                }
                
                // Handle INSERT into bookings - automatically set traveler_id = user_id
                if (sql.trim().toUpperCase().includes('INSERT INTO BOOKINGS')) {
                    const hasUserId = sql.includes('user_id');
                    const hasTravelerId = sql.includes('traveler_id');
                    
                    if (hasUserId && !hasTravelerId) {
                        // Simple approach: Add traveler_id column and duplicate user_id value
                        const columnMatch = sql.match(/INSERT INTO\s+bookings\s*\(([^)]+)\)/i);
                        const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
                        
                        if (columnMatch && valuesMatch) {
                            const columns = columnMatch[1].split(',').map(c => c.trim());
                            const values = valuesMatch[1].split(',').map(v => v.trim());
                            const userIdIndex = columns.findIndex(c => c === 'user_id');
                            
                            if (userIdIndex >= 0 && userIdIndex < values.length) {
                                // Add traveler_id to columns and values
                                columns.push('traveler_id');
                                values.push(values[userIdIndex]); // Same value as user_id
                                
                                sql = sql.replace(
                                    /INSERT INTO\s+bookings\s*\([^)]+\)/i,
                                    `INSERT INTO bookings (${columns.join(', ')})`
                                );
                                sql = sql.replace(
                                    /VALUES\s*\([^)]+\)/i,
                                    `VALUES (${values.join(', ')})`
                                );
                            }
                        }
                    }
                }
                
                // Handle SELECT queries
                if (sql.trim().toUpperCase().startsWith('SELECT')) {
                    const rows = this.db.prepare(sql).all(...params);
                    resolve([rows]); // MySQL returns [rows, fields]
                }
                // Handle INSERT/UPDATE/DELETE queries
                else {
                    const result = this.db.prepare(sql).run(...params);
                    resolve([{
                        insertId: result.lastInsertRowid,
                        affectedRows: result.changes,
                        changes: result.changes
                    }]);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // For raw execute statements
    execute(sql, params = []) {
        return this.query(sql, params);
    }

    // Close connection (for graceful shutdown)
    end() {
        this.db.close();
        console.log('📴 SQLite database connection closed');
    }
}

// Create MySQL-compatible pool interface
const pool = new MySQLCompatiblePool(db);

// Test database connection
try {
    const testQuery = db.prepare('SELECT 1 as test').get();
    console.log('✅ SQLite Database connected successfully');
} catch (err) {
    console.error('❌ SQLite Database connection failed:', err.message);
}

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    console.log('SQLite database closed through app termination');
    process.exit(0);
    });

module.exports = pool;
