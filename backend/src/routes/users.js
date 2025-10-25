const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isTraveler } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', isAuthenticated, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               about_me:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               languages:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', isAuthenticated, userController.updateProfile);

/**
 * @swagger
 * /api/users/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 */
router.post('/profile-picture', isAuthenticated, upload.single('profilePicture'), userController.uploadProfilePicture);

/**
 * @swagger
 * /api/users/favorites:
 *   post:
 *     summary: Add property to favorites
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Added to favorites
 */
router.post('/favorites', isAuthenticated, isTraveler, userController.addFavorite);

/**
 * @swagger
 * /api/users/favorites/{propertyId}:
 *   delete:
 *     summary: Remove property from favorites
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Removed from favorites
 */
router.delete('/favorites/:propertyId', isAuthenticated, isTraveler, userController.removeFavorite);

/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: Get user's favorite properties
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of favorite properties
 */
router.get('/favorites', isAuthenticated, isTraveler, userController.getFavorites);

module.exports = router;

