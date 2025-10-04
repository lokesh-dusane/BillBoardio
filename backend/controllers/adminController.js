// Admin controller - handles admin operations
const User = require('../models/User');
const Billboard = require('../models/Billboard');
const Booking = require('../models/Booking');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin user' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all billboards (including unapproved)
exports.getAllBillboardsAdmin = async (req, res) => {
  try {
    const billboards = await Billboard.find().populate('ownerId', 'name email');
    res.json(billboards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve/reject billboard
exports.approveBillboard = async (req, res) => {
  try {
    const { approved } = req.body;
    const billboard = await Billboard.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );

    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    res.json({ message: 'Billboard status updated', billboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalAdvertisers = await User.countDocuments({ role: 'advertiser' });
    const totalBillboards = await Billboard.countDocuments();
    const approvedBillboards = await Billboard.countDocuments({ approved: true });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });

    res.json({
      totalUsers,
      totalOwners,
      totalAdvertisers,
      totalBillboards,
      approvedBillboards,
      totalBookings,
      pendingBookings,
      approvedBookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};