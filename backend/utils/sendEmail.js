import nodemailer from 'nodemailer';

let cachedTransporter;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransporter;
};

/**
 * Send an HTML email. Failures are logged but never throw, so email
 * problems can't break the core request flow (e.g. placing an order).
 *
 * @param {{to: string, subject: string, html: string, text?: string}} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('✉️  SMTP not configured — skipping email:', subject);
      return;
    }
    const transporter = getTransporter();
    const from = `"${process.env.EMAIL_FROM_NAME || 'Zyvora'}" <${
      process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER
    }>`;

    await transporter.sendMail({ from, to, subject, html, text });
    console.log(`✉️  Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`✉️  Email failed (${subject}):`, error.message);
  }
};

export default sendEmail;
