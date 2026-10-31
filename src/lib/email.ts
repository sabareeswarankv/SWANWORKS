import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Order, DownloadToken, Product } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const EMAILS_LOG = path.join(DATA_DIR, "transactional_emails.json");

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  orderNumber: string;
  sentAt: string;
  downloadLinks: { productTitle: string; url: string; expiresAt: string }[];
  html: string;
  status: "delivered_simulated" | "delivered_smtp";
}

export function getMailTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOrderConfirmationEmail(
  order: Order,
  tokens: DownloadToken[],
  products: Product[],
  baseUrl: string
): Promise<SentEmailRecord> {
  const downloadLinks = tokens.map((token) => {
    const prod = products.find((p) => p.id === token.productId);
    return {
      productTitle: prod ? prod.title : "Digital Resource",
      url: `${baseUrl}/api/download/${token.token}`,
      expiresAt: token.expiresAt,
    };
  });

  const emailId = `mail_${Date.now()}`;
  const subject = `Your SWANWORKS Digital Downloads (Order ${order.orderNumber})`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E9E5FF;">
        <td style="padding: 12px 0; font-weight: 500; color: #22212B;">${item.productTitle}</td>
        <td style="padding: 12px 0; text-align: center; color: #777486;">×${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #22212B;">₹${item.totalPrice}</td>
      </tr>
    `
    )
    .join("");

  const downloadButtonsHtml = downloadLinks
    .map(
      (link) => `
      <div style="margin-bottom: 16px; padding: 16px; background-color: #F9F8FF; border: 1px solid #E9E5FF; border-radius: 12px;">
        <div style="font-weight: 600; font-size: 15px; color: #22212B; margin-bottom: 6px;">${link.productTitle}</div>
        <div style="margin-bottom: 10px; font-size: 13px; color: #777486;">Expires in 7 days (10 download limit)</div>
        <a href="${link.url}" style="display: inline-block; background-color: #7060F5; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 9999px;">Download Files →</a>
      </div>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8FF; margin: 0; padding: 30px 20px; color: #22212B;">
        <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E9E5FF; padding: 36px; box-shadow: 0 10px 30px rgba(112, 96, 245, 0.06);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: 0.1em; color: #22212B;">SWANWORKS</span>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; color: #22212B; margin: 0 0 10px;">Thank you for your order!</h1>
          <p style="font-size: 15px; color: #777486; line-height: 1.5; margin: 0 0 24px;">
            Your payment for order <strong>${order.orderNumber}</strong> has been verified. Your digital files are ready for instant download below.
          </p>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 16px; font-weight: 700; color: #22212B; margin-bottom: 12px;">Your Downloads</h2>
            ${downloadButtonsHtml}
          </div>

          <div style="border-top: 1px solid #E9E5FF; padding-top: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #22212B; margin: 0 0 12px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding-top: 14px; font-weight: 700; color: #22212B;">Total Paid</td>
                <td style="padding-top: 14px; text-align: right; font-weight: 800; font-size: 16px; color: #7060F5;">₹${order.subtotal}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #ECE9FF; border-radius: 10px; padding: 14px; font-size: 13px; color: #5A48E6; line-height: 1.5;">
            <strong>Need help?</strong> Contact us at helloswanworks@gmail.com with your order number.
          </div>
        </div>
      </body>
    </html>
  `;

  let deliveryStatus: "delivered_simulated" | "delivered_smtp" = "delivered_simulated";

  // Dispatch via real Gmail SMTP
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const plainTextContent = `
Thank you for your order on SWANWORKS!

Order Reference: ${order.orderNumber}
Total Paid: ₹${order.subtotal}

Your Downloads:
${downloadLinks.map((l) => `• ${l.productTitle}: ${l.url}`).join("\n")}

If you have questions, reply to this email or contact us at helloswanworks@gmail.com.
      `.trim();

      await transporter.sendMail({
        from: '"SWANWORKS" <helloswanworks@gmail.com>',
        to: order.customerEmail,
        replyTo: "helloswanworks@gmail.com",
        subject,
        text: plainTextContent,
        html,
        headers: {
          "X-Entity-Ref-ID": order.id,
          "Auto-Submitted": "auto-generated",
          "X-Priority": "3",
        },
      });
      deliveryStatus = "delivered_smtp";
    } catch (smtpErr) {
      console.error("Failed to send customer confirmation email via SMTP:", smtpErr);
    }
  }

  const record: SentEmailRecord = {
    id: emailId,
    to: order.customerEmail,
    subject,
    orderNumber: order.orderNumber,
    sentAt: new Date().toISOString(),
    downloadLinks,
    html,
    status: deliveryStatus,
  };

  try {
    let records: SentEmailRecord[] = [];
    if (fs.existsSync(EMAILS_LOG)) {
      records = JSON.parse(fs.readFileSync(EMAILS_LOG, "utf8"));
    }
    records.unshift(record);
    fs.writeFileSync(EMAILS_LOG, JSON.stringify(records, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to transactional email log:", err);
  }

  return record;
}

export async function sendAdminNewPaymentAlert(
  order: Order,
  utr: string,
  baseUrl: string
): Promise<SentEmailRecord> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "sabareekv7@gmail.com";
  const emailId = `mail_admin_${Date.now()}`;
  const subject = `🔔 NEW UPI PAYMENT: Order #${order.orderNumber} (₹${order.subtotal})`;

  const itemsList = order.items
    .map((i) => `• ${i.productTitle} (Qty: ${i.quantity}) - ₹${i.totalPrice}`)
    .join("<br/>");

  const approvalUrl = `${baseUrl}/admin`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8FF; margin: 0; padding: 24px; color: #22212B;">
        <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E9E5FF; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="display: inline-block; padding: 4px 12px; background: #ECE9FF; color: #7060F5; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
            Payment Alert
          </div>
          <h1 style="font-size: 20px; font-weight: 800; color: #22212B; margin: 12px 0 6px;">
            Customer Completed UPI Transfer
          </h1>
          <p style="font-size: 14px; color: #777486; margin: 0 0 20px;">
            A customer just clicked &quot;I Have Completed Payment&quot;. Check your SBI SMS/YONO app for ₹${order.subtotal} and click Approve to unlock their downloads.
          </p>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <div style="font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 700;">Customer Email</div>
            <div style="font-size: 15px; font-weight: 700; color: #0F172A; margin-top: 4px;">${order.customerEmail}</div>
            ${order.customerName ? `<div style="font-size: 13px; color: #475569;">${order.customerName}</div>` : ""}

            <div style="margin-top: 14px; font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 700;">Amount to Confirm in SBI</div>
            <div style="font-size: 22px; font-weight: 800; color: #16A34A; margin-top: 2px;">₹${order.subtotal}</div>
            <div style="font-size: 13px; color: #334155; margin-top: 4px;">${itemsList}</div>
          </div>

          <div style="text-align: center; margin: 24px 0 16px;">
            <a href="${approvalUrl}" style="display: inline-block; background-color: #7060F5; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 9999px;">
              ✓ Open Dashboard & Approve Order →
            </a>
          </div>
          <p style="font-size: 11px; color: #94A3B8; text-align: center; margin: 0;">
            Order ID: ${order.id} • Order #${order.orderNumber}
          </p>
        </div>
      </body>
    </html>
  `;

  let deliveryStatus: "delivered_simulated" | "delivered_smtp" = "delivered_simulated";

  // Dispatch real alert to admin Gmail
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"SWANWORKS Alert" <helloswanworks@gmail.com>',
        to: adminEmail,
        replyTo: "helloswanworks@gmail.com",
        subject,
        html,
        headers: {
          "Auto-Submitted": "auto-generated",
        },
      });
      deliveryStatus = "delivered_smtp";
    } catch (smtpErr) {
      console.error("Failed to send admin payment alert via SMTP:", smtpErr);
    }
  }

  const record: SentEmailRecord = {
    id: emailId,
    to: adminEmail,
    subject,
    orderNumber: order.orderNumber,
    sentAt: new Date().toISOString(),
    downloadLinks: [],
    html,
    status: deliveryStatus,
  };

  try {
    let records: SentEmailRecord[] = [];
    if (fs.existsSync(EMAILS_LOG)) {
      records = JSON.parse(fs.readFileSync(EMAILS_LOG, "utf8"));
    }
    records.unshift(record);
    fs.writeFileSync(EMAILS_LOG, JSON.stringify(records, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write admin alert email log:", err);
  }

  return record;
}

export async function sendPaymentReceivedPendingEmail(
  order: Order,
  baseUrl: string
): Promise<SentEmailRecord> {
  const emailId = `mail_pending_${Date.now()}`;
  const subject = `Payment Received — Order #${order.orderNumber} in Verification | SWANWORKS`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E9E5FF;">
        <td style="padding: 10px 0; font-weight: 500; color: #22212B;">${item.productTitle}</td>
        <td style="padding: 10px 0; text-align: center; color: #777486;">×${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #22212B;">₹${item.totalPrice}</td>
      </tr>
    `
    )
    .join("");

  const retrieveUrl = `${baseUrl}/retrieve-order`;
  const orderUrl = `${baseUrl}/order-confirmation/${order.id}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9F8FF; margin: 0; padding: 30px 20px; color: #22212B;">
        <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E9E5FF; padding: 36px; box-shadow: 0 10px 30px rgba(112, 96, 245, 0.06);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: 0.1em; color: #22212B;">SWANWORKS</span>
          </div>

          <div style="display: inline-block; padding: 4px 12px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
            Payment Received • In Verification
          </div>

          <h1 style="font-size: 22px; font-weight: 700; color: #22212B; margin: 0 0 10px;">We received your payment details!</h1>
          
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0 0 16px;">
            Thank you for your order, <strong>${order.customerName || "Customer"}</strong>. We have logged your UPI payment reference for <strong>Order #${order.orderNumber}</strong>.
          </p>

          <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="font-weight: 700; font-size: 14px; color: #166534; margin-bottom: 4px;">
              ✓ You do not need to keep the checkout page open
            </div>
            <p style="font-size: 13px; color: #15803D; margin: 0; line-height: 1.5;">
              UPI payments are typically verified within <strong>15–30 minutes</strong> (orders placed late at night are verified first thing in the morning by 8:00 AM).
            </p>
          </div>

          <div style="background-color: #F9F8FF; border: 1px solid #E9E5FF; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 13px; color: #777486; margin-bottom: 6px;">Next Steps:</div>
            <div style="font-size: 14px; color: #22212B; line-height: 1.5;">
              As soon as our bank confirms the credit, your instant PDF download link will be <strong>emailed automatically to this address (${order.customerEmail})</strong>.
            </div>
          </div>

          <div style="border-top: 1px solid #E9E5FF; padding-top: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #22212B; margin: 0 0 12px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding-top: 14px; font-weight: 700; color: #22212B;">Total Amount</td>
                <td style="padding-top: 14px; text-align: right; font-weight: 800; font-size: 16px; color: #7060F5;">₹${order.subtotal}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${orderUrl}" style="display: inline-block; background-color: #7060F5; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 9999px;">
              View Live Order Status →
            </a>
          </div>

          <div style="background-color: #ECE9FF; border-radius: 10px; padding: 14px; font-size: 13px; color: #5A48E6; line-height: 1.5;">
            <strong>Zero-Risk Guarantee:</strong> You can also look up or retrieve your order anytime at <a href="${retrieveUrl}" style="color: #7060F5; font-weight: 700;">swanworks.in/retrieve-order</a>. If you have any questions, just reply to this email or write to <strong>helloswanworks@gmail.com</strong>.
          </div>
        </div>
      </body>
    </html>
  `;

  let deliveryStatus: "delivered_simulated" | "delivered_smtp" = "delivered_simulated";

  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const plainTextContent = `
Thank you for your order on SWANWORKS!

Order Reference: #${order.orderNumber}
Total: ₹${order.subtotal}

We have received your payment details. You do not need to keep the checkout page open.
Our team verifies UPI payments within 15–30 minutes (late night orders are verified first thing in the morning).
As soon as verified, your digital downloads will be sent straight to this email address.

Track your order anytime: ${orderUrl}
Retrieve your purchases: ${retrieveUrl}

Questions? Reply directly to this email or contact helloswanworks@gmail.com.
      `.trim();

      await transporter.sendMail({
        from: '"SWANWORKS" <helloswanworks@gmail.com>',
        to: order.customerEmail,
        replyTo: "helloswanworks@gmail.com",
        subject,
        text: plainTextContent,
        html,
        headers: {
          "X-Entity-Ref-ID": order.id,
          "Auto-Submitted": "auto-generated",
        },
      });
      deliveryStatus = "delivered_smtp";
    } catch (smtpErr) {
      console.error("Failed to send pending payment email via SMTP:", smtpErr);
    }
  }

  const record: SentEmailRecord = {
    id: emailId,
    to: order.customerEmail,
    subject,
    orderNumber: order.orderNumber,
    sentAt: new Date().toISOString(),
    downloadLinks: [],
    html,
    status: deliveryStatus,
  };

  try {
    let records: SentEmailRecord[] = [];
    if (fs.existsSync(EMAILS_LOG)) {
      records = JSON.parse(fs.readFileSync(EMAILS_LOG, "utf8"));
    }
    records.unshift(record);
    fs.writeFileSync(EMAILS_LOG, JSON.stringify(records, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to transactional email log:", err);
  }

  return record;
}

export function getDispatchedEmails(): SentEmailRecord[] {
  try {
    if (fs.existsSync(EMAILS_LOG)) {
      return JSON.parse(fs.readFileSync(EMAILS_LOG, "utf8"));
    }
  } catch {
    // empty
  }
  return [];
}
