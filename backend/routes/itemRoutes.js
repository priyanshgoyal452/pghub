const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Item = require('../models/Item');
const verifyToken = require('../middleware/authMiddleware');

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

let storage;
if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'pghub_items',
      allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
    }
  });
} else {
  storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'item_' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({ storage: storage });

// GET all available items
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'Available' };
    
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    // Populate seller details to show their name and get their ID to fetch phone if needed
    const items = await Item.find(query).populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new item
router.post('/', verifyToken, upload.array('images', 3), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Only logged-in students can sell items.' });
    }

    const itemData = req.body;
    itemData.sellerId = req.user.id; // Bound securely to the JWT

    if (req.files && req.files.length > 0) {
      if (useCloudinary) {
        itemData.images = req.files.map(file => file.path);
      } else {
        itemData.images = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
      }
    } else {
      itemData.images = [];
    }

    const newItem = new Item(itemData);
    await newItem.save();
    
    // Return populated item
    const savedItem = await Item.findById(newItem._id).populate('sellerId', 'name email');
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT mark item as sold
router.put('/:id/sold', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    if (item.sellerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'You can only edit your own listings.' });
    }

    item.status = 'Sold';
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all items for admin
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const items = await Item.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an item
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
