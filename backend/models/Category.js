const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Category type is required']
    }
}, { timestamps: true });

categorySchema.index({ userid: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);