import "dotenv/config";
import nodemailer from "nodemailer";

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log("MAILER user:", user);
console.log("MAILER pass length:", pass?.length);

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

//verification mail send function
export async function sendVerifyEmail(to, verifyUrl) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Please verify your email by clicking the button below: (Link expire with in 10 minutes)</p>
      <a href="${verifyUrl}"
         style="display:inline-block;padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px">
         Verify Email
      </a>
      <p>If you didn’t request this, ignore this email.</p><br/>
      <p>(Kindly refrain from responding to this automated system-generated email. Your cooperation is appreciated.)</p>
    `,
  });
}
