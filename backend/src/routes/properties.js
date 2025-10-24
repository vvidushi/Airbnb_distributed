const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { isAuthenticated, isOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/search', propertyController.searchProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property details
 */
router.get('/:id', propertyController.getPropertyById);

/**
 * @swagger
 * /api/properties/upload-images:
 *   post:
 *     summary: Upload property images
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post('/upload-images', isAuthenticated, isOwner, upload.array('propertyImages', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const filenames = req.files.map(file => file.filename);
        res.json({ 
            message: 'Images uploaded successfully',
            filenames: filenames 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property (Owner only)
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property_name
 *               - property_type
 *               - location
 *               - city
 *               - country
 *               - price_per_night
 *               - bedrooms
 *               - bathrooms
 *               - max_guests
 *             properties:
 *               property_name:
 *                 type: string
 *               property_type:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               price_per_night:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               max_guests:
 *                 type: integer
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post('/', isAuthenticated, isOwner, propertyController.createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property (Owner only)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property updated successfully
 */
router.put('/:id', isAuthenticated, isOwner, propertyController.updateProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete property (Owner only)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property deleted successfully
 */
router.delete('/:id', isAuthenticated, isOwner, propertyController.deleteProperty);

/**
 * @swagger
 * /api/properties/owner/my-properties:
 *   get:
 *     summary: Get owner's properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of owner's properties
 */
router.get('/owner/my-properties', isAuthenticated, isOwner, propertyController.getOwnerProperties);

module.exports = router;
