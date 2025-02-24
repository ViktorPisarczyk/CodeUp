const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');
const transporter = require('../config/emailConfig.js');


// Request password reset
exports.requestPasswordReset = async (req, res) => {
 const {email} = req.body;


 try {
   const user = await User.findOne({email});
   if (!user) {
     return res.status(404).json({message: 'User not found'});
   }
   // generate a secure token
   const resetToken = crypto.randomBytes(32).toString('hex');
   user.resetToken = resetToken;
   user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
   await user.save();


   // Email options
   const mailOptions = {
     from: "your-email@gmail.com",
     to: user.email,
     subject: "Password Reset Request",
     text: `Use this token to reset your password: ${resetToken}`,
   };


   await transporter.sendMail(mailOptions);


   res.status(200).json({message: 'Password reset email sent'});
 } catch (error) {
   res.status(500).json({message: 'Error requesting password reset'});
 }
};


// Reset password
exports.resetPassword = async (req, res) => {
 const {email, token, newPassword} = req.body;


 try {
   const user = await User.findOne({
       resetToken: token,
       resetTokenExpiration: {$gt: Date.now()},
   });
   if (!user) {
     return res.status(404).json({message: 'Invalid or expired token'});
   }


   // Hash new password
   const hashedPassword = await bcrypt.hash(newPassword, 12);
   user.password = hashedPassword;
   user.resetToken = undefined;
   user.resetTokenExpiration = undefined;
   await user.save();


   res.json({message: 'Password reset successful'});
   } catch (error) {  
       res.status(500).json({message: 'Error resetting password'});
   }
};

