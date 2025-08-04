const nodemailer = require("nodemailer");
require("dotenv").config({
  path: require("path").resolve(__dirname, "..", ".env"),
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} with subject: "${subject}"`);
  } catch (error) {
    console.error(
      `Error sending email to ${to} (Subject: "${subject}"):`,
      error
    );
    throw new Error(
      "Failed to send email. Please check SMTP settings and network."
    );
  }
};

module.exports = { sendEmail };
