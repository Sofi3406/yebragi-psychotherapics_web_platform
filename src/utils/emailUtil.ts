// src/utils/emailUtil.ts
import nodemailer from "nodemailer";
import { logger } from "./logger";

/**
 * Sends an email (works with both test Ethereal and real SMTP)
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    // 1️⃣ Use real credentials if available, else create Ethereal test account
    let transporter;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // 2️⃣ Send the email
    const info = await transporter.sendMail({
      from: `"Yebragi Psychotherapics" <${process.env.EMAIL_USER || "no-reply@yebragi.com"}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`📧 Email sent to ${to}`, { messageId: info.messageId }, "EMAIL");

    // For Ethereal preview
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`🔗 Preview Email: ${previewUrl}`, {}, "EMAIL");
    }
  } catch (error: any) {
    logger.error("❌ Failed to send email", { error: error.message }, "EMAIL");
    throw new Error("Email sending failed");
  }
}

/**
 * Sends an OTP email to the user
 */
export async function sendOTPEmail(to: string, otp: string) {
  const subject = "Your OTP Verification Code";
  const text = `Your OTP is ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color:#4CAF50;">Email Verification</h2>
      <p>Dear user,</p>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="background:#f4f4f4; padding:10px 20px; border-radius:8px; display:inline-block;">
        ${otp}
      </h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <br/>
      <p>– Yebragi Psychotherapics Team</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
}
