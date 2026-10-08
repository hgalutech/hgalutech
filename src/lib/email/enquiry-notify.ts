import { Resend } from "resend";

import { footerContactFallback } from "@/config/nav.config";
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

const SALES_EMAIL = footerContactFallback.email;
const PLANT =
  "Survey No. 671/3, Laxmipura Nandasan, Rajpur, Taluka Kadi, Mahesana, Gujarat 384450, India";

const FONT = "Arial, Helvetica, sans-serif";

function resendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM?.trim() || "HG Alutek <onboarding@resend.dev>";
}

function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.hgalutek.com";
  return raw.replace(/\/$/, "");
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clean(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function detailRows(pairs: Array<[string, string]>) {
  return pairs
    .filter(([, value]) => value.trim())
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 16px 10px 0;border-bottom:1px solid #e6ebf2;font-family:${FONT};font-size:13px;line-height:1.4;color:#5c6b80;vertical-align:top;width:148px;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e6ebf2;font-family:${FONT};font-size:14px;line-height:1.45;color:#00122f;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");
}

function textLines(pairs: Array<[string, string]>) {
  return pairs
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join("\n");
}

function shell(opts: { preheader: string; body: string }) {
  const preheader = escapeHtml(opts.preheader);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(siteConfig.name)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f5f8;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f5f8;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td style="padding:0 4px 14px;font-family:${FONT};font-size:13px;letter-spacing:0.14em;font-weight:700;color:#0342ab;">
              HG ALUTEK
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;border:1px solid #e6ebf2;border-top:4px solid #0342ab;border-radius:8px;">
              ${opts.body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 4px 0;font-family:${FONT};font-size:12px;line-height:1.5;color:#6b778c;">
              ${escapeHtml(siteConfig.name)} · Kadi, Gujarat<br />
              ${escapeHtml(PLANT)}<br />
              <a href="mailto:${SALES_EMAIL}" style="color:#0342ab;text-decoration:none;">${SALES_EMAIL}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
      <tr>
        <td bgcolor="#0342ab" style="background:#0342ab;border-radius:6px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 18px;font-family:${FONT};font-size:14px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

function enquiryPairs(lead: EnquiryEmailPayload): Array<[string, string]> {
  return [
    ["Name", clean(lead.name)],
    ["Company", clean(lead.company)],
    ["Email", clean(lead.email)],
    ["Phone", clean(lead.phone)],
    ["Product", clean(lead.productInterest)],
    ["Alloy", clean(lead.alloy)],
    ["Temper", clean(lead.temper)],
    ["Monthly tonnage", clean(lead.monthlyTonnage)],
    ["Destination", clean(lead.destination)],
  ];
}

function salesHtml(lead: EnquiryEmailPayload) {
  const who = clean(lead.company) || clean(lead.name) || "A buyer";
  const product = clean(lead.productInterest) || "a general enquiry";
  const notes = clean(lead.message);
  return shell({
    preheader: `${who} asked about ${product}. Reply to answer them.`,
    body: `
      <div style="padding:28px 28px 8px;font-family:${FONT};">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0342ab;">New enquiry</p>
        <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;font-weight:700;color:#00122f;">${escapeHtml(who)}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#334155;">Asked about ${escapeHtml(product)}. Reply goes to the buyer.</p>
        ${button(`mailto:${clean(lead.email)}`, `Reply to ${clean(lead.name) || "buyer"}`)}
      </div>
      <div style="padding:0 28px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRows(enquiryPairs(lead))}
        </table>
      </div>
      ${
        notes
          ? `<div style="padding:8px 28px 8px;">
              <p style="margin:12px 0 6px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#5c6b80;">Notes</p>
              <p style="margin:0;padding:14px 16px;background:#f7f9fc;border-radius:6px;font-family:${FONT};font-size:14px;line-height:1.55;color:#00122f;white-space:pre-wrap;">${escapeHtml(notes)}</p>
            </div>`
          : ""
      }
      <p style="margin:0;padding:16px 28px 24px;font-family:${FONT};font-size:12px;line-height:1.5;color:#6b778c;">
        Reference ${escapeHtml(lead.id)}<br />
        Source ${escapeHtml(clean(lead.source) || "website")} · ${escapeHtml(clean(lead.locale) || "en")}
      </p>`,
  });
}

function salesText(lead: EnquiryEmailPayload) {
  const who = clean(lead.company) || clean(lead.name) || "A buyer";
  return [
    `New enquiry — ${who}`,
    "",
    `Reply to ${clean(lead.email)}`,
    "",
    textLines(enquiryPairs(lead)),
    "",
    clean(lead.message) ? `Notes:\n${clean(lead.message)}` : "",
    "",
    `Reference: ${lead.id}`,
    `Source: ${clean(lead.source) || "website"} · ${clean(lead.locale) || "en"}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function buyerHtml(lead: EnquiryEmailPayload) {
  const product = clean(lead.productInterest);
  const notes = clean(lead.message);
  return shell({
    preheader:
      "Sales will reply within 1–2 business days with feasibility and lead time.",
    body: `
      <div style="padding:28px 28px 8px;font-family:${FONT};">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0342ab;">Enquiry received</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:700;color:#00122f;">Thank you, ${escapeHtml(clean(lead.name) || "there")}.</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
          We have your ${product ? `enquiry for ${escapeHtml(product)}` : "enquiry"}.
          The sales desk at the Kadi plant will check grade, quantity and lead time, then write back within <strong>1–2 business days</strong>.
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#334155;">
          Reply to this email and it reaches <a href="mailto:${SALES_EMAIL}" style="color:#0342ab;text-decoration:none;">${SALES_EMAIL}</a>.
        </p>
      </div>
      <div style="padding:0 28px 8px;">
        <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#5c6b80;">What you sent</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${detailRows([
            ...enquiryPairs(lead).filter(([label]) => label !== "Email"),
            ["Notes", notes],
          ])}
        </table>
      </div>
      <div style="padding:12px 28px 28px;font-family:${FONT};">
        <p style="margin:8px 0 6px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#5c6b80;">What happens next</p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#00122f;">1. We match the request to current ingot and deoxidation forms.</p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#00122f;">2. We reply to ${escapeHtml(clean(lead.email) || "you")} with feasibility and timing.</p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#00122f;">3. If the programme fits, we confirm grade, packing and price.</p>
        <p style="margin:0;font-size:12px;line-height:1.5;color:#6b778c;">Reference ${escapeHtml(lead.id)}</p>
      </div>`,
  });
}

function buyerText(lead: EnquiryEmailPayload) {
  const product = clean(lead.productInterest);
  return [
    `Thank you, ${clean(lead.name) || "there"}.`,
    "",
    product ? `We have your enquiry for ${product}.` : "We have your enquiry.",
    "The sales desk at the Kadi plant will reply within 1–2 business days.",
    "",
    `Reply to this email and it reaches ${SALES_EMAIL}.`,
    "",
    "What you sent",
    textLines([...enquiryPairs(lead), ["Notes", clean(lead.message)]]),
    "",
    "What happens next",
    "1. We match the request to current ingot and deoxidation forms.",
    "2. We reply with feasibility and timing.",
    "3. If the programme fits, we confirm grade, packing and price.",
    "",
    `Reference: ${lead.id}`,
    PLANT,
    siteOrigin(),
  ].join("\n");
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
  const replyInbox = opts.salesTo?.trim() || SALES_EMAIL;
  let salesSent = false;
  let buyerSent = false;

  if (replyInbox) {
    try {
      const who = clean(opts.lead.company) || clean(opts.lead.name) || "Buyer";
      const product = clean(opts.lead.productInterest) || "General";
      const { error } = await client.emails.send({
        from,
        to: replyInbox,
        replyTo: clean(opts.lead.email) || undefined,
        subject: `New enquiry — ${who} — ${product}`,
        html: salesHtml(opts.lead),
        text: salesText(opts.lead),
      });
      if (error) errors.push(`sales: ${error.message}`);
      else salesSent = true;
    } catch (err) {
      errors.push(`sales: ${err instanceof Error ? err.message : "send failed"}`);
    }
  } else {
    errors.push("No sales inbox configured (Company profile → sales email)");
  }

  const buyerTo = clean(opts.lead.email);
  if (buyerTo) {
    try {
      const product = clean(opts.lead.productInterest);
      const { error } = await client.emails.send({
        from,
        to: buyerTo,
        replyTo: replyInbox,
        subject: product
          ? `Enquiry received — ${product}`
          : `Enquiry received — ${siteConfig.name}`,
        html: buyerHtml(opts.lead),
        text: buyerText(opts.lead),
      });
      if (error) errors.push(`buyer: ${error.message}`);
      else buyerSent = true;
    } catch (err) {
      errors.push(`buyer: ${err instanceof Error ? err.message : "send failed"}`);
    }
  }

  return { salesSent, buyerSent, errors };
}
