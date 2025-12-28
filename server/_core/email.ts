import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Get email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || "AH Alpha";

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("[Email] SMTP credentials not configured. Email sending will be disabled.");
      return null;
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Send an email using Nodemailer.
 * Returns `true` if the email was sent successfully, `false` otherwise.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, body } = payload;

  if (!validateEmail(to)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email address",
    });
  }

  if (!subject || subject.trim().length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email subject is required",
    });
  }

  if (!body || body.trim().length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email body is required",
    });
  }

  const transport = getTransporter();
  if (!transport) {
    console.warn("[Email] Skipping email send - transporter not configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });

    console.log(`[Email] Successfully sent email to ${to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

/**
 * Send a verification code email with HTML template
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[Email] Skipping email send - transporter not configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: "رمز التحقق - AH Alpha",
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; text-align: center; }
            .code-box { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .message { color: #666; line-height: 1.6; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 14px; }
            .warning { color: #e74c3c; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h1>🔐 رمز التحقق</h1></div>
            <div class="content">
              <p class="message">مرحباً بك في <strong>AH Alpha</strong>!<br>استخدم رمز التحقق التالي لإكمال عملية التسجيل:</p>
              <div class="code-box"><div class="code">${code}</div></div>
              <p class="message">هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.</p>
              <p class="warning">⚠️ إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
            </div>
            <div class="footer">
              <p>© 2025 AH Alpha - أكبر سوق إلكتروني في العراق</p>
              <p>هذه رسالة تلقائية، الرجاء عدم الرد عليها</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`[Email] Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return false;
  }
}
