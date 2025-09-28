import nodemailer from "nodemailer";

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  console.log("✅ Ethereal account created:");
  console.log(testAccount);
}

createTestAccount();
