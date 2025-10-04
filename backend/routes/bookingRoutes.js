// Booking routes
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /api/bookings - Create booking request (advertiser only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('advertiser'),
  bookingController.createBooking
);

// GET /api/bookings/advertiser - Get advertiser's bookings
router.get(
  '/advertiser',
  authMiddleware,
  roleMiddleware('advertiser'),
  bookingController.getAdvertiserBookings
);

// GET /api/bookings/owner - Get owner's bookings
router.get(
  '/owner',
  authMiddleware,
  roleMiddleware('owner'),
  bookingController.getOwnerBookings
);

// PUT /api/bookings/:id - Update booking status
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('owner', 'admin'),
  bookingController.updateBookingStatus
);

module.exports = router;