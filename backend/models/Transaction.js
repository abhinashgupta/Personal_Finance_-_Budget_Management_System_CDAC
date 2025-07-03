const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  recurring: { type: Boolean, default: false }
});

module.exports = mongoose.model('Transaction', transactionSchema);
