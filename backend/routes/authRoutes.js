const express = require("express");
const router = express.Router();
const authContoller = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/register', authContoller.register);
router.post('/login', authContoller.login);

router.post("/logout", authMiddleware, authContoller.logout);

router.get("/users", authMiddleware, authContoller.getAllUsers);

module.exports = router;