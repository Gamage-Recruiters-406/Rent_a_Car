import "dotenv/config";
import nodemailer from "nodemailer";

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log("MAILER user:", user);
console.log("MAILER pass length:", pass?.length);

 //Single transporter for entire project
 
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

 //Common email template

const generateEmailTemplate = ({ title, message, details }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
  <h2 style="color:#0d6efd;text-align:center">${title}</h2>
  <p>${message}</p>
  ${details ? `<hr/><div>${details}</div>` : ""}
  <hr/>
  <p style="text-align:center;font-size:14px">
    Thank you for using <strong>Rent My Car</strong>
  </p>
</div>
`;

 //EMAIL VERIFICATION 

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
      <p>If you didn’t request this, ignore this email.</p>
      <p>Thank you for your understanding,<br/>
      Rent My Car Team</p><br/>
      <p>(Kindly refrain from responding to this automated system-generated email. Your cooperation is appreciated.)</p>
    `,
  });
}

//common email for suspended accounts.
export async function suspendOwner(to, name) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Suspension Notice.",
    html: `
    <p>Hi ${name},</p>
    <p>We're writing to inform you that your <b>Rent My Car</b> account has been <b>suspended</b> due to a <b>violation of our Terms and Conditions.</b></p>
    <p>During the suspension period, you won't be able to access certain features of the platform.</p>
    <p><b>What happens next</b></p>
    <ul>
      <li>Your account will remain suspended for <b>1 week.</b></li>
      <li>After <b>1 week,</b> you can verify your account again and request reactivation through the app/website.</li>
    </ul>
    <p>If you'd like to review our rules, please check the Terms and Conditions within the Rent My Car platform.</p>
    <p>Thank you for your understanding,<br/>
    Rent My Car Team</p><br/>
    <p>(Kindly refrain from responding to this automated system-generated email. Your cooperation is appreciated.)</p>
    `
  })
  
}

/**
 * BOOKING EMAIL
 * type = approved | rejected
 */
export async function sendBookingEmail({ type, booking, customer, owner, vehicle }) {
  const title =
    type === "approved"
      ? "Booking Approved – Rent My Car"
      : "Booking Rejected – Rent My Car";

  const message =
    type === "approved"
      ? `Dear ${customer.first_name}, your booking has been approved.`
      : `Dear ${customer.first_name}, your booking has been rejected.`;

  const details = `
    <h3>Booking Details</h3>
    <p><strong>Booking ID:</strong> ${booking._id}</p>
    <p><strong>Status:</strong> ${booking.status}</p>
    <p><strong>Start:</strong> ${booking.startingDate.toDateString()}</p>
    <p><strong>End:</strong> ${booking.endDate.toDateString()}</p>

    <h3>Vehicle</h3>
    <p>${vehicle.title} - ${vehicle.model} (${vehicle.year})</p>
    <p>${vehicle.numberPlate}</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: customer.email,
    subject: title,
    html: generateEmailTemplate({ title, message, details }),
  });
}

/**
 * VEHICLE EMAIL
 * type = approved | rejected
 */
export async function sendVehicleEmail({ type, vehicle, owner }) {
  const title =
    type === "approved"
      ? "Vehicle Approved – Rent My Car"
      : "Vehicle Rejected – Rent My Car";

  const message =
    type === "approved"
      ? `Dear ${owner.first_name}, your vehicle has been approved.`
      : `Dear ${owner.first_name}, your vehicle has been rejected.`;

  const details = `
    <h3>Vehicle Details</h3>
    <p>${vehicle.title}</p>
    <p>${vehicle.model} (${vehicle.year})</p>
    <p>${vehicle.numberPlate}</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: owner.email,
    subject: title,
    html: generateEmailTemplate({ title, message, details }),
  });
}
