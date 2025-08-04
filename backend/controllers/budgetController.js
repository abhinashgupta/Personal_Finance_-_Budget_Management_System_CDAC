const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

exports.createBudget = asyncHandler(async (req, res) => {
    const { category, limit, period, startdate, enddate } = req.body;
    const userid = req.user.id;

    if (!category || !limit || !period || !startdate || !enddate) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
    }
    if (typeof limit !== 'number' || limit <= 0) {
        return res.status(400).json({ success: false, message: 'Limit must be a positive number.' });
    }
    if (!['monthly', 'weekly', 'yearly'].includes(period)) {
        return res.status(400).json({ success: false, message: 'Period must be "monthly", "weekly", or "yearly".' });
    }

    const parsedStartDate = new Date(startdate);
    const parsedEndDate = new Date(enddate);
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid startdate or enddate format.' });
    }
    if (parsedStartDate >= parsedEndDate) {
        return res.status(400).json({ success: false, message: 'Start date must be before end date.' });
    }

    const categoryExists = await Category.findOne({ _id: category, userid });
    if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Invalid category or category not found for this user.' });
    }

    const budget = await Budget.create({
        userid,
        category,
        limit,
        period,
        startdate: parsedStartDate,
        enddate: parsedEndDate
    });

    const populatedBudget = await Budget.findById(budget._id).populate('category', 'name type');

    res.status(201).json({ success: true, message: 'Budget created successfully', budget: populatedBudget });
});

exports.getBudgets = asyncHandler(async (req, res) => {
    const userid = req.user.id;
    const { category, period, startDate, endDate, sortBy, sortOrder } = req.query;

    const query = { userid };

    if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID filter.' });
        }
        query.category = category;
    }
    if (period) {
        if (!['monthly', 'weekly', 'yearly'].includes(period)) {
            return res.status(400).json({ success: false, message: 'Invalid period filter.' });
        }
        query.period = period;
    }
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return res.status(400).json({ success: false, message: 'Invalid date range filter.' });
        }
        query.startdate = { $gte: start };
        query.enddate = { $lte: end };
    } else if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid start date format.' });
        }
        query.startdate = { $gte: start };
    } else if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid end date format.' });
        }
        query.enddate = { $lte: end };
    }

    const sortOptions = {};
    if (sortBy) {
        const allowedSortFields = ['startdate', 'limit', 'period'];
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({ success: false, message: `Invalid sortBy field: ${sortBy}.` });
        }
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortOptions.startdate = -1;
    }

    let budgets = await Budget.find(query)
        .populate('category', 'name type')
        .sort(sortOptions);

    const budgetsWithActuals = await Promise.all(budgets.map(async (budget) => {
        let actualSpent = 0;
        let remaining = budget.limit;
        let isOverBudget = false;

        if (budget.category && budget.category._id) {
            const transactionsForBudget = await Transaction.aggregate([
                {
                    $match: {
                        userid: new mongoose.Types.ObjectId(userid),
                        type: 'expense',
                        category: budget.category._id,
                        date: {
                            $gte: budget.startdate,
                            $lte: budget.enddate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: "$amount" }
                    }
                }
            ]);

            actualSpent = transactionsForBudget.length > 0 ? transactionsForBudget[0].totalSpent : 0;
            remaining = budget.limit - actualSpent;
            isOverBudget = remaining < 0;
        } else {
            console.warn(`Budget ID ${budget._id} has a null/invalid category after populate. Cannot calculate actualSpent.`);
        }

        return {
            ...budget.toObject(),
            actualSpent,
            remaining,
            isOverBudget
        };
    }));

    res.status(200).json({ success: true, budgets: budgetsWithActuals });
});

exports.updateBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    const updateFields = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid budget ID format.' });
    }

    const existingBudget = await Budget.findOne({ _id: id, userid });
    if (!existingBudget) {
        return res.status(404).json({ success: false, message: 'Budget not found or does not belong to this user.' });
    }

    if (updateFields.category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(updateFields.category)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
        }
        const categoryExists = await Category.findOne({ _id: updateFields.category, userid });
        if (!categoryExists) {
            return res.status(400).json({ success: false, message: 'New category not found or does not belong to this user.' });
        }
    }
    if (updateFields.limit !== undefined) {
        if (typeof updateFields.limit !== 'number' || updateFields.limit <= 0) {
            return res.status(400).json({ success: false, message: 'Limit must be a positive number.' });
        }
    }
    if (updateFields.period !== undefined) {
        if (!['monthly', 'weekly', 'yearly'].includes(updateFields.period)) {
            return res.status(400).json({ success: false, message: 'Period must be "monthly", "weekly", or "yearly".' });
        }
    }

    let updatedStartDate = updateFields.startdate ? new Date(updateFields.startdate) : existingBudget.startdate;
    let updatedEndDate = updateFields.enddate ? new Date(updateFields.enddate) : existingBudget.enddate;

    if (isNaN(updatedStartDate.getTime()) || isNaN(updatedEndDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format for update.' });
    }
    if (updatedStartDate >= updatedEndDate) {
        return res.status(400).json({ success: false, message: 'Start date must be before end date.' });
    }

    if (updateFields.startdate !== undefined) updateFields.startdate = updatedStartDate;
    if (updateFields.enddate !== undefined) updateFields.enddate = updatedEndDate;

    const budget = await Budget.findOneAndUpdate(
        { _id: id, userid },
        updateFields,
        { new: true, runValidators: true }
    ).populate('category', 'name type');

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found or does not belong to this user.' });
    }

    res.status(200).json({ success: true, message: 'Budget updated successfully', budget });
});

exports.deleteBudget = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid budget ID format.' });
    }

    const budget = await Budget.findOneAndDelete({ _id: id, userid });

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found or does not belong to this user.' });
    }

    res.status(200).json({ success: true, message: 'Budget deleted successfully.' });
});