const User = require("../models/User");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/emailService"); // For sending OTP and reset links
const crypto = require("crypto"); // For generating password reset tokens

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // --- (Validation remains the same) ---
  if (!firstname || !lastname || !email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  // ... other validation ...

  const trimmedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: trimmedEmail });
  if (existingUser) {
    // Handle cases where user exists but is not verified
    if (existingUser.isVerified) {
      return res
        .status(409)
        .json({
          message: "User already exists with this email.",
          success: false,
        });
    } else {
      return res
        .status(409)
        .json({
          message: "User exists but is not verified. Please verify your email.",
          success: false,
        });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    firstname: firstname.trim(),
    lastname: lastname.trim(),
    email: trimmedEmail,
    password: hashedPassword,
    isVerified: false, // User is not verified by default
  });

  // --- (Default category creation remains the same) ---
  // ...

  // --- NEW: OTP Generation and Email Sending ---
  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  newUser.otp = otp;
  newUser.otpExpires = otpExpires;
  await newUser.save();

  const emailContent = `<h1>Email Verification OTP</h1><p>Your OTP for FinTrack is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`;

  try {
    await sendEmail(
      newUser.email,
      "FinTrack Email Verification OTP",
      emailContent
    );
    res
      .status(201)
      .json({
        success: true,
        message:
          "User registered. An OTP has been sent to your email for verification.",
      });
  } catch (error) {
    console.error("Registration OTP email sending failed:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "User registered, but failed to send verification email.",
      });
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim().toLowerCase();
  const userExist = await User.findOne({ email: trimmedEmail });

  if (!userExist) {
    return res
      .status(404)
      .json({ message: "User not found with this email", success: false });
  }

  // --- NEW: Check if user's email is verified ---
  if (!userExist.isVerified) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Email not verified. Please verify your email to log in.",
      });
  }

  const isPasswordMatched = await bcrypt.compare(password, userExist.password);
  if (!isPasswordMatched) {
    return res
      .status(401)
      .json({ message: "Invalid Credentials", success: false });
  }

  const token = jwt.sign(
    { id: userExist._id, email: userExist.email },
    process.env.jwt_secret_key,
    { expiresIn: "1h" }
  );

 return res.status(200).json({
   message: "User Logged In Successfully",
   success: true,
   token: token, // This is correct
   user: {
     id: userExist._id,
     firstname: userExist.firstname,
     lastname: userExist.lastname,
     email: userExist.email,
     avatar: userExist.avatar,
   },
 });
});

exports.logout = (req, res) => {
  return res.status(200).json({
    message: "User logged out successfully",
    success: true,
  });
};

// --- NEW: Function to verify the OTP ---
exports.sendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ success: false, message: "Email is already verified." });
  }

  const otp = generateOTP();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  const emailContent = `
        <h1>Email Verification OTP</h1>
        <p>You requested a new OTP for FinTrack email verification.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h2 style="color: #4CAF50; font-size: 24px; font-weight: bold;">${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
        <p>Please enter this OTP in the verification page to activate your account.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

  try {
    await sendEmail(
      user.email,
      "FinTrack Email Verification OTP (Resend)",
      emailContent
    );
    res
      .status(200)
      .json({ success: true, message: "New OTP sent to your email." });
  } catch (error) {
    console.error("Resend OTP email sending failed:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
  }
});


exports.verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ success: false, message: "Email is already verified." });
  }

  if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP." });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res
    .status(200)
    .json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
});

// --- NEW: Function for "Forgot Password" ---
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const emailContent = `<p>Please click the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`;

  try {
    await sendEmail(user.email, "FinTrack Password Reset", emailContent);
    res
      .status(200)
      .json({
        success: true,
        message: "Password reset link sent to your email.",
      });
  } catch (error) {
    // ... error handling
  }
});

// --- NEW: Function to reset the password with a token ---
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password has been successfully reset." });
});



exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({
    success: true,
    message: "All users fetched successfully",
    users,
  });
});
