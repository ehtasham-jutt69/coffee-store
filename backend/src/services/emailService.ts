import nodemailer from 'nodemailer';

const SENDER_EMAIL = process.env.EMAIL_USER || 'instahelper7109648@gmail.com';
const SENDER_NAME = process.env.EMAIL_FROM_NAME || 'Kavah & Co. Artisanal Roasters';
const FROM_HEADER = `"${SENDER_NAME}" <${SENDER_EMAIL}>`;

interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}

/**
 * Returns a configured nodemailer Transporter or null if credentials are not ready.
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const rawPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '').trim();

  if (!rawPass || rawPass === 'your_google_app_password_here' || rawPass === 'your_app_password') {
    return null;
  }

  // Custom SMTP (e.g., Brevo / Sendinblue)
  if (smtpHost || rawPass.startsWith('xsmtpsib-')) {
    const host = smtpHost || 'smtp-relay.brevo.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || 'instahelper7109648@gmail.com').trim();

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: rawPass
      }
    });
  }

  // Gmail SMTP
  const user = (process.env.EMAIL_USER || 'instahelper7109648@gmail.com').trim();
  const pass = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Checks if real email sending credentials are set in environment
 */
export function isEmailConfigured(): boolean {
  return createTransporter() !== null;
}

/**
 * Verify transporter on startup to provide immediate feedback in the console.
 */
export async function verifyEmailConfig(): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] 📧 Sender set to: ${SENDER_EMAIL}`);
    console.log(`[Email Service] ⚠️ EMAIL_PASS is not configured in backend/.env. Emails will be logged to the server terminal with preview tokens.`);
    console.log(`[Email Service] 💡 To send real emails from ${SENDER_EMAIL}, generate a 16-character Google App Password at: https://myaccount.google.com/apppasswords`);
    return;
  }

  try {
    await transporter.verify();
    console.log(`[Email Service] ✅ Successfully authenticated with Gmail SMTP! Emails will be sent from ${SENDER_EMAIL}.`);
  } catch (err: any) {
    console.warn(`[Email Service] ⚠️ Gmail SMTP authentication notice: ${err.message}`);
    console.warn(`[Email Service] 💡 Make sure you use a 16-character Google App Password (not your regular Gmail password).`);
  }
}

/**
 * Send Welcome Email upon new user signup
 */
