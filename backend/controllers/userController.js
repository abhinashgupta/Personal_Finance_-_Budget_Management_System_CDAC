const User = require('../models/User');
const mongoose = require('mongoose');

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

exports.getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { firstname, lastname, email, avatar } = req.body;

    const updateFields = {};

    if (firstname !== undefined) updateFields.firstname = firstname.trim();
    if (lastname !== undefined) updateFields.lastname = lastname.trim();

    if (email !== undefined) {
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        const existingUserWithEmail = await User.findOne({ email: trimmedEmail });
        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
            return res.status(409).json({ success: false, message: 'Email already in use by another account' });
        }
        updateFields.email = trimmedEmail;
    }

    if (avatar !== undefined) {
        updateFields.avatar = avatar;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
});