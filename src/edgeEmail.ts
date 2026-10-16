import { WorkerMailer } from 'worker-mailer';

export interface EmailEnv {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_USER?: string;
  EMAIL_FROM_NAME?: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
}

const DEFAULT_SMTP_HOST = 'smtp-relay.brevo.com';
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_SMTP_USER = 'be4fb3001@smtp-brevo.com';
const DEFAULT_EMAIL_USER = 'instahelper7109648@gmail.com';
const DEFAULT_SENDER_NAME = 'Kavah & Co. Artisanal Roasters';

/**
 * Sends a transactional email using Cloudflare Worker edge runtime
 */
export async function sendEdgeEmail(
  env: EmailEnv,
  options: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    text: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const host = env.SMTP_HOST || DEFAULT_SMTP_HOST;
  const port = Number(env.SMTP_PORT) || DEFAULT_SMTP_PORT;
  const user = env.SMTP_USER || DEFAULT_SMTP_USER;
  const pass = (env.SMTP_PASS || '').trim();
  const senderEmail = env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const senderName = env.EMAIL_FROM_NAME || DEFAULT_SENDER_NAME;

  // 1. Resend API HTTP Fallback
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `${senderName} <onboarding@resend.dev>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      });
      const data: any = await res.json();
      if (res.ok) {
        console.log(`[Edge Email] ✅ Delivered via Resend API to ${options.to}! ID: ${data.id}`);
        return { success: true };
      }
    } catch (e: any) {
      console.warn('[Edge Email] Resend dispatch attempt skipped:', e.message);
    }
  }

  // 2. Brevo REST API Fallback (if xkeysib API key is present)
  const brevoApiKey = env.BREVO_API_KEY || (pass.startsWith('xkeysib-') ? pass : '');
  if (brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: options.to, name: options.toName || options.to.split('@')[0] }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text
        })
      });
      const data: any = await res.json();
      if (res.ok) {
        console.log(`[Edge Email] ✅ Delivered via Brevo REST API to ${options.to}! MessageId: ${data.messageId}`);
        return { success: true };
      }
    } catch (e: any) {
      console.warn('[Edge Email] Brevo REST API dispatch attempt skipped:', e.message);
    }
  }

  // 3. Brevo / Custom SMTP Relay via Cloudflare Sockets
  if (!pass || pass.length < 5) {
    console.warn('[Edge Email] No SMTP credentials configured, skipping email dispatch.');
    return { success: false, error: 'SMTP credentials missing' };
  }

  try {
    console.log(`[Edge Email] 🚀 Connecting to ${host}:${port} to send email to ${options.to}...`);

    await WorkerMailer.send(
      {
        host,
        port,
        secure: false,
        startTls: true,
        credentials: {
          username: user,
          password: pass
        },
        authType: ['login', 'plain'],
        socketTimeoutMs: 25000,
        responseTimeoutMs: 20000
      },
      {
        from: { name: senderName, email: senderEmail },
        to: { name: options.toName || options.to.split('@')[0], email: options.to },
        subject: options.subject,
        html: options.html,
        text: options.text
      }
    );

    console.log(`[Edge Email] ✅ Email successfully delivered to ${options.to}! Subject: "${options.subject}"`);
    return { success: true };
  } catch (err: any) {
    const rawError = err?.message || String(err);
    console.error(`[Edge Email] ❌ Delivery to ${options.to} failed:`, rawError);

    if (rawError.includes('Unauthorized IP address') || rawError.includes('525')) {
      const fixNotice = `Brevo blocked Cloudflare edge IP (525 5.7.1 Unauthorized IP address). To fix: In your Brevo account, go to Settings > Security > Authorized IPs, and click Deactivate on 'Blocking unauthorized IP addresses'.`;
      return { success: false, error: fixNotice };
    }

    return { success: false, error: rawError };
  }
}

/**
 * Send Welcome Email with 10% coupon code
 */
export async function sendEdgeWelcomeEmail(
  env: EmailEnv,
  toEmail: string,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  const name = (firstName && firstName.trim()) ? firstName.trim() : 'Coffee Lover';
  const subject = '☕ Welcome to Kavah & Co. Artisanal Roasters! (10% Off Inside)';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Kavah & Co.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0604; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5ede6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0604; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #160c07; border: 1px solid #3d2314; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="background: linear-gradient(135deg, #2b170c 0%, #150a04 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #3d2314;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #fdf8f4; letter-spacing: 1px;">KAVAH & CO.</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c5a880;">Artisanal Specialty Roasters</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 22px; color: #ffffff;">Welcome to the Roastery, ${name}!</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #c4b5a5;">
                Thank you for joining our community of specialty coffee enthusiasts. Each small batch at Kavah & Co. is ethically sourced from high-altitude micro-farms and roasted to precision on our vintage Loring drum.
              </p>
              
              <div style="background: #23130a; border: 1px dashed #c5a880; border-radius: 12px; margin: 26px 0; padding: 22px; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #c5a880; font-weight: bold; display: block; margin-bottom: 6px;">Your Welcome Gift</span>
                <div style="font-size: 26px; font-weight: bold; letter-spacing: 4px; color: #ffffff; font-family: monospace; background: #120904; display: inline-block; padding: 10px 24px; border-radius: 8px; border: 1px solid #3d2314; margin: 8px 0;">
                  WELCOME10
                </div>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #a89887;">
                  Apply this code at checkout to enjoy <strong>10% off</strong> your first micro-roast order.
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="https://coffee-store.ahtashamkingking5.workers.dev/shop" target="_blank" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 0.5px;">
                  Explore Fresh Micro-Roasts &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #100703; padding: 20px 30px; text-align: center; border-top: 1px solid #2a160b; font-size: 11px; color: #7e6e5f;">
              Sent with care from Kavah & Co. Roastery &bull; instahelper7109648@gmail.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Welcome to Kavah & Co., ${name}!

Thank you for joining our community of artisanal specialty coffee lovers.
Enjoy 10% off your first coffee beans order with coupon code:

WELCOME10

Shop freshly roasted single origins and signature blends:
https://coffee-store.ahtashamkingking5.workers.dev/shop

Sent with care from Kavah & Co. Artisanal Roasters
instahelper7109648@gmail.com
  `.trim();

  return sendEdgeEmail(env, {
    to: toEmail,
    toName: firstName,
    subject,
    html,
    text
  });
}

