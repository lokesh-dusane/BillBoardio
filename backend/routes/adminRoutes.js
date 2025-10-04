// Admin routes
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require admin role
router.use(authMiddleware, roleMiddleware('admin'));

// GET /api/admin/users - Get all users
router.get('/users', adminController.getAllUsers);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminController.deleteUser);

// GET /api/admin/billboards - Get all billboards
router.get('/billboards', adminController.getAllBillboardsAdmin);

// PUT /api/admin/billboards/:id/approve - Approve/reject billboard
router.put('/billboards/:id/approve', adminController.approveBillboard);

// GET /api/admin/bookings - Get all bookings
router.get('/bookings', bookingController.getAllBookings);

// GET /api/admin/statistics - Get dashboard statistics
router.get('/statistics', adminController.getStatistics);

module.exports = router;