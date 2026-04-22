const router = require('express').Router();
const FollowUp = require('../models/FollowUp');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);
router.use(adminOnly); // All follow-up operations are admin-only

// GET /api/followups
router.get('/', async (req, res) => {
  try {
    const { status, client, from, to, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (client) query.client = client;
    if (from || to) {
      query.followUpDate = {};
      if (from) query.followUpDate.$gte = new Date(from);
      if (to) query.followUpDate.$lte = new Date(to);
    }
    const followups = await FollowUp.find(query)
      .populate('client', 'name phone')
      .populate('loan', 'loanNumber')
      .populate('createdBy', 'name')
      .sort({ followUpDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await FollowUp.countDocuments(query);
    res.json({ followups, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/followups
router.post('/', async (req, res) => {
  try {
    const followup = await FollowUp.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(followup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/followups/:id
router.patch('/:id', async (req, res) => {
  try {
    const followup = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!followup) return res.status(404).json({ error: 'Follow-up not found' });
    res.json(followup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/followups/:id
router.delete('/:id', async (req, res) => {
  try {
    await FollowUp.findByIdAndDelete(req.params.id);
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
