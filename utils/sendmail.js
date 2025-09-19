import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, attachments }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"My Store" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    attachments,
  });
};
