const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userContoller = require('../controllers/userController');

router.use(authMiddleware);

router.get('/profile', userContoller.getProfile);

router.put('/profile', userContoller.updateProfile);

module.exports = router;