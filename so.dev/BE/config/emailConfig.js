const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
   service: "Gmail",
   auth: {
       user: process.env.EMAIL, // replace with email
       pass: process.env.PASSWORD // replace with password
   },
});


module.exports = transporter;
