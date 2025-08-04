const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const categoryContoller = require('../controllers/categoryController');

router.use(authMiddleware);

router.post("/", categoryContoller.createCategory);

router.get("/", categoryContoller.getCategories);

router.put("/:id", categoryContoller.updateCategory);

router.delete("/:id", categoryContoller.deleteCategory);

module.exports = router;