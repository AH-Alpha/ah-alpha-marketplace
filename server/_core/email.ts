import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendEmail",
    normalizedBase
  ).toString();
};

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Send an email using the Manus Email Service.
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

  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service URL is not configured",
    });
  }

  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service API key is not configured",
    });
  }

  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to,
        subject,
        body,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Successfully sent email to ${to}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error calling email service:", error);
    return false;
  }
}

/**
 * Send a verification code email
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const subject = "كود التحقق - AH Alpha Marketplace";
  const body = `
مرحباً!

شكراً لتسجيلك في AH Alpha Marketplace.

كود التحقق الخاص بك هو: ${code}

الكود صالح لمدة 15 دقيقة فقط.

إذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة.

مع أطيب التحيات،
فريق AH Alpha
  `.trim();

  return sendEmail({ to: email, subject, body });
}
