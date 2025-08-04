const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const transactionContoller = require('../controllers/transactionController');

router.use(authMiddleware);

router.post("/", transactionContoller.createTransaction);

router.get("/", transactionContoller.getTransactions);

router.put("/:id", transactionContoller.updateTransaction);

router.delete("/:id", transactionContoller.deleteTransaction);

router.get("/charts-data", transactionContoller.getChartData);

module.exports = router;