const router = require('express').Router();
const Loan = require('../models/Loan');
const EMISchedule = require('../models/EMISchedule');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const FollowUp = require('../models/FollowUp');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);

// GET /api/dashboard — admin gets full overview, client gets own summary
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'client') {
      return clientDashboard(req, res);
    }
    return adminDashboard(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function adminDashboard(req, res) {
  const [
    totalLoans, activeLoans, overdueLoans, closedLoans, pendingLoans, defaultedLoans,
    totalClients, pendingFollowups,
  ] = await Promise.all([
    Loan.countDocuments(),
    Loan.countDocuments({ status: 'active' }),
    EMISchedule.countDocuments({ status: 'overdue' }),
    Loan.countDocuments({ status: 'closed' }),
    Loan.countDocuments({ status: 'pending_approval' }),
    Loan.countDocuments({ status: 'defaulted' }),
    Client.countDocuments(),
    FollowUp.countDocuments({ status: 'pending', followUpDate: { $lte: new Date() } }),
  ]);

  const loanAgg = await Loan.aggregate([
    { $group: { _id: null, totalDisbursed: { $sum: '$disbursedAmount' }, totalCollected: { $sum: '$totalPaid' }, totalOutstanding: { $sum: '$outstandingAmount' }, totalPenalty: { $sum: '$totalPenalty' } } },
  ]);
  const summary = loanAgg[0] || { totalDisbursed: 0, totalCollected: 0, totalOutstanding: 0, totalPenalty: 0 };

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingEmis = await EMISchedule.find({ dueDate: { $gte: new Date(), $lte: nextWeek }, status: { $in: ['upcoming', 'partially_paid'] } })
    .populate({ path: 'loan', select: 'loanNumber client', populate: { path: 'client', select: 'name phone' } })
    .sort({ dueDate: 1 }).limit(10).lean();

  const recentPayments = await Payment.find()
    .populate('loan', 'loanNumber')
    .populate('recordedBy', 'name')
    .sort({ createdAt: -1 }).limit(10).lean();

  res.json({
    stats: { totalLoans, activeLoans, overdueLoans, closedLoans, pendingLoans, defaultedLoans, totalClients, pendingFollowups },
    summary, upcomingEmis, recentPayments,
  });
}

async function clientDashboard(req, res) {
  const clientId = req.user.linkedClient;
  if (!clientId) return res.json({ stats: {}, summary: {}, upcomingEmis: [], recentPayments: [] });

  const loans = await Loan.find({ client: clientId }).lean();
  const loanIds = loans.map(l => l._id);

  const activeLoans = loans.filter(l => l.status === 'active').length;
  const totalOutstanding = loans.reduce((s, l) => s + (l.outstandingAmount || 0), 0);
  const totalPaid = loans.reduce((s, l) => s + (l.totalPaid || 0), 0);

  const overdueEmis = await EMISchedule.countDocuments({ loan: { $in: loanIds }, status: 'overdue' });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingEmis = await EMISchedule.find({
    loan: { $in: loanIds }, dueDate: { $gte: new Date(), $lte: nextWeek }, status: { $in: ['upcoming', 'partially_paid'] },
  }).populate('loan', 'loanNumber').sort({ dueDate: 1 }).limit(10).lean();

  const recentPayments = await Payment.find({ loan: { $in: loanIds } })
    .populate('loan', 'loanNumber')
    .sort({ createdAt: -1 }).limit(10).lean();

  res.json({
    stats: { totalLoans: loans.length, activeLoans, overdueEmis, totalOutstanding, totalPaid },
    upcomingEmis, recentPayments,
  });
}

module.exports = router;
