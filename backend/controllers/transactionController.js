const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

exports.createTransaction = asyncHandler(async (req, res) => {
    const { type, amount, category, description, date, recurring, frequency, nextOccurrenceDate, recurrenceEndDate, isGenerated } = req.body;
    const userid = req.user.id;

    if (!amount || !type || !category || !date) {
        return res.status(400).json({ success: false, message: 'All required fields (amount, type, category, date) must be provided.' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Transaction type must be "income" or "expense".' });
    }
    if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format.' });
    }

    const categoryDoc = await Category.findOne({ _id: category, userid, type: type });
    if (!categoryDoc) {
        return res.status(400).json({
            success: false,
            message: 'Category not found, does not belong to this user, or its type does not match the transaction type.'
        });
    }

    const transaction = await Transaction.create({
        userid,
        type,
        amount,
        category,
        description: description ? description.trim() : '',
        date: parsedDate,
        recurring: recurring || false,
        frequency: frequency,
        nextOccurrenceDate: nextOccurrenceDate ? new Date(nextOccurrenceDate) : undefined,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
        isGenerated: isGenerated || false,
    });

    const populatedTransaction = await Transaction.findById(transaction._id).populate('category', 'name type');

    res.status(201).json({ success: true, message: 'Transaction created successfully', transaction: populatedTransaction });
});

exports.getTransactions = asyncHandler(async (req, res) => {
    const userid = req.user.id;
    const { type, category, startDate, endDate, sortBy, sortOrder } = req.query;

    const query = { userid };

    if (type) {
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid type filter.' });
        }
        query.type = type;
    }
    if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID filter.' });
        }
        query.category = category;
    }
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return res.status(400).json({ success: false, message: 'Invalid date range filter.' });
        }
        query.date = { $gte: start, $lte: end };
    } else if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid start date format.' });
        }
        query.date = { $gte: start };
    } else if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid end date format.' });
        }
        query.date = { $lte: end };
    }

    const sortOptions = {};
    if (sortBy) {
        const allowedSortFields = ['date', 'amount', 'type'];
        if (!allowedSortFields.includes(sortBy)) {
            return res.status(400).json({ success: false, message: `Invalid sortBy field: ${sortBy}.` });
        }
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
        sortOptions.date = -1;
    }

    const transactions = await Transaction.find(query)
        .populate('category', 'name type')
        .sort(sortOptions);

    res.status(200).json({ success: true, transactions });
});

exports.updateTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    const updateFields = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid transaction ID format.' });
    }

    const existingTransaction = await Transaction.findOne({ _id: id, userid });
    if (!existingTransaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found or does not belong to this user.' });
    }

    const transactionTypeForCategoryValidation = updateFields.type || existingTransaction.type;

    if (updateFields.type !== undefined) {
        if (!['income', 'expense'].includes(updateFields.type)) {
            return res.status(400).json({ success: false, message: 'Transaction type must be "income" or "expense".' });
        }
    }
    if (updateFields.amount !== undefined) {
        if (typeof updateFields.amount !== 'number' || updateFields.amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
        }
    }
    if (updateFields.category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(updateFields.category)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
        }
        const categoryDoc = await Category.findOne({
            _id: updateFields.category,
            userid,
            type: transactionTypeForCategoryValidation
        });
        if (!categoryDoc) {
            return res.status(400).json({
                success: false,
                message: 'New category not found, does not belong to this user, or its type does not match the transaction type.'
            });
        }
    }
    if (updateFields.date !== undefined) {
        const parsedDate = new Date(updateFields.date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format for update.' });
        }
        updateFields.date = parsedDate;
    }

    const transaction = await Transaction.findByIdAndUpdate(
        { _id: id, userid },
        updateFields,
        { new: true, runValidators: true }
    ).populate('category', 'name type');

    if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found or does not belong to this user.' });
    }

    res.status(200).json({ success: true, message: 'Transaction updated successfully', transaction });
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid transaction ID format.' });
    }

    const transaction = await Transaction.findOneAndDelete({ _id: id, userid });

    if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found or does not belong to this user.' });
    }

    res.status(200).json({ success: true, message: 'Transaction deleted successfully.' });
});

