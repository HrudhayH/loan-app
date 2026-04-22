const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  type: { type: String, enum: ['call', 'email', 'sms', 'whatsapp', 'note'], default: 'note' },
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'outbound' },
  summary: { type: String, required: true },
  outcome: { type: String }, // e.g. "promised to pay by Friday"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

communicationLogSchema.index({ client: 1 });
communicationLogSchema.index({ loan: 1 });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
