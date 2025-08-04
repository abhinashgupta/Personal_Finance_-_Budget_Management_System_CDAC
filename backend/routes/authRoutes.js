const express = require("express");
const router = express.Router();
const authContoller = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/register', authContoller.register);
router.post('/login', authContoller.login);

router.post("/send-verification-otp", authController.sendVerificationOtp);
router.post("/verify-email-otp", authController.verifyEmailOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

router.post("/logout", authMiddleware, authContoller.logout);
router.get("/users", authMiddleware, authContoller.getAllUsers);

module.exports = router;