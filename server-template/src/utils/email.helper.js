import Brevo from "@getbrevo/brevo";

const sendMail = async (options) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.message;
    sendSmtpEmail.sender = {
      name: process.env.SMTP_NAME,
      email: process.env.SMTP_USER,
    };
    sendSmtpEmail.to = [{ email: options.email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

export default sendMail;
