const router = require('express').Router();
const Loan = require('../models/Loan');
const EMISchedule = require('../models/EMISchedule');
const { auth, adminOnly } = require('../middleware/auth');
const { generateEMISchedule, calculatePenalty, generateLoanNumber } = require('../utils/emiCalculator');

router.use(auth);

// ── Scope helper: client sees only their own loans ─────────────────
function scopeQuery(req, base = {}) {
  if (req.user.role === 'client') {
    base.client = req.user.linkedClient;
  }
  return base;
}

// GET /api/loans
router.get('/', async (req, res) => {
  try {
    const { status, client, loanType, page = 1, limit = 20 } = req.query;
    const query = scopeQuery(req);
    if (status) query.status = status;
    if (client && req.user.role === 'admin') query.client = client;
    if (loanType) query.loanType = loanType;

    const loans = await Loan.find(query)
      .populate('client', 'name phone email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Loan.countDocuments(query);
    res.json({ loans, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/loans/:id
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('client').lean();
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // Client can only view their own loan
    if (req.user.role === 'client' && loan.client?._id?.toString() !== req.user.linkedClient?.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const emis = await EMISchedule.find({ loan: loan._id }).sort({ emiNumber: 1 }).lean();
    res.json({ loan, emis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans — admin only
router.post('/', adminOnly, async (req, res) => {
  try {
    const {
      client, loanType, customLoanType, loanAmount, interestType, interestRate,
      tenure, emiFrequency, customFrequencyDays, startDate,
      penaltyType, penaltyValue, penaltyGraceDays, notes
    } = req.body;

    const loanNumber = generateLoanNumber();
    const schedule = generateEMISchedule(loanAmount, interestRate, tenure, startDate, emiFrequency, customFrequencyDays);
    const totalEmiAmount = schedule.reduce((sum, e) => sum + e.emiAmount, 0);
    const endDate = schedule[schedule.length - 1]?.dueDate;

    const loan = await Loan.create({
      loanNumber, client, loanType, customLoanType, loanAmount, disbursedAmount: loanAmount,
      interestType, interestRate, tenure, emiFrequency, customFrequencyDays,
      startDate, endDate, status: 'pending_approval',
      penaltyType: penaltyType || 'percentage', penaltyValue: penaltyValue ?? 2,
      penaltyGraceDays: penaltyGraceDays || 0,
      totalEmiAmount: Math.round(totalEmiAmount * 100) / 100,
      outstandingAmount: Math.round(totalEmiAmount * 100) / 100,
      notes, createdBy: req.user._id,
    });

    await EMISchedule.insertMany(schedule.map(e => ({ ...e, loan: loan._id })));
    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/loans/:id/status — admin only
router.patch('/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/loans/:id/interest-rate — admin only (floating rate)
router.patch('/:id/interest-rate', adminOnly, async (req, res) => {
  try {
    const { interestRate } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (loan.interestType !== 'floating') return res.status(400).json({ error: 'Only floating rate loans can be updated' });

    const paidEmis = await EMISchedule.find({ loan: loan._id, status: 'paid' }).lean();
    const paidPrincipal = paidEmis.reduce((sum, e) => sum + e.principalComponent, 0);
    const remainingPrincipal = loan.loanAmount - paidPrincipal;
    const remainingTenure = loan.tenure - paidEmis.length;
    if (remainingTenure <= 0) return res.status(400).json({ error: 'No remaining EMIs to recalculate' });

    await EMISchedule.deleteMany({ loan: loan._id, status: { $in: ['upcoming', 'unpaid', 'overdue'] } });

    const lastPaidEmi = paidEmis[paidEmis.length - 1];
    const newStartDate = lastPaidEmi ? lastPaidEmi.dueDate : loan.startDate;
    const newSchedule = generateEMISchedule(remainingPrincipal, interestRate, remainingTenure, newStartDate, loan.emiFrequency, loan.customFrequencyDays);
    await EMISchedule.insertMany(newSchedule.map((e, i) => ({ ...e, emiNumber: paidEmis.length + i + 1, loan: loan._id })));

    loan.interestRate = interestRate;
    const totalNewEmi = newSchedule.reduce((s, e) => s + e.emiAmount, 0);
    const totalPaid = paidEmis.reduce((s, e) => s + e.paidAmount, 0);
    loan.totalEmiAmount = Math.round((paidEmis.reduce((s, e) => s + e.emiAmount, 0) + totalNewEmi) * 100) / 100;
    loan.outstandingAmount = Math.round((loan.totalEmiAmount - totalPaid) * 100) / 100;
    loan.endDate = newSchedule[newSchedule.length - 1]?.dueDate;
    await loan.save();

    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/loans/:id/detect-overdue — admin only
router.post('/:id/detect-overdue', adminOnly, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const now = new Date();
    const overdueEmis = await EMISchedule.find({
      loan: loan._id,
      dueDate: { $lt: now },
      status: { $in: ['upcoming', 'unpaid', 'partially_paid'] },
    });

    let totalPenalty = 0;
    for (const emi of overdueEmis) {
      const overdueDays = Math.floor((now - emi.dueDate) / (1000 * 60 * 60 * 24)) - (loan.penaltyGraceDays || 0);
      if (overdueDays > 0) {
        emi.status = emi.paidAmount > 0 ? 'partially_paid' : 'overdue';
        emi.overdueDays = overdueDays;
        emi.penaltyAmount = calculatePenalty(emi.emiAmount, loan.penaltyType, loan.penaltyValue, overdueDays);
        totalPenalty += emi.penaltyAmount;
        await emi.save();
      }
    }

    loan.totalPenalty = totalPenalty;
    await loan.save();

    res.json({ overdueCount: overdueEmis.length, totalPenalty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
