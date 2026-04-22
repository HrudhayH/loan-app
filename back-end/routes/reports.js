const router = require('express').Router();
const Loan = require('../models/Loan');
const EMISchedule = require('../models/EMISchedule');
const Payment = require('../models/Payment');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);
router.use(adminOnly); // All reports are admin-only

// GET /api/reports/emi?loan=xxx
router.get('/emi', async (req, res) => {
  try {
    const { loan, status } = req.query;
    const query = {};
    if (loan) query.loan = loan;
    if (status) query.status = status;
    const emis = await EMISchedule.find(query)
      .populate({ path: 'loan', select: 'loanNumber client loanType', populate: { path: 'client', select: 'name phone' } })
      .sort({ dueDate: 1 }).lean();
    res.json(emis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/payments?from=&to=
router.get('/payments', async (req, res) => {
  try {
    const { from, to, loan } = req.query;
    const query = {};
    if (loan) query.loan = loan;
    if (from || to) {
      query.paymentDate = {};
      if (from) query.paymentDate.$gte = new Date(from);
      if (to) query.paymentDate.$lte = new Date(to);
    }
    const payments = await Payment.find(query)
      .populate({ path: 'loan', select: 'loanNumber client', populate: { path: 'client', select: 'name' } })
      .populate('emi', 'emiNumber dueDate')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 }).lean();
    const total = payments.reduce((s, p) => s + p.amount, 0);
    res.json({ payments, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/overdue
router.get('/overdue', async (req, res) => {
  try {
    const emis = await EMISchedule.find({ status: 'overdue' })
      .populate({ path: 'loan', select: 'loanNumber client loanType penaltyType penaltyValue', populate: { path: 'client', select: 'name phone' } })
      .sort({ dueDate: 1 }).lean();
    const totalOverdue = emis.reduce((s, e) => s + (e.emiAmount - e.paidAmount) + e.penaltyAmount, 0);
    res.json({ emis, totalOverdue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/client/:clientId
router.get('/client/:clientId', async (req, res) => {
  try {
    const loans = await Loan.find({ client: req.params.clientId }).lean();
    const loanIds = loans.map(l => l._id);
    const emis = await EMISchedule.find({ loan: { $in: loanIds } }).sort({ dueDate: 1 }).lean();
    const payments = await Payment.find({ loan: { $in: loanIds } }).sort({ paymentDate: -1 }).lean();
    res.json({ loans, emis, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
