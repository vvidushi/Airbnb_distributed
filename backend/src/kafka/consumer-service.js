/**
 * KAFKA CONSUMER SERVICE
 * 
 * This service acts as the "Backend Service" in the architecture.
 * It consumes events from Kafka topics and processes them.
 * 
 * Responsibilities:
 * - Consume booking request events
 * - Process bookings (validation, notifications, etc.)
 * - Consume status update events
 * - Send notifications to travelers
 */

require('dotenv').config();
const { consumeMessages, TOPICS } = require('./kafkaClient');
const db = require('../config/database');

console.log('🎧 Starting Kafka Consumer Service...');
console.log(`📥 Listening to topics: ${Object.values(TOPICS).join(', ')}`);

/**
 * Process Booking Request Events
 * 
 * This function processes new booking requests from travelers.
 * In a real application, this would:
 * - Send notification to property owner
 * - Perform additional validation
 * - Update analytics
 * - Send confirmation email to traveler
 */
async function processBookingRequest(event) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 Processing Booking Request Event');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Booking ID:', event.bookingId);
    console.log('Property:', event.propertyName);
    console.log('Traveler:', event.travelerName);
    console.log('Dates:', `${event.startDate} to ${event.endDate}`);
    console.log('Guests:', event.guests);
    console.log('Total Price:', `$${event.totalPrice}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        // Simulate processing (in production, this would send emails, SMS, etc.)
        console.log(`✉️  [NOTIFICATION] Sending email to owner (ID: ${event.ownerId})`);
        console.log(`    Subject: New booking request for ${event.propertyName}`);
        console.log(`    Message: ${event.travelerName} wants to book from ${event.startDate} to ${event.endDate}`);

        // Update booking metadata (last processed time, etc.)
        const connection = await db.getConnection();
        await connection.execute(
            'UPDATE bookings SET updated_at = NOW() WHERE id = ?',
            [event.bookingId]
        );
        connection.release();

        console.log(`✅ Booking request ${event.bookingId} processed successfully`);
        console.log('');
    } catch (error) {
        console.error(`❌ Error processing booking request ${event.bookingId}:`, error);
    }
}

/**
 * Process Booking Status Update Events
 * 
 * This function processes booking status changes (accept/cancel).
 * In a real application, this would:
 * - Send notification to traveler
 * - Update calendar/availability
 * - Process payments
 * - Send confirmation emails
 */
async function processStatusUpdate(event) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 Processing Booking Status Update Event');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Booking ID:', event.bookingId);
    console.log('Property:', event.propertyName);
    console.log('Traveler:', event.travelerName);
    console.log('Status Change:', `${event.previousStatus} → ${event.newStatus}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        // Send notification to traveler
        console.log(`✉️  [NOTIFICATION] Sending email to traveler (${event.travelerEmail})`);
        
        if (event.newStatus === 'confirmed') {
            console.log(`    Subject: Your booking for ${event.propertyName} has been confirmed! 🎉`);
            console.log(`    Message: Great news! Your booking from ${event.startDate} to ${event.endDate} has been confirmed.`);
            console.log(`    Next Steps: Payment processing, confirmation details, check-in instructions...`);
        } else if (event.newStatus === 'cancelled') {
            console.log(`    Subject: Booking for ${event.propertyName} has been cancelled`);
            console.log(`    Message: Unfortunately, your booking request has been declined.`);
            console.log(`    Suggestion: Check out similar properties...`);
        }

        // Update analytics
        const connection = await db.getConnection();
        await connection.execute(
            'UPDATE bookings SET updated_at = NOW() WHERE id = ?',
            [event.bookingId]
        );
        connection.release();

        console.log(`✅ Status update ${event.bookingId} processed successfully`);
        console.log('');
    } catch (error) {
        console.error(`❌ Error processing status update ${event.bookingId}:`, error);
    }
}

/**
 * Main Message Handler
 * 
 * Routes messages to appropriate handlers based on topic
 */
async function handleMessage(topic, message) {
    try {
        switch (topic) {
            case TOPICS.BOOKING_REQUESTS:
                if (message.eventType === 'BOOKING_REQUEST_CREATED') {
                    await processBookingRequest(message);
                }
                break;

            case TOPICS.BOOKING_STATUS_UPDATES:
                if (message.eventType === 'BOOKING_STATUS_UPDATED') {
                    await processStatusUpdate(message);
                }
                break;

            case TOPICS.PROPERTY_UPDATES:
                console.log('📦 Property update event received:', message);
                // Handle property updates if needed
                break;

            default:
                console.log(`⚠️  Unknown topic: ${topic}`);
        }
    } catch (error) {
        console.error('❌ Error handling message:', error);
    }
}

/**
 * Start Consumer
 * 
 * Subscribe to all relevant topics and start consuming messages
 */
async function startConsumer() {
    try {
        const topics = [
            TOPICS.BOOKING_REQUESTS,
            TOPICS.BOOKING_STATUS_UPDATES,
            TOPICS.PROPERTY_UPDATES
        ];

        await consumeMessages(topics, handleMessage);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Kafka Consumer Service started successfully');
        console.log(`🎧 Listening to ${topics.length} topics`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
    } catch (error) {
        console.error('❌ Failed to start consumer:', error);
        process.exit(1);
    }
}

// Start the consumer
startConsumer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n📴 Shutting down consumer service...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n📴 Shutting down consumer service...');
    process.exit(0);
});

