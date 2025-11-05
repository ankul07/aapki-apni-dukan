import nodemailer from "nodemailer";

const sendMail = async (options) => {
  // Create a transporter using SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // SMTP server host
    port: process.env.SMTP_PORT, // SMTP server port
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL, // SMTP authentication email
      pass: process.env.SMTP_PASSWORD, // SMTP authentication password
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.SMTP_MAIL, // Sender's email
    to: options.email, // Recipient's email
    subject: options.subject, // Email subject
    html: options.message, // Email body in plain text
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendMail;
