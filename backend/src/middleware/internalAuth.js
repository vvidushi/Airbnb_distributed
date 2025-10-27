/**
 * Internal API authentication middleware
 * Allows AI agent to access backend with API key
 */

module.exports = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];
    const userId = req.query.userId;

    // Check if API key is valid
    if (apiKey !== process.env.INTERNAL_API_KEY || !userId) {
        return res.status(401).json({
            error: 'Unauthorized. Invalid API key or missing userId.'
        });
    }

    // Set user in request for downstream handlers
    req.internalUserId = parseInt(userId);
    next();
};

