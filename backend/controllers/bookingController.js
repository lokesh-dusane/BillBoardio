// Booking controller - handles booking requests
const Booking = require('../models/Booking');
const Billboard = require('../models/Billboard');

// Create booking request
exports.createBooking = async (req, res) => {
  try {
    const { billboardId, startDate, endDate, message } = req.body;

    // Get billboard details
    const billboard = await Billboard.findById(billboardId);
    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    if (billboard.availability !== 'available') {
      return res.status(400).json({ error: 'Billboard not available' });
    }

    // Calculate total price (simple day-based calculation)
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = billboard.price * days;

    const booking = new Booking({
      billboardId,
      advertiserId: req.user._id,
      ownerId: billboard.ownerId,
      startDate,
      endDate,
      message,
      totalPrice
    });

    await booking.save();
    res.status(201).json({ message: 'Booking request sent successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get advertiser bookings
exports.getAdvertiserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ advertiserId: req.user._id })
      .populate('billboardId')
      .populate('ownerId', 'name email phone');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get owner bookings
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('billboardId')
      .populate('advertiserId', 'name email phone company');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking status (approve/reject)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is the owner
    if (booking.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Update billboard availability if approved
    if (status === 'approved') {
        await Billboard.findByIdAndUpdate(booking.billboardId, { availability: 'booked' });
    }

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('billboardId')
      .populate('advertiserId', 'name email')
      .populate('ownerId', 'name email');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
    