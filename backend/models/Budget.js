const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category for budget is required']
    },
    limit: {
        type: Number,
        required: [true, 'Budget limit is required'],
        min: [0, 'Budget limit must be a positive number']
    },
    period: {
        type: String,
        enum: ['monthly', 'weekly', 'yearly'],
        required: [true, 'Budget period is required']
    },
    startdate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    enddate: {
        type: Date,
        required: [true, 'End date is required']
    }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);