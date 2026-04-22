const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'advisor'], default: 'customer' },
  employeeId: { type: String },
  storeLocation: { type: String },

  // Advisor ↔ Customer linking
  assignedAdvisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // for customers
  assignedCustomerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],             // for advisors

  // LIS Algorithm data (persisted server-side)
  lis: {
    score:       { type: Number, default: 0 },
    profile:     { type: String, enum: ['Premium', 'Selective', 'Occasional', 'Explorer'], default: 'Explorer' },
    notifPref:   { type: String, enum: ['daily', 'weekly', 'monthly', 'rarely'], default: 'weekly' },
    behavioralScore: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },

  // Loyalty
  loyaltyPoints: { type: Number, default: 0 },
  totalSpent:    { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
