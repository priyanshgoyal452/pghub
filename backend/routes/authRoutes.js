const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Student = require('../models/Student');
const verifyToken = require('../middleware/authMiddleware');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashedPassword });
    await student.save();

    const token = jwt.sign(
      { id: student._id, role: 'student' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback'
    );
    res.status(201).json({ 
      token, 
      student: { id: student._id, name: student.name, email: student.email, savedPGs: student.savedPGs } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: student._id, role: 'student' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback'
    );
    res.status(200).json({ 
      token, 
      student: { id: student._id, name: student.name, email: student.email, savedPGs: student.savedPGs } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { name, email } = payload;
    
    let student = await Student.findOne({ email });
    if (!student) {
       student = new Student({ name, email, password: 'google-oauth-secured' });
       await student.save();
    }
    
    const token = jwt.sign(
      { id: student._id, role: 'student' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback'
    );
    res.status(200).json({ 
      token, 
      student: { id: student._id, name: student.name, email: student.email, savedPGs: student.savedPGs } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Get Current Student Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).populate('savedPGs');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    res.json({ id: student._id, name: student.name, email: student.email, savedPGs: student.savedPGs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Bookmark
router.post('/save-pg', verifyToken, async (req, res) => {
  try {
    const { pgId } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const idx = student.savedPGs.indexOf(pgId);
    if (idx > -1) {
      student.savedPGs.splice(idx, 1);
    } else {
      student.savedPGs.push(pgId);
    }
    
    await student.save();
    res.json({ savedPGs: student.savedPGs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
