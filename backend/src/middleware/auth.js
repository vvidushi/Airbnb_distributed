// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
};

// Role-based middleware
const isTraveler = (req, res, next) => {
    if (req.session && req.session.role === 'traveler') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Travelers only.' });
};

const isOwner = (req, res, next) => {
    if (req.session && req.session.role === 'owner') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Owners only.' });
};

module.exports = { isAuthenticated, isTraveler, isOwner };

