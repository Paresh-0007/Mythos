const express = require('express');
const router = express.Router();
const { db, users } = require('../db');

// Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const inserted = await db.insert(users).values({ name, email, password }).returning();
    res.status(201).json({ user: inserted[0] });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});


// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const found = await db.select().from(users).where(users.email.eq(email)).limit(1);
    if (!found.length || found[0].password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // You may want to exclude password from response
    const { password: _, ...user } = found[0];
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;
