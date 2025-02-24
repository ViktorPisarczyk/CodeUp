const express = require('express');
const {requestPasswordReset, resetPassword} = require('../controllers/authController.js');


const router = express.Router();


router.post('/reset-password', requestPasswordReset);  // Send reset email
router.post('/new-password/:token', resetPassword);  // Update password


module.exports = router;
