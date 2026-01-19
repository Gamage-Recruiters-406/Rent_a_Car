import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true only for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerifyEmail(to, verifyUrl) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${verifyUrl}"
         style="display:inline-block;padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px">
         Verify Email
      </a>
      <p>If you didn’t request this, ignore this email.</p>
    `,
  });
}
