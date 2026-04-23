const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { auth, adminOnly } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, linkedClient: u.linkedClient });

// ── Public: Admin registration (first-time setup) ──────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ token: signToken(user._id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: Login (both admin & client) ────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user._id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Auth: Current user info ────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const data = { user: req.user };
    // If client, attach the linked Client profile
    if (req.user.role === 'client' && req.user.linkedClient) {
      data.clientProfile = await Client.findById(req.user.linkedClient).lean();
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Create a client account (User + Client linked) ─────────
router.post('/create-client-account', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, city, state, pincode, idType, idNumber, occupation, monthlyIncome, address, alternatePhone, notes } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password and phone are required' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Create Client record
    const client = await Client.create({
      name, email, phone, alternatePhone, address, city, state, pincode,
      idType, idNumber, occupation, monthlyIncome, notes,
      createdBy: req.user._id,
    });

    // Create User account linked to the Client
    const user = await User.create({ name, email, password, role: 'client', linkedClient: client._id });

    // Backlink
    client.user = user._id;
    await client.save();

    res.status(201).json({ user: safeUser(user), client });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: List all users ──────────────────────────────────────────
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('linkedClient', 'name phone').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Toggle user active/inactive ─────────────────────────────
router.patch('/users/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot deactivate yourself' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ id: user._id, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
