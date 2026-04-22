const router = require('express').Router();
const Payment = require('../models/Payment');
const EMISchedule = require('../models/EMISchedule');
const Loan = require('../models/Loan');
const { auth } = require('../middleware/auth');

router.use(auth);

// POST /api/payments — both admin and client (client scoped to own loans)
router.post('/', async (req, res) => {
  try {
    const { loan: loanId, emi: emiId, amount, paymentMode, paymentDate, referenceNumber, notes } = req.body;

    const emi = await EMISchedule.findById(emiId);
    if (!emi) return res.status(404).json({ error: 'EMI not found' });

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Client can only pay for their own loans
    if (req.user.role === 'client' && loan.client.toString() !== req.user.linkedClient?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow payment on active loans
    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Payments can only be made on active loans' });
    }

    const payment = await Payment.create({
      loan: loanId, emi: emiId, amount: Number(amount),
      paymentMode: paymentMode || 'cash',
      paymentDate: paymentDate || new Date(),
      referenceNumber, notes,
      recordedBy: req.user._id,
    });

    // Update EMI
    emi.paidAmount += Number(amount);
    const totalDue = emi.emiAmount + (emi.penaltyAmount || 0);
    emi.status = emi.paidAmount >= totalDue ? 'paid' : 'partially_paid';
    if (emi.status === 'paid') emi.paidDate = new Date();
    await emi.save();

    // Update loan totals
    loan.totalPaid = (loan.totalPaid || 0) + Number(amount);
    loan.outstandingAmount = Math.round((loan.totalEmiAmount + (loan.totalPenalty || 0) - loan.totalPaid) * 100) / 100;

    const unpaidCount = await EMISchedule.countDocuments({ loan: loanId, status: { $ne: 'paid' } });
    if (unpaidCount === 0) loan.status = 'closed';
    await loan.save();

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments — admin sees all, client sees own
router.get('/', async (req, res) => {
  try {
    const { loan, page = 1, limit = 50 } = req.query;
    const query = {};
    if (loan) query.loan = loan;

    // Scope client to their own loan payments
    if (req.user.role === 'client') {
      const clientLoans = await Loan.find({ client: req.user.linkedClient }).select('_id').lean();
      query.loan = { $in: clientLoans.map(l => l._id) };
    }

    const payments = await Payment.find(query)
      .populate('loan', 'loanNumber')
      .populate('emi', 'emiNumber dueDate')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Payment.countDocuments(query);
    res.json({ payments, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
