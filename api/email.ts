/**
 * Shared email helper for all transactional emails.
 * Uses Resend's REST API directly (no SDK needed - keeps the
 * serverless function bundle smaller and avoids an extra dependency).
 *
 * All emails come from RESEND_FROM and use a consistent branded
 * HTML template. Plain-text fallback included in every email so
 * clients with text-only clients still get readable content.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? 'info@omasynergiestravel.com';
const PORTAL_URL = 'https://oma-synergies-web.vercel.app/portal';
const WHATSAPP = '0806 769 6464';

// ---- Base HTML template ----

function baseHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oma Synergies</title>
</head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#14152A;padding:24px 32px;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.12em;color:#F0B124;text-transform:uppercase;">OMA SYNERGIES</p>
            <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.06em;text-transform:uppercase;">Travels and Tours Ltd</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F7F6F3;padding:20px 32px;border-top:1px solid #E8E7E4;">
            <p style="margin:0;font-size:12px;color:#5B5F76;line-height:1.6;">
              Oma Synergies Travels and Tours Ltd<br>
              Block B8, 29/32 Utako Market Plaza, Abuja<br>
              WhatsApp: ${WHATSAPP} &nbsp;·&nbsp;
              <a href="mailto:info@omasynergiestravel.com" style="color:#5B5F76;">info@omasynergiestravel.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#14152A;line-height:1.3;">${text}</h1>`;
}
function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#5B5F76;line-height:1.7;">${text}</p>`;
}
function field(label: string, value: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td style="background:#F7F6F3;border-radius:8px;padding:12px 16px;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5B5F76;">${label}</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#14152A;font-family:monospace;">${value}</p>
        </td>
      </tr>
    </table>`;
}
function btn(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:8px;padding:14px 28px;background:#F0B124;color:#14152A;font-size:14px;font-weight:700;text-decoration:none;border-radius:100px;">${label}</a>`;
}
function divider() {
  return `<hr style="border:none;border-top:1px solid #E8E7E4;margin:24px 0;">`;
}

// ---- Email templates ----

export function welcomeEmail(opts: { firstName: string; email: string; tempPassword: string; serviceType: string }) {
  const { firstName, email, tempPassword, serviceType } = opts;
  const html = baseHtml(`
    ${h1(`Welcome, ${firstName}`)}
    ${p(`Your consultation with Oma Synergies has been confirmed. We've created your personal client portal where you can track your application progress at any time.`)}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#14152A;text-transform:uppercase;letter-spacing:0.08em;">Your Login Details</p>
    ${field('Portal', PORTAL_URL)}
    ${field('Email', email)}
    ${field('Temporary Password', tempPassword)}
    ${p(`<strong style="color:#14152A;">Please log in and change your password immediately.</strong> Your service type is recorded as <strong style="color:#14152A;">${serviceType}</strong>.`)}
    ${btn('Log In to Your Portal', PORTAL_URL)}
    ${divider()}
    ${p(`Your consultant will be in touch within 24 hours to begin your application. If you have any questions in the meantime, WhatsApp us on <strong style="color:#14152A;">${WHATSAPP}</strong>.`)}
  `);
  const text = `Welcome to Oma Synergies, ${firstName}.\n\nYour portal: ${PORTAL_URL}\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nQuestions? WhatsApp: ${WHATSAPP}`;
  return { subject: 'Welcome to Oma Synergies — Your Portal Access', html, text };
}

export function stageUpdateEmail(opts: { firstName: string; stage: string; clientMessage: string | null }) {
  const { firstName, stage, clientMessage } = opts;
  const stageFriendly = stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const html = baseHtml(`
    ${h1(`Application Update`)}
    ${p(`Hi ${firstName}, your application status has been updated.`)}
    ${field('New Status', stageFriendly)}
    ${clientMessage ? `${divider()}${p(`<strong style="color:#14152A;">Message from your consultant:</strong><br>${clientMessage}`)}` : ''}
    ${p(`Log in to your portal to see the full details and your document checklist.`)}
    ${btn('View Your Portal', PORTAL_URL)}
    ${divider()}
    ${p(`Questions? WhatsApp us on <strong style="color:#14152A;">${WHATSAPP}</strong>.`)}
  `);
  const text = `Hi ${firstName},\n\nYour application status has been updated to: ${stageFriendly}\n${clientMessage ? `\nMessage from your consultant: ${clientMessage}\n` : ''}\nView your portal: ${PORTAL_URL}\nQuestions? WhatsApp: ${WHATSAPP}`;
  return { subject: `Application Update: ${stageFriendly}`, html, text };
}

export function documentRejectedEmail(opts: { firstName: string; documentName: string; reason: string | null }) {
  const { firstName, documentName, reason } = opts;
  const html = baseHtml(`
    ${h1(`Document Update Required`)}
    ${p(`Hi ${firstName}, one of your documents needs attention.`)}
    ${field('Document', documentName)}
    ${field('Status', 'Rejected — please resubmit')}
    ${reason ? `${divider()}${p(`<strong style="color:#14152A;">Reason:</strong><br>${reason}`)}` : ''}
    ${p(`Please resubmit the corrected document through your portal as soon as possible to avoid delays to your application.`)}
    ${btn('Go to Document Centre', PORTAL_URL)}
    ${divider()}
    ${p(`Questions? WhatsApp us on <strong style="color:#14152A;">${WHATSAPP}</strong>.`)}
  `);
  const text = `Hi ${firstName},\n\nYour document "${documentName}" has been rejected and needs to be resubmitted.\n${reason ? `Reason: ${reason}\n` : ''}\nPlease log in and resubmit: ${PORTAL_URL}\nQuestions? WhatsApp: ${WHATSAPP}`;
  return { subject: `Action Required: Resubmit "${documentName}"`, html, text };
}

export function newMessageEmail(opts: { firstName: string; consultantName: string; messagePreview: string }) {
  const { firstName, consultantName, messagePreview } = opts;
  const html = baseHtml(`
    ${h1(`New Message from Your Consultant`)}
    ${p(`Hi ${firstName}, ${consultantName} has sent you a message regarding your application.`)}
    ${divider()}
    ${p(`<em style="color:#14152A;">"${messagePreview}${messagePreview.length > 120 ? '…' : ''}"</em>`)}
    ${divider()}
    ${p(`Log in to your portal to read the full message and reply.`)}
    ${btn('Read Message', PORTAL_URL)}
    ${divider()}
    ${p(`Or WhatsApp us directly on <strong style="color:#14152A;">${WHATSAPP}</strong>.`)}
  `);
  const text = `Hi ${firstName},\n\n${consultantName} sent you a message:\n"${messagePreview}"\n\nLog in to reply: ${PORTAL_URL}\nOr WhatsApp: ${WHATSAPP}`;
  return { subject: `New Message from ${consultantName}`, html, text };
}

export function newInquiryEmail(opts: { name: string; email: string; phone: string | null; service: string | null; destination: string | null; message: string | null }) {
  const { name, email, phone, service, destination, message } = opts;
  const html = baseHtml(`
    ${h1(`New Enquiry Received`)}
    ${p(`Someone has submitted the contact form on the website.`)}
    ${field('Name', name)}
    ${field('Email', email)}
    ${phone ? field('Phone', phone) : ''}
    ${service ? field('Service Interested In', service) : ''}
    ${destination ? field('Destination', destination) : ''}
    ${message ? `${divider()}${p(`<strong style="color:#14152A;">Message:</strong><br>${message}`)}` : ''}
    ${divider()}
    ${p(`Log in to the admin panel to view and respond to this enquiry.`)}
    ${btn('View in Admin Panel', 'https://oma-synergies-web.vercel.app/admin')}
  `);
  const text = `New enquiry from ${name} (${email})\n${phone ? `Phone: ${phone}\n` : ''}${service ? `Service: ${service}\n` : ''}${destination ? `Destination: ${destination}\n` : ''}${message ? `\nMessage: ${message}\n` : ''}\nView in admin: https://oma-synergies-web.vercel.app/admin`;
  return { subject: `New Enquiry: ${name}${service ? ` — ${service}` : ''}`, html, text };
}

// ---- Send function ----

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return { ok: false, error: 'Email service not configured' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Oma Synergies <${FROM}>`,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Resend error:', res.status, body);
    return { ok: false, error: `Resend ${res.status}: ${body}` };
  }

  return { ok: true };
}
