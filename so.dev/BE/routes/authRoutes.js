import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/authController.js';



const router = express.Router();


router.route('/reset-password')
  .post(requestPasswordReset);

router.route('/new-password/:token')
  .post(resetPassword); // Update password


module.exports = router;
