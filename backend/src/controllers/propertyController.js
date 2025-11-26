const db = require('../config/database');

// Helper to safely parse JSON fields (e.g., images, amenities)
const safeParseJson = (value, fallback = []) => {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
};

// Helper to normalize image URLs to full EC2 URLs
const normalizeImageUrls = (images, baseUrl = null) => {
    if (!images || !Array.isArray(images)) return [];
    const backendUrl = baseUrl || process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace(':3000', ':5001') || 'http://54.81.110.183:5001';
    
    return images.map(img => {
        if (!img) return img;
        // If already a full URL, return as is
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
        }
        // If relative path starting with /uploads, add base URL
        if (img.startsWith('/uploads/')) {
            return `${backendUrl}${img}`;
        }
        // If just filename, add /uploads/ prefix
        return `${backendUrl}/uploads/${img}`;
    });
};

// Helper to process property object and normalize image URLs
const processProperty = (property) => {
    if (!property) return property;
    
    // Parse JSON fields
    property.amenities = safeParseJson(property.amenities);
    property.images = safeParseJson(property.images);
    
    // Normalize image URLs to full EC2 URLs
    property.images = normalizeImageUrls(property.images);
    
    return property;
};

// Get all properties (with optional search filters)
exports.searchProperties = async (req, res) => {
    try {
        const { location, startDate, endDate, guests, minPrice, maxPrice, sortBy } = req.query;

        let query = `
            SELECT p.*, u.name as owner_name 
            FROM properties p 
            JOIN users u ON p.owner_id = u.id 
            WHERE 1=1
              AND p.status = 'active'
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

        // Filter by price range
        if (minPrice) {
            query += ' AND p.price_per_night >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ' AND p.price_per_night <= ?';
            params.push(parseFloat(maxPrice));
        }

        // Filter by availability (check if property is not booked for the requested dates)
        if (startDate && endDate) {
            query += `
                AND p.id NOT IN (
                    SELECT property_id FROM bookings 
                    WHERE status = 'confirmed' 
                    AND NOT (end_date <= ? OR start_date >= ?)
                )
            `;
            params.push(startDate, endDate);
        }

        // Sorting
        switch(sortBy) {
            case 'price_low':
                query += ' ORDER BY p.price_per_night ASC';
                break;
            case 'price_high':
                query += ' ORDER BY p.price_per_night DESC';
                break;
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            case 'rating':
                query += ' ORDER BY p.created_at DESC'; // Can be changed to rating when implemented
                break;
            default:
                query += ' ORDER BY p.created_at DESC';
        }

        const [properties] = await db.query(query, params);

        // Normalize JSON fields and image URLs so frontend gets proper arrays and full URLs
        const normalized = properties.map((p) => {
            const amenities = safeParseJson(p.amenities, []);
            const images = normalizeImageUrls(safeParseJson(p.images, []));
            return {
                ...p,
                amenities,
                images
            };
        });

        res.json(normalized);
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

        const property = properties[0];
        property.amenities = safeParseJson(property.amenities, []);
        property.images = normalizeImageUrls(safeParseJson(property.images, []));

        res.json(property);
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

        // Ensure image URLs are full URLs pointing to EC2
        const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace(':3000', ':5001') || 'http://54.81.110.183:5001';
        const processedImages = (images || []).map(img => {
            // If it's already a full URL, keep it; otherwise make it a full URL
            if (img.startsWith('http://') || img.startsWith('https://')) {
                return img;
            }
            // If it's just a filename, add the base URL
            if (img.startsWith('/uploads/')) {
                return `${baseUrl}${img}`;
            }
            // If it's just a filename without /uploads/, add it
            return `${baseUrl}/uploads/${img}`;
        });
        
        const [result] = await db.query(
            `INSERT INTO properties 
            (owner_id, property_name, property_type, description, location, city, country, 
            price_per_night, bedrooms, bathrooms, max_guests, amenities, images) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ownerId, property_name, property_type, description, location, city, country,
                price_per_night, bedrooms, bathrooms, max_guests,
                JSON.stringify(amenities || []),
                JSON.stringify(processedImages) // Store full URLs
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

// Snooze property (Owner only) - Temporarily make unavailable
exports.snoozeProperty = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const { id } = req.params;

        // Check ownership
        const [properties] = await db.query('SELECT owner_id, status FROM properties WHERE id = ?', [id]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (properties[0].owner_id !== ownerId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const newStatus = properties[0].status === 'inactive' ? 'active' : 'inactive';
        await db.query('UPDATE properties SET status = ? WHERE id = ?', [newStatus, id]);
        
        res.json({ 
            message: newStatus === 'inactive' ? 'Property snoozed successfully' : 'Property reactivated successfully',
            status: newStatus
        });
    } catch (error) {
        console.error('Snooze property error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Unlist property (Owner only) - Permanently remove from listings
exports.unlistProperty = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const { id } = req.params;

        // Check ownership
        const [properties] = await db.query('SELECT owner_id FROM properties WHERE id = ?', [id]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        if (properties[0].owner_id !== ownerId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Mark as unlisted instead of deleting
        await db.query('UPDATE properties SET status = ? WHERE id = ?', ['unlisted', id]);
        res.json({ message: 'Property unlisted successfully' });
    } catch (error) {
        console.error('Unlist property error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete property (Owner only) - Keep for backwards compatibility
exports.deleteProperty = async (req, res) => {
    // Just call unlist instead
    return exports.unlistProperty(req, res);
};

// Get owner's properties
exports.getOwnerProperties = async (req, res) => {
    try {
        const ownerId = req.session.userId;
        const [properties] = await db.query('SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC', [ownerId]);
        
        // Normalize JSON fields and image URLs
        const normalized = properties.map((p) => {
            const amenities = safeParseJson(p.amenities, []);
            const images = normalizeImageUrls(safeParseJson(p.images, []));
            return {
                ...p,
                amenities,
                images
            };
        });
        
        res.json(normalized);
    } catch (error) {
        console.error('Get owner properties error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