/**
 * Send Password Reset Email
 */
export async function sendEdgePasswordResetEmail(
  env: EmailEnv,
  toEmail: string,
  resetToken: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const subject = '🔐 Reset Your Password - Kavah & Co. Artisanal Roasters';

  const fullResetUrl = resetUrl.startsWith('http')
    ? resetUrl
    : `https://coffee-store.ahtashamkingking5.workers.dev${resetUrl}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0604; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5ede6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0604; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #160c07; border: 1px solid #3d2314; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="background: linear-gradient(135deg, #2b170c 0%, #150a04 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #3d2314;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #fdf8f4; letter-spacing: 1px;">KAVAH & CO.</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c5a880;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 20px; color: #ffffff;">Hello Coffee Lover,</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #c4b5a5;">
                We received a request to reset the password for your Kavah & Co. account (<strong style="color: #f5ede6;">${toEmail}</strong>).
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${fullResetUrl}" target="_blank" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 0.5px;">
                  Reset Your Password &rarr;
                </a>
              </div>

              <div style="background: #23130a; border: 1px solid #3d2314; border-radius: 10px; padding: 16px; margin: 24px 0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c5a880; display: block; margin-bottom: 4px;">Direct Reset Token:</span>
                <code style="font-family: monospace; font-size: 13px; color: #fbbf24; word-break: break-all;">${resetToken}</code>
              </div>

              <p style="margin: 0; font-size: 12px; color: #8e7c6b; line-height: 1.5;">
                If you did not request this password reset, you can safely ignore this email. This link will expire in 1 hour.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #100703; padding: 20px 30px; text-align: center; border-top: 1px solid #2a160b; font-size: 11px; color: #7e6e5f;">
              Sent securely by Kavah & Co. &bull; instahelper7109648@gmail.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Password Reset Request - Kavah & Co.

We received a request to reset the password for your account (${toEmail}).

Click the link below to set a new password:
${fullResetUrl}

Direct Token: ${resetToken}

If you did not make this request, please ignore this email.

Kavah & Co. Artisanal Roasters
instahelper7109648@gmail.com
  `.trim();

  return sendEdgeEmail(env, {
    to: toEmail,
    subject,
    html,
    text
  });
}

/**
 * Send Order Confirmation Email
 */
