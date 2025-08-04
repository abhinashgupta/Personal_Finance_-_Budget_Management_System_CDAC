const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const budgetContoller = require("../controllers/budgetController");

router.use(authMiddleware);

router.post("/", budgetContoller.createBudget);

router.get("/", budgetContoller.getBudgets);

router.put("/:id", budgetContoller.updateBudget);

router.delete("/:id", budgetContoller.deleteBudget);

module.exports = router;