exports.getChartData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    let groupByFormat;
    let matchDateRange;
    let barLabels = [];
    let incomeData = [];
    let expenseData = [];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    if (period === 'month') {
        const targetYear = parseInt(year);
        if (isNaN(targetYear) || targetYear < 2000 || targetYear > currentYear + 10) {
            return res.status(400).json({ success: false, message: "Invalid year for monthly chart data." });
        }
        groupByFormat = { $month: "$date" };
        matchDateRange = {
            $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`)
        };
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        barLabels = monthNames;
        incomeData = new Array(12).fill(0);
        expenseData = new Array(12).fill(0);

    } else if (period === 'year') {
        groupByFormat = { $year: "$date" };
        const numYears = 5;
        matchDateRange = { $gte: new Date(`${currentYear - numYears + 1}-01-01T00:00:00.000Z`) };
    } else {
        return res.status(400).json({ success: false, message: "Invalid period for chart data. Use 'month' or 'year'." });
    }

    const barChartPipeline = [
        {
            $match: {
                userid: new mongoose.Types.ObjectId(userId),
                date: matchDateRange
            }
        },
        {
            $group: {
                _id: groupByFormat,
                totalIncome: {
                    $sum: { $cond: { if: { $eq: ["$type", "income"] }, then: "$amount", else: 0 } }
                },
                totalExpense: {
                    $sum: { $cond: { if: { $eq: ["$type", "expense"] }, then: "$amount", else: 0 } }
                }
            }
        },
        { $sort: { "_id": 1 } },
        { $project: { _id: 0, period: "$_id", totalIncome: 1, totalExpense: 1 } }
    ];
    const barChartResults = await Transaction.aggregate(barChartPipeline);

    if (period === 'month') {
        barChartResults.forEach(item => {
            const monthIndex = item.period - 1;
            incomeData[monthIndex] = item.totalIncome;
            expenseData[monthIndex] = item.totalExpense;
        });
    } else if (period === 'year') {
        barChartResults.forEach(item => {
            barLabels.push(item.period.toString());
            incomeData.push(item.totalIncome);
            expenseData.push(item.totalExpense);
        });
    }

    const barChartFormattedData = {
        labels: barLabels,
        datasets: [
            { label: "Income", data: incomeData, backgroundColor: "rgba(75, 192, 192, 0.6)" },
            { label: "Expense", data: expenseData, backgroundColor: "rgba(255, 99, 132, 0.6)" },
        ],
    };


    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const doughNutChartPipeline = [
        {
            $match: {
                userid: new mongoose.Types.ObjectId(userId),
                type: 'expense',
                category: { $ne: null },
                date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
            }
        },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        { $unwind: '$categoryDetails' },
        { $project: { _id: 0, categoryName: "$categoryDetails.name", totalAmount: 1 } }
    ];
    const doughNutChartResults = await Transaction.aggregate(doughNutChartPipeline);

    const doughnutLabels = doughNutChartResults.map(item => item.categoryName);
    const doughnutData = doughNutChartResults.map(item => item.totalAmount);
    const defaultColors = [
        "rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(255, 159, 64, 0.6)",
        "rgba(199, 199, 199, 0.6)", "rgba(83, 109, 254, 0.6)", "rgba(231, 233, 237, 0.6)",
        "rgba(100, 250, 150, 0.6)", "rgba(200, 100, 50, 0.6)"
    ];
    const doughnutChartFormattedData = {
        labels: doughnutLabels,
        datasets: [{
            label: "Expenses by Category",
            data: doughnutData,
            backgroundColor: defaultColors.slice(0, doughnutLabels.length),
            hoverOffset: 4
        }]
    };

    const lineChartPipeline = [
        {
            $match: {
                userid: new mongoose.Types.ObjectId(userId),
                type: 'income',
                category: { $ne: null },
                date: matchDateRange
            }
        },
        { $group: { _id: groupByFormat, totalIncome: { $sum: "$amount" } } },
        { $sort: { "_id": 1 } },
        { $project: { _id: 0, period: "$_id", totalIncome: 1 } }
    ];
    const lineChartResults = await Transaction.aggregate(lineChartPipeline);

    const lineLabels = barLabels;
    const lineIncomeData = new Array(lineLabels.length).fill(0);

    if (period === 'month') {
        lineChartResults.forEach(item => {
            const monthIndex = item.period - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                lineIncomeData[monthIndex] = item.totalIncome;
            }
        });
    } else if (period === 'year') {
        const yearlyIncomeMap = new Map(lineChartResults.map(item => [item.period.toString(), item.totalIncome]));
        lineLabels.forEach((label, index) => {
            lineIncomeData[index] = yearlyIncomeMap.get(label) || 0;
        });
    }

    const lineChartFormattedData = {
        labels: lineLabels,
        datasets: [{
            label: "Income Trend",
            data: lineIncomeData,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
            tension: 0.3
        }]
    };

    let totalIncomeCurrentMonth = 0;
    let totalExpenseCurrentMonth = 0;
    let netSavingsCurrentMonth = 0;

    const transactionsCurrentMonth = await Transaction.find({
        userid: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    });

    transactionsCurrentMonth.forEach(t => {
        if (t.type === 'income') {
            totalIncomeCurrentMonth += t.amount;
        } else if (t.type === 'expense') {
            totalExpenseCurrentMonth += t.amount;
        }
    });
    netSavingsCurrentMonth = totalIncomeCurrentMonth - totalExpenseCurrentMonth;


    res.status(200).json({
        success: true,
        message: 'Chart data and summary fetched successfully',
        barChartData: barChartFormattedData,
        doughnutChartData: doughnutChartFormattedData,
        lineChartData: lineChartFormattedData,
        summary: {
            totalIncome: totalIncomeCurrentMonth,
            totalExpense: totalExpenseCurrentMonth,
            netSavings: netSavingsCurrentMonth,
            month: currentMonth + 1,
            year: currentYear
        }
    });
});