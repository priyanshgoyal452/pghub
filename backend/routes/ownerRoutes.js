const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Owner = require('../models/Owner');
const PG = require('../models/PG');
const verifyToken = require('../middleware/authMiddleware');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Owner.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = new Owner({ name, email, password: hashedPassword });
    await owner.save();

    const token = jwt.sign(
      { id: owner._id, role: 'owner' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback'
    );
    res.status(201).json({ 
      token, 
      owner: { id: owner._id, name: owner.name, email: owner.email } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(404).json({ error: 'Owner not found' });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: owner._id, role: 'owner' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback'
    );
    res.status(200).json({ 
      token, 
      owner: { id: owner._id, name: owner.name, email: owner.email } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Sign-In for Owners
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { name, email } = payload;
    
    let owner = await Owner.findOne({ email });
    if (!owner) {
       owner = new Owner({ name, email, password: 'google-oauth-secured' });
       await owner.save();
    }
    
    const token = jwt.sign(
      { id: owner._id, role: 'owner' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback'
    );
    res.status(200).json({ 
      token, 
      owner: { id: owner._id, name: owner.name, email: owner.email } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// GET Owner's Dashboard Data (Only their PGs)
router.get('/my-pgs', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Access denied' });
    
    // Fetch properties uploaded strictly by this owner
    const pgs = await PG.find({ ownerId: req.user.id });
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
