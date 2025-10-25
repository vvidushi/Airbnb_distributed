const db = require('../config/database');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const [users] = await db.query(
            'SELECT id, name, email, role, profile_pic, phone, about_me, city, country, languages, gender, favorite_property_ids FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, phone, about_me, city, country, languages, gender } = req.body;

        const [result] = await db.query(
            'UPDATE users SET name = ?, phone = ?, about_me = ?, city = ?, country = ?, languages = ?, gender = ? WHERE id = ?',
            [name, phone, about_me, city, country, languages, gender, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filename = req.file.filename;
        await db.query('UPDATE users SET profile_pic = ? WHERE id = ?', [filename, userId]);

        res.json({ 
            message: 'Profile picture uploaded successfully',
            filename: filename 
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add to favorites
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { propertyId } = req.body;

        // Get current favorites
        const [users] = await db.query('SELECT favorite_property_ids FROM users WHERE id = ?', [userId]);
        let favorites = users[0].favorite_property_ids || [];

        // Check if already in favorites
        if (favorites.includes(propertyId)) {
            return res.status(400).json({ error: 'Property already in favorites' });
        }

        // Add to favorites
        favorites.push(propertyId);
        await db.query('UPDATE users SET favorite_property_ids = ? WHERE id = ?', [JSON.stringify(favorites), userId]);

        res.json({ message: 'Added to favorites', favorites });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Remove from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { propertyId } = req.params;

        // Get current favorites
        const [users] = await db.query('SELECT favorite_property_ids FROM users WHERE id = ?', [userId]);
        let favorites = users[0].favorite_property_ids || [];

        // Remove from favorites
        favorites = favorites.filter(id => id !== parseInt(propertyId));
        await db.query('UPDATE users SET favorite_property_ids = ? WHERE id = ?', [JSON.stringify(favorites), userId]);

        res.json({ message: 'Removed from favorites', favorites });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get favorites
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.session.userId;

        // Get user's favorite property IDs
        const [users] = await db.query('SELECT favorite_property_ids FROM users WHERE id = ?', [userId]);
        const favoriteIds = users[0].favorite_property_ids || [];

        if (favoriteIds.length === 0) {
            return res.json([]);
        }

        // Get favorite properties
        const [properties] = await db.query(
            'SELECT p.*, u.name as owner_name FROM properties p JOIN users u ON p.owner_id = u.id WHERE p.id IN (?)',
            [favoriteIds]
        );

        res.json(properties);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

