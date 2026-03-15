/**
 * ══════════════════════════════════════════════════════════════
 * CONVERTIX.WORK — Serverless Email Handler
 * File: api/send-email.js
 *
 * Deploy on: Vercel (zero-config) or any Node.js serverless env.
 * Uses: Resend API (https://resend.com) to send form emails.
 *
 * Setup:
 *  1. Create a free account at https://resend.com
 *  2. Get your API key from the Resend dashboard
 *  3. Add it as an environment variable:
 *       RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
 *  4. Verify your sending domain (or use onboarding@resend.dev for testing)
 *
 * The API key is NEVER exposed in frontend code — only this
 * server-side file reads process.env.RESEND_API_KEY.
 * ══════════════════════════════════════════════════════════════
 */

export default async function handler(req, res) {

  /* ── CORS headers (allow requests from the same origin) ── */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  /* ── Read the Resend API key securely from env ─────────── */
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('[Convertix] RESEND_API_KEY environment variable is not set.');
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  /* ── Extract form fields from request body ─────────────── */
  const {
    formType = 'Unknown Form',
    name = '',
    email = '',
    phone = '',
    city = '',
    state = '',
    jobCategory = '',
    workTrack = '',
    membershipPlan = 'None',
    subject = '',
    message = ''
  } = req.body || {};

  // Basic validation — name and email are required
  if (!name.trim() || !email.trim()) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  /* ── Build the HTML email body ──────────────────────────── */
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f6f8fc; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0d1b2a, #1a2c42); padding: 28px 32px; }
    .header h1 { color: #e8b84b; font-size: 22px; margin: 0; font-family: Georgia, serif; }
    .header p { color: rgba(255,255,255,0.6); font-size: 13px; margin: 6px 0 0; }
    .body { padding: 28px 32px; }
    .badge { display: inline-block; background: #fdf3df; color: #c9992a; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
    .row { margin-bottom: 16px; }
    .label { font-size: 11px; font-weight: 700; color: #5f7285; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1e2d3d; font-weight: 500; }
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
    .message-box { background: #f6f8fc; border-radius: 8px; padding: 16px; font-size: 14px; color: #1e2d3d; line-height: 1.7; }
    .footer { background: #0d1b2a; padding: 20px 32px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; }
    .highlight { background: linear-gradient(135deg, #fdf3df, #fff8ec); border: 1.5px solid rgba(201,153,42,0.3); border-radius: 8px; padding: 14px 16px; margin-top: 16px; }
    .highlight p { font-size: 13px; color: #7a5010; font-weight: 600; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Convertix.work</h1>
      <p>New submission received from your website</p>
    </div>
    <div class="body">
      <div class="badge">📩 ${formType}</div>

      <div class="row"><div class="label">Full Name</div><div class="value">${name}</div></div>
      <div class="row"><div class="label">Email Address</div><div class="value">${email}</div></div>
      ${phone ? `<div class="row"><div class="label">Phone Number</div><div class="value">${phone}</div></div>` : ''}
      ${city ? `<div class="row"><div class="label">City / State</div><div class="value">${city}${state ? `, ${state}` : ''}</div></div>` : ''}
      ${jobCategory ? `<div class="row"><div class="label">Preferred Job Category</div><div class="value">${jobCategory}</div></div>` : ''}
      ${workTrack ? `<div class="row"><div class="label">Work Track Selected</div><div class="value">${workTrack}</div></div>` : ''}
      ${subject ? `<div class="row"><div class="label">Subject</div><div class="value">${subject}</div></div>` : ''}

      <div class="divider"></div>

      ${membershipPlan && membershipPlan !== 'None' && membershipPlan !== 'N/A' ? `
        <div class="highlight">
          <p>💎 Membership Plan Selected: <strong>${membershipPlan === '3months' ? '3 Months — ₹499' :
        membershipPlan === '6months' ? '6 Months — ₹999' :
          membershipPlan === '1year' ? '1 Year — ₹1,999' :
            membershipPlan
      }</strong></p>
        </div>
      ` : ''}

      ${message ? `
        <div class="row" style="margin-top:16px">
          <div class="label">Message</div>
          <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>© 2025 Convertix.work · This email was generated automatically from your website contact form.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  /* ── Call Resend API ────────────────────────────────────── */
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // IMPORTANT: Replace 'onboarding@resend.dev' with your verified
        // sender domain once you set up domain verification in Resend.
        from: 'Convertix.work <onboarding@resend.dev>',
        to: ['checkmymood07@gmail.com'],          // recipient
        reply_to: email,                                // reply goes back to submitter
        subject: `[Convertix] New ${formType} — ${name}`,
        html: emailHtml
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Convertix] Resend API error:', resendData);
      return res.status(502).json({ error: 'Failed to send email', details: resendData });
    }

    console.log('[Convertix] Email sent successfully. ID:', resendData.id);
    return res.status(200).json({ ok: true, id: resendData.id });

  } catch (err) {
    console.error('[Convertix] Network error calling Resend:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}