import { Resend } from "resend";

import { siteConfig } from "@/config/site.config";

/** Minimal lead shape for email — keep lib free of domain module imports. */
export type EnquiryEmailPayload = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  productInterest: string;
  alloy: string;
  temper: string;
  monthlyTonnage: string;
  destination: string;
  message: string;
  locale: string;
  source: string;
};

function resendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM?.trim() || "HG Alutech <onboarding@resend.dev>";
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function row(label: string, value: string) {
  if (!value.trim()) return "";
  return `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a">${escapeHtml(value)}</td></tr>`;
}

function salesHtml(lead: EnquiryEmailPayload) {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.5;color:#0f172a">
    <p style="margin:0 0 12px"><strong>New RFQ</strong> — ${escapeHtml(siteConfig.name)}</p>
    <table style="border-collapse:collapse">${[
      row("Name", lead.name),
      row("Company", lead.company),
      row("Email", lead.email),
      row("Phone", lead.phone),
      row("Product", lead.productInterest),
      row("Alloy", lead.alloy),
      row("Temper", lead.temper),
      row("Monthly tonnage", lead.monthlyTonnage),
      row("Destination", lead.destination),
      row("Source", lead.source),
      row("Locale", lead.locale),
    ].join("")}</table>
    <p style="margin:16px 0 6px;color:#64748b">Notes</p>
    <p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message)}</p>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Lead ID: ${escapeHtml(lead.id)}</p>
  </div>`;
}

function buyerHtml(lead: EnquiryEmailPayload) {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55;color:#0f172a">
    <p style="margin:0 0 12px">Dear ${escapeHtml(lead.name)},</p>
    <p style="margin:0 0 12px">Thank you for your enquiry to <strong>${escapeHtml(siteConfig.shortName)}</strong>. We have received your RFQ and our sales team will review feasibility and lead time.</p>
    <p style="margin:0 0 12px">Typical response: <strong>1–2 business days</strong>.</p>
    ${lead.productInterest ? `<p style="margin:0 0 12px">Product interest: ${escapeHtml(lead.productInterest)}</p>` : ""}
    <p style="margin:0">Regards,<br/>${escapeHtml(siteConfig.name)}</p>
  </div>`;
}

export type NotifyResult = {
  salesSent: boolean;
  buyerSent: boolean;
  errors: string[];
};

/**
 * Soft-fail email: never throws to the caller for missing config / provider errors.
 * Lead must already be persisted before calling.
 */
export async function notifyEnquiryEmails(opts: {
  lead: EnquiryEmailPayload;
  salesTo: string | null | undefined;
}): Promise<NotifyResult> {
  const errors: string[] = [];
  const client = resendClient();
  if (!client) {
    return {
      salesSent: false,
      buyerSent: false,
      errors: ["RESEND_API_KEY not configured"],
    };
  }

  const from = fromAddress();
  let salesSent = false;
  let buyerSent = false;

  const salesTo = opts.salesTo?.trim();
  if (salesTo) {
    try {
      const { error } = await client.emails.send({
        from,
        to: salesTo,
        replyTo: opts.lead.email,
        subject: `RFQ — ${opts.lead.company || opts.lead.name} — ${opts.lead.productInterest || "General"}`,
        html: salesHtml(opts.lead),
      });
      if (error) errors.push(`sales: ${error.message}`);
      else salesSent = true;
    } catch (err) {
      errors.push(`sales: ${err instanceof Error ? err.message : "send failed"}`);
    }
  } else {
    errors.push("No sales inbox configured (Company profile → sales email)");
  }

  try {
    const { error } = await client.emails.send({
      from,
      to: opts.lead.email,
      subject: `We received your RFQ — ${siteConfig.shortName}`,
      html: buyerHtml(opts.lead),
    });
    if (error) errors.push(`buyer: ${error.message}`);
    else buyerSent = true;
  } catch (err) {
    errors.push(`buyer: ${err instanceof Error ? err.message : "send failed"}`);
  }

  return { salesSent, buyerSent, errors };
}
