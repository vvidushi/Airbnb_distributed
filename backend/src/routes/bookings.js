const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isAuthenticated, isTraveler, isOwner } = require('../middleware/auth');

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking (Traveler only)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - startDate
 *               - endDate
 *               - numGuests
 *             properties:
 *               propertyId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               numGuests:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/', isAuthenticated, isTraveler, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/traveler:
 *   get:
 *     summary: Get traveler's bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of traveler's bookings
 */
router.get('/traveler', isAuthenticated, isTraveler, bookingController.getTravelerBookings);

/**
 * @swagger
 * /api/bookings/owner:
 *   get:
 *     summary: Get owner's bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of owner's bookings
 */
router.get('/owner', isAuthenticated, isOwner, bookingController.getOwnerBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get('/:id', isAuthenticated, bookingController.getBookingById);

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   put:
 *     summary: Accept a booking (Owner only)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 */
router.put('/:id/accept', isAuthenticated, isOwner, bookingController.acceptBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking (Owner or Traveler)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.put('/:id/cancel', isAuthenticated, bookingController.cancelBooking);

module.exports = router;

