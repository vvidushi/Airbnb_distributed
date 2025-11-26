/**
 * KAFKA PRODUCER SERVICE
 * 
 * This service acts as the "Frontend Service" in the architecture.
 * It receives HTTP requests and publishes events to Kafka topics.
 * 
 * Responsibilities:
 * - Receive booking creation requests from frontend
 * - Publish booking requests to Kafka
 * - Send immediate response to frontend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { publishMessage, TOPICS } = require('./kafkaClient');
const db = require('../config/database');

const app = express();
const PORT = process.env.PRODUCER_PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'airbnb_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false
    }
}));

// Authentication middleware
// NOTE: For lab/demo purposes, also allow a demo user ID via header/query
// so that Kafka flows can be tested easily with curl without full auth.
const isAuthenticated = (req, res, next) => {
    // Normal session-based auth (when used behind the real frontend)
    if (req.session && req.session.userId) {
        return next();
    }

    // Demo override for lab testing: X-Demo-User-Id or ?demoUserId
    const demoUserId = req.headers['x-demo-user-id'] || req.query.demoUserId;
    if (demoUserId) {
        req.session = req.session || {};
        req.session.userId = parseInt(demoUserId, 10);
        return next();
    }

    return res.status(401).json({ message: 'Not authenticated' });
};

/**
 * PRODUCER ENDPOINT: Create Booking Request
 * 
 * Flow:
 * 1. Receive booking request from traveler
 * 2. Create initial booking record in database (status: PENDING)
 * 3. Publish event to Kafka (booking-requests topic)
 * 4. Return response to traveler immediately
 * 5. Consumer service will process the event asynchronously
 */
app.post('/api/bookings', isAuthenticated, async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { property_id, start_date, end_date, guests, total_price } = req.body;
        const traveler_id = req.session.userId;

        // Validate input
        if (!property_id || !start_date || !end_date || !guests) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create booking in database with PENDING status
        // NOTE: DB schema uses num_guests (not guests)
        const [result] = await connection.execute(
            `INSERT INTO bookings 
            (property_id, traveler_id, start_date, end_date, num_guests, total_price, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [property_id, traveler_id, start_date, end_date, guests, total_price]
        );

        const bookingId = result.insertId;

        // Get booking details for Kafka event
        const [bookings] = await connection.execute(
            `SELECT b.*, p.property_name, p.owner_id, u.name as traveler_name, u.email as traveler_email
             FROM bookings b
             JOIN properties p ON b.property_id = p.id
             JOIN users u ON b.traveler_id = u.id
             WHERE b.id = ?`,
            [bookingId]
        );

        const booking = bookings[0];

        // Publish event to Kafka (Asynchronous processing)
        const event = {
            key: bookingId.toString(),
            value: {
                eventType: 'BOOKING_REQUEST_CREATED',
                bookingId: bookingId,
                propertyId: property_id,
                travelerId: traveler_id,
                ownerId: booking.owner_id,
                startDate: start_date,
                endDate: end_date,
                guests: guests,
                totalPrice: total_price,
                status: 'pending',
                travelerName: booking.traveler_name,
                travelerEmail: booking.traveler_email,
                propertyName: booking.property_name,
                timestamp: new Date().toISOString()
            }
        };

        // Publish to Kafka (fire and forget - don't wait)
        publishMessage(TOPICS.BOOKING_REQUESTS, event)
            .then(() => console.log(`📤 Booking request ${bookingId} published to Kafka`))
            .catch(err => console.error(`❌ Failed to publish booking ${bookingId}:`, err));

        // Immediate response to frontend
        res.status(201).json({
            message: 'Booking request created successfully',
            bookingId: bookingId,
            status: 'pending',
            note: 'Your booking request has been submitted and is being processed'
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Failed to create booking' });
    } finally {
        connection.release();
    }
});

/**
 * PRODUCER ENDPOINT: Update Booking Status (Accept/Cancel by Owner)
 * 
 * Flow:
 * 1. Owner accepts/cancels a booking
 * 2. Update booking status in database
 * 3. Publish status update event to Kafka
 * 4. Return response to owner
 * 5. Traveler service will consume the status update
 */
app.put('/api/bookings/:id/status', isAuthenticated, async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const bookingId = req.params.id;
        const { status } = req.body; // 'confirmed' or 'cancelled'
        const ownerId = req.session.userId;

        // Validate status
        if (!['confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Get booking details
        const [bookings] = await connection.execute(
            `SELECT b.*, p.owner_id, p.property_name, u.name as traveler_name, u.email as traveler_email
             FROM bookings b
             JOIN properties p ON b.property_id = p.id
             JOIN users u ON b.traveler_id = u.id
             WHERE b.id = ? AND p.owner_id = ?`,
            [bookingId, ownerId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        const booking = bookings[0];

        // Update booking status
        await connection.execute(
            'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, bookingId]
        );

        // Publish status update event to Kafka
        const event = {
            key: bookingId.toString(),
            value: {
                eventType: 'BOOKING_STATUS_UPDATED',
                bookingId: parseInt(bookingId),
                propertyId: booking.property_id,
                travelerId: booking.traveler_id,
                ownerId: ownerId,
                previousStatus: booking.status,
                newStatus: status,
                travelerName: booking.traveler_name,
                travelerEmail: booking.traveler_email,
                propertyName: booking.property_name,
                startDate: booking.start_date,
                endDate: booking.end_date,
                timestamp: new Date().toISOString()
            }
        };

        publishMessage(TOPICS.BOOKING_STATUS_UPDATES, event)
            .then(() => console.log(`📤 Booking status update ${bookingId} published to Kafka`))
            .catch(err => console.error(`❌ Failed to publish status update ${bookingId}:`, err));

        res.json({
            message: `Booking ${status} successfully`,
            bookingId: bookingId,
            status: status
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Failed to update booking status' });
    } finally {
        connection.release();
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'kafka-producer',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Kafka Producer Service running on port ${PORT}`);
    console.log(`📤 Publishing events to Kafka topics`);
});

