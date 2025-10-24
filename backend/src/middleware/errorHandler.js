// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
};

module.exports = errorHandler;

