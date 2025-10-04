// Billboard routes
const express = require('express');
const router = express.Router();
const billboardController = require('../controllers/billboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /api/billboards - Create new billboard (owner only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('owner'),
  billboardController.upload,
  billboardController.createBillboard
);

// GET /api/billboards - Get all approved billboards
router.get('/', billboardController.getAllBillboards);

// GET /api/billboards/my - Get owner's billboards
router.get('/my', authMiddleware, roleMiddleware('owner'), billboardController.getOwnerBillboards);

// GET /api/billboards/:id - Get billboard by ID
router.get('/:id', billboardController.getBillboardById);

// PUT /api/billboards/:id - Update billboard
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('owner', 'admin'),
  billboardController.upload,
  billboardController.updateBillboard
);

// DELETE /api/billboards/:id - Delete billboard
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('owner', 'admin'),
  billboardController.deleteBillboard
);

module.exports = router;