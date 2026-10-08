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
const INK = "#202124";
const MUTED = "#5f6368";
const LINE = "#e8eaed";
const BLUE = "#0342ab";

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

function logoHtml() {
  const src = `${siteOrigin()}/brand/hg-alutek-logo.png`;
  return `<img src="${src}" width="168" height="100" alt="HG Alutek" style="display:block;border:0;outline:none;text-decoration:none;width:168px;height:auto;" />`;
}

function detailRows(pairs: Array<[string, string]>) {
  return pairs
    .filter(([, value]) => value.trim())
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:14px 20px 14px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:13px;line-height:1.4;color:${MUTED};vertical-align:top;width:132px;">${escapeHtml(label)}</td>
          <td style="padding:14px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:14px;line-height:1.5;color:${INK};vertical-align:top;">${escapeHtml(value)}</td>
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

function shell(opts: { preheader: string; body: string; footer: string }) {
  const preheader = escapeHtml(opts.preheader);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(siteConfig.name)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 20px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 28px;">
              <a href="${siteOrigin()}" style="text-decoration:none;">${logoHtml()}</a>
            </td>
          </tr>
          <tr>
            <td style="font-family:${FONT};color:${INK};">
              ${opts.body}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 0 0;border-top:1px solid ${LINE};font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
              ${opts.footer}
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
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px;">
      <tr>
        <td bgcolor="${BLUE}" style="background:${BLUE};border-radius:4px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:10px 18px;font-family:${FONT};font-size:14px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

function footerNote(kind: "sales" | "buyer", reference: string) {
  const reason =
    kind === "sales"
      ? "You received this because a visitor submitted the enquiry form on hgalutek.com."
      : "You received this because an enquiry was submitted with this email address.";
  return `${escapeHtml(siteConfig.name)}<br />${escapeHtml(PLANT)}<br /><a href="mailto:${SALES_EMAIL}" style="color:${BLUE};text-decoration:none;">${SALES_EMAIL}</a><br /><br />${reason}<br />Reference ${escapeHtml(reference)}`;
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
    footer: footerNote("sales", lead.id),
    body: `
      <h1 style="margin:0 0 12px;font-size:22px;line-height:28px;font-weight:400;color:${INK};">New enquiry</h1>
      <p style="margin:0 0 20px;font-size:14px;line-height:22px;color:${INK};">${escapeHtml(who)} asked about ${escapeHtml(product)}.</p>
      ${button(`mailto:${clean(lead.email)}`, `Reply to ${clean(lead.name) || "buyer"}`)}
      <p style="margin:28px 0 8px;font-size:14px;line-height:22px;font-weight:700;color:${INK};">Details</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${detailRows(enquiryPairs(lead))}
      </table>
      ${
        notes
          ? `<p style="margin:24px 0 8px;font-size:14px;line-height:22px;font-weight:700;color:${INK};">Message</p>
             <p style="margin:0 0 8px;font-size:14px;line-height:22px;color:${INK};white-space:pre-wrap;">${escapeHtml(notes)}</p>`
          : ""
      }
      <p style="margin:20px 0 0;font-size:12px;line-height:18px;color:${MUTED};">Source ${escapeHtml(clean(lead.source) || "website")} · ${escapeHtml(clean(lead.locale) || "en")}</p>`,
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
    footer: footerNote("buyer", lead.id),
    body: `
      <h1 style="margin:0 0 12px;font-size:22px;line-height:28px;font-weight:400;color:${INK};">We received your enquiry</h1>
      <p style="margin:0 0 12px;font-size:14px;line-height:22px;color:${INK};">Hello ${escapeHtml(clean(lead.name) || "there")},</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:22px;color:${INK};">
        ${product ? `We have your request for ${escapeHtml(product)}.` : "We have your request."}
        Sales at the Kadi plant will check grade, quantity and lead time, then reply within 1–2 business days.
      </p>
      <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:${INK};">
        Reply to this email and it goes to <a href="mailto:${SALES_EMAIL}" style="color:${BLUE};text-decoration:none;">${SALES_EMAIL}</a>.
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:22px;font-weight:700;color:${INK};">Your request</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${detailRows([
          ...enquiryPairs(lead).filter(([label]) => label !== "Email"),
          ["Notes", notes],
        ])}
      </table>
      <p style="margin:24px 0 8px;font-size:14px;line-height:22px;font-weight:700;color:${INK};">What happens next</p>
      <p style="margin:0;font-size:14px;line-height:22px;color:${INK};">We match the request to the current ingot and deoxidation forms. If it fits, the reply includes grade, packing and price.</p>`,
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
