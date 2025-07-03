const authContoller = require("../controllers/authContoller");
const express = require("express");
const router = express.Router();

router.post('/register', authContoller.register);
router.post('/login', authContoller.login);


module.exports = router;