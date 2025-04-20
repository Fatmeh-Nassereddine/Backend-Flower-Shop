const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.HOST,       // Using the value from your .env file
  port: process.env.MAILTRAP_PORT,       // Same here, using the .env port
  auth: {
    user: process.env.MAILTRAP_USER,  // Correct use of the environment variable
    pass: process.env.MAILTRAP_PASS   // Correct use of the environment variable
  }
});

const sendContactNotification = async ({ first_name, email, subject, message }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Website Contact Form" <no-reply@example.com>',
      to: 'admin@example.com', // change this to a real email for production
      subject: `New contact form submission: ${subject || 'No Subject'}`,
      text: `
You've received a new contact form submission:

Name: ${first_name}
Email: ${email}
Subject: ${subject || 'N/A'}
Message:
${message}
      `
    });

    console.log('Notification email sent to admin:', info.messageId);
  } catch (error) {
    console.error('Failed to send notification email:', error.message);
  }
};

module.exports = { sendContactNotification };

