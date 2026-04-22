const mongoose = require('mongoose');

const emiScheduleSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  emiNumber: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  emiAmount: { type: Number, required: true },
  principalComponent: { type: Number, required: true },
  interestComponent: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'paid', 'partially_paid', 'unpaid', 'overdue'], default: 'upcoming' },
  overdueDays: { type: Number, default: 0 },
  paidDate: { type: Date },
}, { timestamps: true });

emiScheduleSchema.index({ loan: 1, emiNumber: 1 });
emiScheduleSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('EMISchedule', emiScheduleSchema);
