const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
  startdate: { type: Date, required: true },
  enddate: { type: Date, required: true }
});

module.exports = mongoose.model('Budget', budgetSchema);
