import { NextRequest, NextResponse } from "next/server";
import { addCustomerMessageAsync } from "@/lib/db";
import { getMailTransporter } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, orderNumber, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // 1. Save message to permanent cloud database
    const savedMsg = await addCustomerMessageAsync({
      name: name.trim(),
      email: email.trim(),
      orderNumber: orderNumber ? orderNumber.trim() : undefined,
      message: message.trim(),
    });

    // 2. Dispatch real email alert to admin Gmail
    const transporter = getMailTransporter();
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "sabareekv7@gmail.com";
    const senderEmail = process.env.SMTP_USER || "sabareekv7@gmail.com";

    if (transporter) {
      try {
        const subject = `📩 New Customer Message from ${name} (SWANWORKS Help Desk)`;
        const html = `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9FF; padding: 24px; color: #22212B;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E9E5FF; padding: 32px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #7060F5; margin-bottom: 8px;">
                  SWANWORKS HELP DESK
                </div>
                <h1 style="font-size: 20px; font-weight: 800; color: #22212B; margin: 0 0 16px 0;">
                  New Message Received
                </h1>
                
                <div style="background-color: #F9F8FF; border: 1px solid #E9E5FF; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> ${name}</p>
                  <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #7060F5;">${email}</a></p>
                  ${orderNumber ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Order Reference:</strong> ${orderNumber}</p>` : ""}
                  <p style="margin: 4px 0; font-size: 13px;"><strong>Sent At:</strong> ${new Date().toLocaleString("en-IN")}</p>
                </div>

                <div style="margin-bottom: 24px;">
                  <strong style="font-size: 13px; color: #777486; display: block; margin-bottom: 8px;">Message:</strong>
                  <div style="background: #ffffff; border-left: 3px solid #7060F5; padding: 12px 16px; font-size: 14px; line-height: 1.6; color: #22212B; font-style: italic;">
                    "${message.replace(/\n/g, "<br/>")}"
                  </div>
                </div>

                <div style="border-top: 1px solid #F3F0FF; padding-top: 16px; text-align: center;">
                  <a href="mailto:${email}?subject=Re:%20Your%20inquiry%20to%20SWANWORKS" style="display: inline-block; background-color: #7060F5; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                    Reply to Customer (${email}) →
                  </a>
                </div>
              </div>
            </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"SWANWORKS Help Desk" <${senderEmail}>`,
          to: adminEmail,
          replyTo: email,
          subject,
          text: `New customer message from ${name} (${email}):\n\n${message}\n\nOrder Ref: ${orderNumber || "None"}`,
          html,
          headers: {
            "Auto-Submitted": "auto-generated",
          },
        });
      } catch (mailErr) {
        console.error("Failed to forward contact form message to admin Gmail:", mailErr);
      }
    }

    return NextResponse.json({ success: true, message: savedMsg });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to submit message." }, { status: 500 });
  }
}