export async function sendWelcomeEmail(toEmail: string, firstName?: string): Promise<EmailResult> {
  const recipientName = firstName && firstName.trim() ? firstName.trim() : 'Coffee Lover';
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const shopUrl = `${clientUrl}/shop`;
  const accountUrl = `${clientUrl}/account`;

  const subject = '☕ Welcome to Kavah & Co. Artisanal Roasters!';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kavah & Co.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0804; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ede3d8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f0804; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #1a0e08; border: 1px solid #3d2314; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #2b170c 0%, #150a04 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #3d2314;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="width: 48px; height: 48px; background: linear-gradient(135deg, #c5a880 0%, #8c6d3b 100%); border-radius: 50%; text-align: center; font-size: 24px; font-weight: bold; color: #1a0e08; line-height: 48px;">
                    K
                  </td>
                  <td style="padding-left: 14px; text-align: left;">
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 0.5px; color: #ffffff; font-family: Georgia, serif;">Kavah &amp; Co.</div>
                    <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c5a880;">Artisanal Roasters</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 26px; color: #ffffff; font-family: Georgia, serif; line-height: 1.3;">
                Welcome to the Family, ${recipientName}!
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #d6c6b4;">
                Thank you for creating your account with <strong>Kavah &amp; Co.</strong> We source single-origin harvests directly from sustainable family-owned estates around the world and roast in small batches for peak aromatic complexity.
              </p>

              <!-- Welcome Gift Voucher Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #23130a; border: 1px dashed #c5a880; border-radius: 12px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td align="center">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c5a880; font-weight: 600; display: block; margin-bottom: 6px;">
                      Your Welcome Gift • 10% Off
                    </span>
                    <div style="font-size: 26px; font-weight: bold; letter-spacing: 3px; color: #ffffff; font-family: monospace; background: #120904; display: inline-block; padding: 10px 24px; border-radius: 8px; border: 1px solid #3d2314; margin: 6px 0 8px 0;">
                      WELCOME10
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #a4917e;">
                      Apply this code at checkout to enjoy 10% off your entire first specialty roast order.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Highlights -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0 28px 0;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a160b;">
                    <span style="color: #c5a880; font-weight: bold; margin-right: 8px;">✦</span>
                    <strong style="color: #ffffff; font-size: 14px;">Fresh Roast-to-Order:</strong>
                    <span style="color: #b5a494; font-size: 14px;"> Beans are roasted daily and shipped at peak degassing window.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2a160b;">
                    <span style="color: #c5a880; font-weight: bold; margin-right: 8px;">✦</span>
                    <strong style="color: #ffffff; font-size: 14px;">Origin Transparency:</strong>
                    <span style="color: #b5a494; font-size: 14px;"> Full cupping notes, SCA ratings (86-91 pts), and producer stories.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #c5a880; font-weight: bold; margin-right: 8px;">✦</span>
                    <strong style="color: #ffffff; font-size: 14px;">Brew Guides &amp; Calculator:</strong>
                    <span style="color: #b5a494; font-size: 14px;"> Dial in your V60, Chemex, French Press, or 9-bar espresso.</span>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto 10px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%);">
                    <a href="${shopUrl}" target="_blank" style="font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 14px 32px; display: inline-block; border-radius: 12px; letter-spacing: 0.3px;">
                      Explore Our Specialty Roasts &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 14px;">
                <a href="${accountUrl}" target="_blank" style="font-size: 12px; color: #c5a880; text-decoration: underline;">
                  View &amp; Manage Your Roastery Account
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #120904; padding: 24px 30px; text-align: center; border-top: 1px solid #2a160b; font-size: 12px; color: #7e6e5f; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">
                Have questions or need bean recommendations? Reply directly to this email or reach us at
                <a href="mailto:${SENDER_EMAIL}" style="color: #c5a880; text-decoration: none;">${SENDER_EMAIL}</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #5a4e43;">
                &copy; ${new Date().getFullYear()} Kavah &amp; Co. Artisanal Roasters. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Welcome to Kavah & Co., ${recipientName}!

Thank you for creating an account with us. We source single-origin harvests directly from sustainable family-owned estates around the world and roast in small batches for peak aromatic complexity.

Your Welcome Gift: 10% Off
Use coupon code: WELCOME10 at checkout to enjoy 10% off your first specialty roast order.

Explore our collection: ${shopUrl}
Manage your account: ${accountUrl}

Need coffee recommendations or have any questions? Reach out to us directly at ${SENDER_EMAIL}.

