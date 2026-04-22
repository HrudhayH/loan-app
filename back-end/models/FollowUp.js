const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  type: { type: String, enum: ['emi_reminder', 'overdue', 'general', 'payment_commitment'], default: 'general' },
  followUpDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

followUpSchema.index({ followUpDate: 1, status: 1 });
followUpSchema.index({ client: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
