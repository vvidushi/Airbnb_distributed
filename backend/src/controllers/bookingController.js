const db = require('../config/database');

// Create booking (Traveler only)
exports.createBooking = async (req, res) => {
    try {
        const travelerId = req.session.userId;
        const { propertyId, startDate, endDate, numGuests } = req.body;

        // Validation
        if (!propertyId || !startDate || !endDate || !numGuests) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if property exists
        const [properties] = await db.query('SELECT * FROM properties WHERE id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const property = properties[0];

        // Check max guests
        if (numGuests > property.max_guests) {
            return res.status(400).json({ error: `Property can accommodate maximum ${property.max_guests} guests` });
        }

        // Check if property is already booked for these dates
        const [existingBookings] = await db.query(
            `SELECT * FROM bookings 
            WHERE property_id = ? 
            AND status = 'accepted' 
            AND NOT (end_date <= ? OR start_date >= ?)`,
            [propertyId, startDate, endDate]
        );

        if (existingBookings.length > 0) {
            return res.status(400).json({ error: 'Property is not available for selected dates' });
        }

        // Calculate total price
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = days * property.price_per_night;

        // Create booking
        const [result] = await db.query(
            'INSERT INTO bookings (property_id, traveler_id, start_date, end_date, num_guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [propertyId, travelerId, startDate, endDate, numGuests, totalPrice, 'pending']
        );

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: result.insertId,
            totalPrice: totalPrice
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get traveler's bookings
exports.getTravelerBookings = async (req, res) => {
    try {
        const travelerId = req.session.userId;
        const [bookings] = await db.query(
            `SELECT b.*, p.property_name, p.location, p.city, p.images, u.name as owner_name, u.phone as owner_phone
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON p.owner_id = u.id
            WHERE b.traveler_id = ?
            ORDER BY b.created_at DESC`,
            [travelerId]
        );

        res.json(bookings);
    } catch (error) {
        console.error('Get traveler bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get owner's bookings (for their properties)
exports.getOwnerBookings = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const [bookings] = await db.query(
            `SELECT b.*, p.property_name, p.location, p.city, u.name as traveler_name, u.email as traveler_email, u.phone as traveler_phone
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON b.traveler_id = u.id
            WHERE p.owner_id = ?
            ORDER BY b.created_at DESC`,
            [ownerId]
        );

        res.json(bookings);
    } catch (error) {
        console.error('Get owner bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Accept booking (Owner only)
exports.acceptBooking = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const { id } = req.params;

        // Check if booking exists and belongs to owner's property
        const [bookings] = await db.query(
            `SELECT b.*, p.owner_id 
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            WHERE b.id = ?`,
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (bookings[0].owner_id !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to accept this booking' });
        }

        if (bookings[0].status !== 'pending') {
            return res.status(400).json({ error: 'Only pending bookings can be accepted' });
        }

        // Update booking status
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['accepted', id]);

        res.json({ message: 'Booking accepted successfully' });
    } catch (error) {
        console.error('Accept booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Cancel booking (Owner or Traveler)
exports.cancelBooking = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userRole = req.session.role;
        const { id } = req.params;

        // Get booking details
        const [bookings] = await db.query(
            `SELECT b.*, p.owner_id 
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            WHERE b.id = ?`,
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookings[0];

        // Check authorization
        const isOwner = userRole === 'owner' && booking.owner_id === userId;
        const isTraveler = userRole === 'traveler' && booking.traveler_id === userId;

        if (!isOwner && !isTraveler) {
            return res.status(403).json({ error: 'Not authorized to cancel this booking' });
        }

        // Update booking status
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const userRole = req.session.role;

        const [bookings] = await db.query(
            `SELECT b.*, p.property_name, p.location, p.city, p.country, p.owner_id,
            u.name as traveler_name, u.email as traveler_email
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON b.traveler_id = u.id
            WHERE b.id = ?`,
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookings[0];

        // Check authorization
        const isOwner = userRole === 'owner' && booking.owner_id === userId;
        const isTraveler = userRole === 'traveler' && booking.traveler_id === userId;

        if (!isOwner && !isTraveler) {
            return res.status(403).json({ error: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

