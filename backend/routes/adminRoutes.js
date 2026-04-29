const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'pghub2026';
  
  if (password === adminPassword) {
    const token = jwt.sign(
      { role: 'admin' }, 
      process.env.JWT_SECRET || 'pghubsupersecretfallback', 
      { expiresIn: '24h' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

module.exports = router;
