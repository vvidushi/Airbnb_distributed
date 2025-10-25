const db = require('../config/database');

// Get all properties (with optional search filters)
exports.searchProperties = async (req, res) => {
    try {
        const { location, startDate, endDate, guests } = req.query;

        let query = `
            SELECT p.*, u.name as owner_name 
            FROM properties p 
            JOIN users u ON p.owner_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        // Filter by location
        if (location) {
            query += ' AND (p.city LIKE ? OR p.country LIKE ? OR p.location LIKE ?)';
            const searchTerm = `%${location}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Filter by number of guests
        if (guests) {
            query += ' AND p.max_guests >= ?';
            params.push(parseInt(guests));
        }

        // Filter by availability (check if property is not booked for the requested dates)
        if (startDate && endDate) {
            query += `
                AND p.id NOT IN (
                    SELECT property_id FROM bookings 
                    WHERE status = 'accepted' 
                    AND NOT (end_date <= ? OR start_date >= ?)
                )
            `;
            params.push(startDate, endDate);
        }

        query += ' ORDER BY p.created_at DESC';

        const [properties] = await db.query(query, params);
        res.json(properties);
    } catch (error) {
        console.error('Search properties error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const [properties] = await db.query(
            'SELECT p.*, u.name as owner_name, u.phone as owner_phone FROM properties p JOIN users u ON p.owner_id = u.id WHERE p.id = ?',
            [id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json(properties[0]);
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create property (Owner only)
exports.createProperty = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const {
            property_name,
            property_type,
            description,
            location,
            city,
            country,
            price_per_night,
            bedrooms,
            bathrooms,
            max_guests,
            amenities,
            images
        } = req.body;

        // Validation
        if (!property_name || !property_type || !location || !city || !country || !price_per_night || !bedrooms || !bathrooms || !max_guests) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const [result] = await db.query(
            `INSERT INTO properties 
            (owner_id, property_name, property_type, description, location, city, country, 
            price_per_night, bedrooms, bathrooms, max_guests, amenities, images) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ownerId, property_name, property_type, description, location, city, country,
                price_per_night, bedrooms, bathrooms, max_guests,
                JSON.stringify(amenities || []),
                JSON.stringify(images || [])
            ]
        );

        res.status(201).json({
            message: 'Property created successfully',
            propertyId: result.insertId
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update property (Owner only)
exports.updateProperty = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const { id } = req.params;
        const {
            property_name,
            property_type,
            description,
            location,
            city,
            country,
            price_per_night,
            bedrooms,
            bathrooms,
            max_guests,
            amenities,
            images
        } = req.body;

        // Check ownership
        const [properties] = await db.query('SELECT owner_id FROM properties WHERE id = ?', [id]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (properties[0].owner_id !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to update this property' });
        }

        await db.query(
            `UPDATE properties SET 
            property_name = ?, property_type = ?, description = ?, location = ?, city = ?, 
            country = ?, price_per_night = ?, bedrooms = ?, bathrooms = ?, max_guests = ?, 
            amenities = ?, images = ? 
            WHERE id = ?`,
            [
                property_name, property_type, description, location, city, country,
                price_per_night, bedrooms, bathrooms, max_guests,
                JSON.stringify(amenities || []),
                JSON.stringify(images || []),
                id
            ]
        );

        res.json({ message: 'Property updated successfully' });
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete property (Owner only)
exports.deleteProperty = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const { id } = req.params;

        // Check ownership
        const [properties] = await db.query('SELECT owner_id FROM properties WHERE id = ?', [id]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (properties[0].owner_id !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to delete this property' });
        }

        await db.query('DELETE FROM properties WHERE id = ?', [id]);
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get owner's properties
exports.getOwnerProperties = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const [properties] = await db.query('SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC', [ownerId]);
        res.json(properties);
    } catch (error) {
        console.error('Get owner properties error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

