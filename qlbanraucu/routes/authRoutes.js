const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Định nghĩa đường dẫn
router.post('/dang-ky', authController.register);
router.post('/dang-nhap', authController.login);

module.exports = router;