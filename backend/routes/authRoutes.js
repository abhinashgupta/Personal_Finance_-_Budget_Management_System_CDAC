const express = require("express");
const router = express.Router();
const authContoller = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");


router.use(authMiddleware);

router.post('/register', authContoller.register);
router.post('/login', authContoller.login);

router.post("/send-verification-otp", authContoller.sendVerificationOtp);
router.post("/verify-email-otp", authContoller.verifyEmailOtp);
router.post("/forgot-password", authContoller.forgotPassword);
router.post("/reset-password/:token", authContoller.resetPassword);

router.post("/logout", authMiddleware, authContoller.logout);
router.get("/users", authMiddleware, authContoller.getAllUsers);

module.exports = router;