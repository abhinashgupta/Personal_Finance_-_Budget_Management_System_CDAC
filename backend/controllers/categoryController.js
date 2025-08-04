const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

exports.createCategory = asyncHandler(async (req, res) => {
    const { name, type } = req.body;
    const userid = req.user.id;

    if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Category name and type are required.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Type must be "income" or "expense".' });
    }

    const trimmedName = name.trim();

    try {
        const category = await Category.create({
            userid,
            name: trimmedName,
            type
        });
        res.status(201).json({ success: true, message: 'Category created successfully', category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A category with this name and type already exists for this user.' });
        }
        console.error("Error creating category:", error);
        res.status(500).json({ success: false, message: 'Server Error: Failed to create category.' });
    }
});

exports.getCategories = asyncHandler(async (req, res) => {
    const userid = req.user.id;
    const { type, name, sortBy, sortOrder } = req.query;

    const query = { userid };

    if (type) {
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid type filter.' });
        }
        query.type = type;
    }
    if (name) {
        query.name = { $regex: new RegExp(name, 'i') };
    }

    const sortOptions = {};
    if (sortBy) {
        const allowedSortFields = ['name', 'type'];
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({ success: false, message: `Invalid sortBy field: ${sortBy}.` });
        }
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortOptions.name = 1;
    }

    const categories = await Category.find(query).sort(sortOptions);
    res.status(200).json({ success: true, categories });
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    const { name, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
    }

    const updateFields = {};
    if (name !== undefined) {
        updateFields.name = name.trim();
        if (updateFields.name === '') return res.status(400).json({ success: false, message: 'Category name cannot be empty.' });
    }
    if (type !== undefined) {
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Type must be "income" or "expense".' });
        }
        updateFields.type = type;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    try {
        const category = await Category.findOneAndUpdate(
            { _id: id, userid },
            updateFields,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found or does not belong to this user.' });
        }
        res.status(200).json({ success: true, message: 'Category updated successfully', category });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A category with this name and type already exists for this user.' });
        }
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: 'Server Error: Failed to update category.' });
    }
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
    }

    try {
        const categoryToDelete = await Category.findOne({ _id: id, userid });
        if (!categoryToDelete) {
            return res.status(404).json({ success: false, message: 'Category not found or does not belong to this user.' });
        }

        const uncategorizedCategory = await Category.findOne({
            userid,
            name: `Uncategorized (${categoryToDelete.type.charAt(0).toUpperCase() + categoryToDelete.type.slice(1)})`,
            type: categoryToDelete.type
        });

        if (!uncategorizedCategory) {
            console.error(`CRITICAL: Uncategorized category for type ${categoryToDelete.type} not found for user ${userid}`);
            return res.status(500).json({ success: false, message: 'Internal server error: Default uncategorized category missing.' });
        }

        await Transaction.updateMany(
            { userid, category: id },
            { $set: { category: uncategorizedCategory._id } }
        );
        console.log(`Reassigned transactions from category ${categoryToDelete.name} to ${uncategorizedCategory.name}`);

        await Budget.updateMany(
            { userid, category: id },
            { $set: { category: uncategorizedCategory._id } }
        );
        console.log(`Reassigned budgets from category ${categoryToDelete.name} to ${uncategorizedCategory.name}`);

        const deletedCategory = await Category.findOneAndDelete({ _id: id, userid });

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found or does not belong to this user.' });
        }

        res.status(200).json({ success: true, message: 'Category deleted successfully and associated data reassigned.' });

    } catch (error) {
        console.error("Error while deleting category and reassigning:", error);
        res.status(500).json({ success: false, message: "Error while deleting category." });
    }
});