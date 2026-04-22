const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  emi: { type: mongoose.Schema.Types.ObjectId, ref: 'EMISchedule', required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMode: { type: String, enum: ['cash', 'bank_transfer', 'upi', 'card', 'other'], default: 'cash' },
  paymentDate: { type: Date, default: Date.now },
  referenceNumber: { type: String, trim: true },
  notes: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

paymentSchema.index({ loan: 1 });
paymentSchema.index({ emi: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
