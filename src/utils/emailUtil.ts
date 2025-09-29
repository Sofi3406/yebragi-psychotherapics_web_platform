import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  // Create transporter (using Ethereal for dev)
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure, 
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Yebragi Psychotherapics" <no-reply@yebragi.com>',
    to,
    subject,
    text,
    html,
  });

  console.log("📧 Message sent: %s", info.messageId);
  console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
