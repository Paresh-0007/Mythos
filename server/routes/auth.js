const express = require('express');
const router = express.Router();
const { db, users } = require('../db');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check for existing user
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const inserted = await db.insert(users).values({ name, email, password: hashedPassword }).returning();
    const { password: _, ...user } = inserted[0];
    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'mysecret', { expiresIn: '1d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});


// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!found.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, found[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const { password: _, ...user } = found[0];
    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'mysecret', { expiresIn: '1d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;
