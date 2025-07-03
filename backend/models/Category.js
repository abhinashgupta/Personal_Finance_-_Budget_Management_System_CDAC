const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true }
});

module.exports = mongoose.model('Category', categorySchema);
