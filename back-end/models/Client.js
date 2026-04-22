const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  // KYC
  idType: { type: String, enum: ['aadhaar', 'pan', 'voter_id', 'passport', 'driving_license', 'other'], default: 'aadhaar' },
  idNumber: { type: String, trim: true },
  dateOfBirth: { type: Date },
  occupation: { type: String, trim: true },
  monthlyIncome: { type: Number },
  notes: { type: String },
  // Link to login account (set when admin creates login for this client)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

clientSchema.index({ name: 'text', phone: 'text', email: 'text' });
clientSchema.index({ phone: 1 });
clientSchema.index({ user: 1 });

module.exports = mongoose.model('Client', clientSchema);
