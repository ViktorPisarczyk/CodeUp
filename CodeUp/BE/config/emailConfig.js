import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL, // replace with email
    pass: process.env.PASSWORD, // replace with password
  },
});