Warm regards,
The Roastery Team at Kavah & Co.
  `.trim();

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[Email Service - Simulated Mode] WELCOME EMAIL`);
    console.log(`To: ${toEmail} (${recipientName})`);
    console.log(`From: ${FROM_HEADER}`);
    console.log(`Subject: ${subject}`);
    console.log(`Coupon: WELCOME10 (10% off)`);
    console.log(`Shop URL: ${shopUrl}`);
    console.log(`💡 To deliver real emails, set EMAIL_PASS in backend/.env`);
    console.log(`======================================================\n`);
    return { success: false, previewUrl: false, error: 'EMAIL_PASS is not configured in backend/.env' };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to: toEmail,
      subject,
      text,
      html
    });

    console.log(`[Email Service] ✅ Welcome email sent successfully to ${toEmail}! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Service] ❌ Failed to send welcome email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Password Reset Link Email
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  firstName: string | undefined,
  resetToken: string
): Promise<EmailResult> {
  const recipientName = firstName && firstName.trim() ? firstName.trim() : 'Valued Customer';
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const subject = '🔐 Reset Your Kavah & Co. Account Password';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0804; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ede3d8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f0804; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #1a0e08; border: 1px solid #3d2314; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #2b170c 0%, #150a04 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #3d2314;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="width: 48px; height: 48px; background: linear-gradient(135deg, #c5a880 0%, #8c6d3b 100%); border-radius: 50%; text-align: center; font-size: 24px; font-weight: bold; color: #1a0e08; line-height: 48px;">
                    K
                  </td>
                  <td style="padding-left: 14px; text-align: left;">
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 0.5px; color: #ffffff; font-family: Georgia, serif;">Kavah &amp; Co.</div>
                    <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c5a880;">Security &amp; Account Protection</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #ffffff; font-family: Georgia, serif; line-height: 1.3;">
                Password Reset Request
              </h1>
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #d6c6b4;">
                Hello ${recipientName},
              </p>
              <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 1.6; color: #d6c6b4;">
                We received a request to reset the password for your Kavah &amp; Co. account associated with <strong style="color: #ffffff;">${toEmail}</strong>.
              </p>
              <p style="margin: 0 0 26px 0; font-size: 14px; line-height: 1.6; color: #b5a494;">
                To choose a new secure password, click the button below. This link is valid for <strong>1 hour</strong> (60 minutes).
              </p>

              <!-- Reset Button -->
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin: 28px auto 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%);">
                    <a href="${resetUrl}" target="_blank" style="font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 14px 34px; display: inline-block; border-radius: 12px; letter-spacing: 0.3px;">
                      Reset Your Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Direct URL Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #23130a; border: 1px solid #3d2314; border-radius: 12px; margin: 20px 0; padding: 16px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #c5a880; font-weight: 600; display: block; margin-bottom: 6px;">
                      Direct Link (If button above doesn't open)
                    </span>
                    <a href="${resetUrl}" target="_blank" style="font-size: 12px; color: #e59d48; word-break: break-all; text-decoration: underline;">
                      ${resetUrl}
                    </a>
                    <div style="margin-top: 10px; font-size: 11px; color: #9c8b7c;">
                      Security Reset Token: <span style="font-family: monospace; color: #c5a880;">${resetToken}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Caution -->
              <div style="background: rgba(220, 38, 38, 0.08); border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: #e5a7a7; line-height: 1.5;">
                  <strong>Didn't request this change?</strong> You can safely ignore this email. Your current password remains secure, and no changes will be made to your account.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #120904; padding: 24px 30px; text-align: center; border-top: 1px solid #2a160b; font-size: 12px; color: #7e6e5f; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">
                Sent with care from <a href="mailto:${SENDER_EMAIL}" style="color: #c5a880; text-decoration: none;">${SENDER_EMAIL}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #5a4e43;">
                &copy; ${new Date().getFullYear()} Kavah &amp; Co. Artisanal Roasters. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Hello ${recipientName},

We received a request to reset the password for your Kavah & Co. account (${toEmail}).

To reset your password, visit the following secure link (valid for 1 hour):
${resetUrl}

Security Reset Token:
${resetToken}

If you did not request this password reset, please ignore this email. Your account is completely safe.

Support: ${SENDER_EMAIL}
Kavah & Co. Artisanal Roasters
  `.trim();

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[Email Service - Simulated Mode] PASSWORD RESET EMAIL`);
    console.log(`To: ${toEmail} (${recipientName})`);
    console.log(`From: ${FROM_HEADER}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${resetToken}`);
    console.log(`💡 To deliver real emails, set EMAIL_PASS in backend/.env`);
    console.log(`======================================================\n`);
    return { success: false, previewUrl: resetUrl, error: 'EMAIL_PASS is not configured in backend/.env' };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to: toEmail,
      subject,
      text,
      html
    });

    console.log(`[Email Service] ✅ Password reset email sent successfully to ${toEmail}! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Service] ❌ Failed to send password reset email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}
