import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const buildVerificationEmail = ({ fullName, verificationUrl }) => {
  return {
    subject: 'Verify your MoneyBridge account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Verify your MoneyBridge account</h2>
        <p>Hello ${fullName},</p>
        <p>Thanks for signing up. Please verify your SECE email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#0d6efd;color:#ffffff;text-decoration:none;border-radius:6px;">
            Verify email
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
    text: `Hello ${fullName}, verify your MoneyBridge account here: ${verificationUrl}. This link expires in 24 hours.`,
  };
};

export const sendVerificationEmail = async ({ to, fullName, token }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email/${token}`;
  const email = buildVerificationEmail({ fullName, verificationUrl });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
};
