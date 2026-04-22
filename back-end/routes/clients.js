const router = require('express').Router();
const Client = require('../models/Client');
const CommunicationLog = require('../models/CommunicationLog');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

// GET /api/clients — admin sees all, client sees own profile
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'client') {
      const client = req.user.linkedClient
        ? await Client.findById(req.user.linkedClient).lean()
        : null;
      return res.json({ clients: client ? [client] : [], total: client ? 1 : 0, page: 1, pages: 1 });
    }
    const { search, page = 1, limit = 20 } = req.query;
    const query = search ? { $text: { $search: search } } : {};
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Client.countDocuments(query);
    res.json({ clients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id — admin or own profile
router.get('/:id', async (req, res) => {
  try {
    if (req.user.role === 'client' && req.params.id !== req.user.linkedClient?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const client = await Client.findById(req.params.id).lean();
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients — admin only
router.post('/', adminOnly, async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id — admin only
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id — admin only
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients/:id/communication — admin only
router.post('/:id/communication', adminOnly, async (req, res) => {
  try {
    const log = await CommunicationLog.create({ ...req.body, client: req.params.id, createdBy: req.user._id });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id/communication — admin only
router.get('/:id/communication', adminOnly, async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ client: req.params.id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
