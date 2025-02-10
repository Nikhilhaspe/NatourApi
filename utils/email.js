const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = async (options) => {
  // 1. Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: 'Nikhl Haspe <hello@nikhil.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send Mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
