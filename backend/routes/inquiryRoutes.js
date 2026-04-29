const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const verifyToken = require('../middleware/authMiddleware');

// POST new student inquiry
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can post inquiries' });
    const inquiry = new Inquiry(req.body);
    await inquiry.save();
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all inquiries (Admin view - SECURED)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET public inquiries (Flatmates view)
router.get('/public', async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ consentToPublish: true }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an inquiry
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
