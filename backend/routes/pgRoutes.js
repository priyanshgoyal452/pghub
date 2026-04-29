const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const jwt = require('jsonwebtoken');
const PG = require('../models/PG');
const verifyToken = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

// Configure storage
let storage;
if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'pghub_properties',
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
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({ storage: storage });

// GET all approved PGs (Student View)
router.get('/', async (req, res) => {
  try {
    const { budget, gender, location } = req.query;
    let query = { status: 'Approved' };
    if (budget) {
        query.rent = { $lte: Number(budget) };
    }
    if (gender) {
        query.gender = gender;
    }
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    const pgs = await PG.find(query);
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET similar PGs based on rent & gender
router.get('/:id/similar', async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ error: 'PG not found' });
    
    const similar = await PG.find({
      _id: { $ne: pg._id },
      status: 'Approved',
      gender: pg.gender,
      rent: { 
        $gte: Math.max(0, pg.rent - 3000), 
        $lte: pg.rent + 3000 
      }
    }).limit(3);
    
    res.json(similar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET specific PG
router.get('/:id', async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ error: 'PG not found' });
    res.json(pg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new PG (Owner Form)
router.post('/', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only registered landlords can post properties.' });
    }

    const pgData = req.body;
    pgData.ownerId = req.user.id;
    
    if (typeof pgData.facilities === 'string') {
      pgData.facilities = pgData.facilities.split(',').map(f => f.trim()).filter(f => f);
    }
    
    pgData.contactDetails = {
      phone: pgData.phone,
      email: pgData.email
    };

    if (req.files && req.files.length > 0) {
      if (useCloudinary) {
        pgData.images = req.files.map(file => file.path); // Cloudinary URL
      } else {
        pgData.images = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`); // Local URL
      }
    } else {
      pgData.images = [];
    }

    const newPG = new PG(pgData);
    await newPG.save();
    res.status(201).json(newPG);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST a review for a specific PG
router.post('/:id/reviews', async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ error: 'PG not found' });

    pg.reviews.push({ userName, rating: Number(rating), comment });
    await pg.save();
    
    res.status(201).json(pg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADMIN ROUTES
// GET all PGs including pending
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const pgs = await PG.find();
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to approve or reject
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const { status } = req.body;
    const pg = await PG.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(pg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a PG
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const pg = await PG.findByIdAndDelete(req.params.id);
    if (!pg) return res.status(404).json({ error: 'PG not found' });
    res.json({ message: 'PG deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