export async function sendEdgeOrderConfirmationEmail(
  env: EmailEnv,
  order: any
): Promise<{ success: boolean; error?: string }> {
  const customer = order.customer || {};
  const toEmail = customer.email;
  if (!toEmail) return { success: false, error: 'No customer email found in order' };

  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Valued Customer';
  const orderNumber = order.orderNumber || 'KAV-ORDER';
  const trackingNumber = order.trackingNumber || 'TRK-PENDING';
  const total = Number(order.total || 0).toFixed(2);
  const subtotal = Number(order.subtotal || 0).toFixed(2);
  const shippingFee = Number(order.shippingFee || 0).toFixed(2);
  const discount = Number(order.discount || 0).toFixed(2);

  const items = (order.items || []).map((item: any) => {
    const variantDesc = item.variant
      ? `(${item.variant.weight || '250g'} &bull; ${item.variant.grind || 'Whole Bean'})`
      : '';
    const itemTotal = Number(item.totalPrice || (item.unitPrice * item.quantity) || 0).toFixed(2);

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a160b; font-size: 13px; color: #f5ede6;">
          <strong>${item.name}</strong> <span style="font-size: 11px; color: #c5a880;">${variantDesc}</span>
          <br><span style="font-size: 11px; color: #8e7c6b;">Qty: ${item.quantity} &times; $${Number(item.unitPrice || 0).toFixed(2)}</span>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #2a160b; font-size: 13px; font-weight: bold; color: #ffffff;">
          $${itemTotal}
        </td>
      </tr>
    `;
  }).join('');

  const shippingAddr = order.shippingAddress || {};
  const addressLine = [
    shippingAddr.street,
    shippingAddr.apartment,
    shippingAddr.city,
    shippingAddr.state,
    shippingAddr.postalCode,
    shippingAddr.country
  ].filter(Boolean).join(', ');

  const subject = `☕ Order Confirmed: ${orderNumber} - Kavah & Co. Artisanal Roasters`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - Kavah & Co.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0604; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5ede6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0604; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #160c07; border: 1px solid #3d2314; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="background: linear-gradient(135deg, #2b170c 0%, #150a04 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #3d2314;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #fdf8f4; letter-spacing: 1px;">KAVAH & CO.</h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c5a880;">Artisanal Specialty Roasters</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #10b981; font-weight: bold; display: block;">Roastery Confirmed</span>
              <h2 style="margin: 6px 0 16px 0; font-family: Georgia, serif; font-size: 22px; color: #ffffff;">Thank You For Your Order, ${customerName}!</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #c4b5a5;">
                We have received your coffee order and scheduled your selected beans for our next morning micro-roast batch.
              </p>
              
              <!-- Order Reference Box -->
              <div style="background: #23130a; border: 1px solid #3d2314; border-radius: 12px; padding: 18px; margin-bottom: 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td>
                      <span style="font-size: 10px; text-transform: uppercase; color: #8e7c6b; display: block;">Order Number</span>
                      <strong style="font-family: monospace; font-size: 16px; color: #fbbf24;">${orderNumber}</strong>
                    </td>
                    <td align="right">
                      <span style="font-size: 10px; text-transform: uppercase; color: #8e7c6b; display: block;">Tracking Reference</span>
                      <strong style="font-family: monospace; font-size: 14px; color: #ffffff;">${trackingNumber}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Items Breakdown -->
              <h3 style="font-family: Georgia, serif; font-size: 16px; color: #ffffff; margin: 24px 0 12px 0;">Your Fresh Roasts</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                ${items}
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 2px solid #3d2314; padding-top: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8e7c6b;">Subtotal</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #f5ede6;">$${subtotal}</td>
                </tr>
                ${Number(discount) > 0 ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #10b981;">Coupon Savings</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #10b981;">-$${discount}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8e7c6b;">Carbon-Neutral Delivery</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #f5ede6;">${Number(shippingFee) === 0 ? 'FREE' : `$${shippingFee}`}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: bold; color: #ffffff;">Grand Total</td>
                  <td align="right" style="padding: 10px 0 0 0; font-size: 18px; font-weight: bold; color: #fbbf24;">$${total}</td>
                </tr>
              </table>

              <!-- Shipping Info -->
              <div style="background: #190c06; border-left: 3px solid #c5a880; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
                <span style="font-size: 10px; text-transform: uppercase; color: #c5a880; font-weight: bold; display: block; margin-bottom: 4px;">Delivery Destination</span>
                <p style="margin: 0; font-size: 12px; color: #d6c7b9; line-height: 1.5;">${addressLine}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #8e7c6b;">Method: ${order.shippingMethod?.name || 'Standard Ground'} &bull; Payment: ${order.paymentMethod?.toUpperCase() || 'PAID'}</p>
              </div>

              <!-- View Order Action -->
              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="https://coffee-store.ahtashamkingking5.workers.dev/order-confirmation/${orderNumber}" target="_blank" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                  View Roasting & Fulfillment Sequence &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #100703; padding: 20px 30px; text-align: center; border-top: 1px solid #2a160b; font-size: 11px; color: #7e6e5f;">
              Need help with this order? Contact our roastery team at <strong style="color: #c5a880;">instahelper7109648@gmail.com</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Order Confirmed: ${orderNumber} - Kavah & Co. Artisanal Roasters

Thank you for your order, ${customerName}!

Order Number: ${orderNumber}
Tracking Reference: ${trackingNumber}
Grand Total: $${total}
Shipping Destination: ${addressLine}

Track your order in real time:
https://coffee-store.ahtashamkingking5.workers.dev/order-confirmation/${orderNumber}

Questions? Contact: instahelper7109648@gmail.com
Kavah & Co. Artisanal Roasters
  `.trim();

  return sendEdgeEmail(env, {
    to: toEmail,
    toName: customerName,
    subject,
    html,
    text
  });
}
