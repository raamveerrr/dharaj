import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ENQUIRY_TYPES } from "@/types/enquiry";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const ADMIN_EMAIL = "dharaj.farm@gmail.com";
const FROM = "DHARAJ <onboarding@resend.dev>";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  company: z.string().trim().max(150).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  state: z.string().trim().max(100).optional().default(""),
  enquiryType: z.enum(ENQUIRY_TYPES),
  message: z.string().trim().min(1).max(2000),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(
  apiKey: string,
  lovableKey: string,
  payload: { to: string; subject: string; html: string },
) {
  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": apiKey,
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend request failed [${response.status}]: ${body}`);
    throw new Error(`Email send failed [${response.status}]`);
  }
}

export const Route = createFileRoute("/api/public/business-enquiry")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = schema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid enquiry payload" }, { status: 400 });
        }

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const resendKey = process.env["RESEND_API_KEY"];
        if (!lovableKey || !resendKey) {
          return Response.json({ error: "Email is not configured" }, { status: 503 });
        }

        const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const rows: Array<[string, string]> = [
          ["Name", parsed.name],
          ["Email", parsed.email],
          ["Phone", parsed.phone],
          ["Company", parsed.company || "—"],
          ["City", parsed.city || "—"],
          ["State", parsed.state || "—"],
          ["Enquiry Type", parsed.enquiryType],
          ["Message", parsed.message],
          ["Date & Time", when],
        ];

        const adminHtml = `
          <div style="font-family:Arial,sans-serif;color:#1f2a24">
            <h2 style="color:#1f4d36">New Business Enquiry</h2>
            <table cellpadding="8" style="border-collapse:collapse">
              ${rows
                .map(
                  ([k, v]) =>
                    `<tr><td style="font-weight:bold;vertical-align:top">${escapeHtml(k)}</td><td>${escapeHtml(v).replace(/\n/g, "<br/>")}</td></tr>`,
                )
                .join("")}
            </table>
          </div>`;

        const customerHtml = `
          <div style="font-family:Arial,sans-serif;color:#1f2a24">
            <p>Hi ${escapeHtml(parsed.name)},</p>
            <p>Thank you for contacting DHARAJ.</p>
            <p>We have successfully received your enquiry.</p>
            <p>Our team will review it and contact you shortly.</p>
            <p>Regards,<br/>DHARAJ</p>
          </div>`;

        try {
          await sendEmail(resendKey, lovableKey, {
            to: ADMIN_EMAIL,
            subject: `New Business Enquiry - ${parsed.name}`,
            html: adminHtml,
          });
          await sendEmail(resendKey, lovableKey, {
            to: parsed.email,
            subject: "We've received your enquiry",
            html: customerHtml,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Email send failed";
          return Response.json({ error: message }, { status: 502 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
