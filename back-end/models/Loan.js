const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanNumber: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  loanType: { type: String, enum: ['vehicle', 'gold', 'home', 'personal', 'business', 'custom'], required: true },
  customLoanType: { type: String, trim: true }, // if loanType is 'custom'
  loanAmount: { type: Number, required: true, min: 0 },
  disbursedAmount: { type: Number, default: 0 },
  interestType: { type: String, enum: ['fixed', 'floating'], default: 'fixed' },
  interestRate: { type: Number, required: true, min: 0 }, // annual %
  tenure: { type: Number, required: true, min: 1 }, // in months
  emiFrequency: { type: String, enum: ['monthly', 'weekly', 'biweekly', 'custom'], default: 'monthly' },
  customFrequencyDays: { type: Number }, // if emiFrequency is 'custom'
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['pending_approval', 'active', 'closed', 'defaulted'], default: 'pending_approval' },
  // Penalty config
  penaltyType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  penaltyValue: { type: Number, default: 2 }, // 2% or flat amount
  penaltyGraceDays: { type: Number, default: 0 },
  // Totals (computed/cached)
  totalEmiAmount: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  totalPenalty: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

loanSchema.index({ client: 1 });
loanSchema.index({ status: 1 });

module.exports = mongoose.model('Loan', loanSchema);
