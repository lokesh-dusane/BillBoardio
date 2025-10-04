// Billboard controller - handles CRUD operations for billboards
const Billboard = require('../models/Billboard');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'frontend/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage }).single('image');

// Create new billboard
exports.createBillboard = async (req, res) => {
  try {
    const { title, location, address, size, price, description, availability } = req.body;

    const billboard = new Billboard({
      title,
      location,
      address,
      size,
      price,
      description,
      availability,
      image: req.file ? req.file.filename : 'default-billboard.jpg',
      ownerId: req.user._id
    });

    await billboard.save();
    res.status(201).json({ message: 'Billboard created successfully', billboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all billboards (with filters)
exports.getAllBillboards = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, size, availability } = req.query;
    
    let query = { approved: true };

    if (location) query.location = new RegExp(location, 'i');
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (size) query.size = size;
    if (availability) query.availability = availability;

    const billboards = await Billboard.find(query).populate('ownerId', 'name email phone company');
    res.json(billboards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billboard by ID
exports.getBillboardById = async (req, res) => {
  try {
    const billboard = await Billboard.findById(req.params.id).populate('ownerId', 'name email phone company');
    
    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    res.json(billboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billboards by owner
exports.getOwnerBillboards = async (req, res) => {
  try {
    const billboards = await Billboard.find({ ownerId: req.user._id });
    res.json(billboards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update billboard
exports.updateBillboard = async (req, res) => {
  try {
    const billboard = await Billboard.findById(req.params.id);

    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    // Check if user is the owner
    if (billboard.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(billboard, req.body);
    if (req.file) billboard.image = req.file.filename;

    await billboard.save();
    res.json({ message: 'Billboard updated successfully', billboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete billboard
exports.deleteBillboard = async (req, res) => {
  try {
    const billboard = await Billboard.findById(req.params.id);

    if (!billboard) {
      return res.status(404).json({ error: 'Billboard not found' });
    }

    // Check if user is the owner
    if (billboard.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await billboard.deleteOne();
    res.json({ message: 'Billboard deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.upload = upload;