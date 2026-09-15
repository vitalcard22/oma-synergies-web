const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rxuylffiobkhmbyrmvlk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + '#' + Math.floor(Math.random() * 90 + 10);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) { res.status(401).json({ error: 'Missing token' }); return; }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !callerData || !callerData.user) {
      res.status(401).json({ error: 'Invalid session: ' + (callerError ? callerError.message : 'no user') });
      return;
    }

    const { data: callerProfile } = await supabase
      .from('profiles').select('role, status').eq('id', callerData.user.id).single();
    if (!callerProfile) { res.status(403).json({ error: 'No profile found' }); return; }
    if (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin') {
      res.status(403).json({ error: 'Staff access required, role: ' + callerProfile.role }); return;
    }

    const body = req.body || {};
    const fullName = body.fullName;
    const email = body.email;
    const phone = body.phone || null;
    const serviceType = body.serviceType;
    const destination = body.destination || null;

    if (!fullName || !email || !serviceType) {
      res.status(400).json({ error: 'fullName, email and serviceType required' }); return;
    }

    const tempPassword = generatePassword();

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email, password: tempPassword, email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createError || !newUser || !newUser.user) {
      res.status(400).json({ error: 'createUser failed: ' + (createError ? createError.message : 'no user returned') });
      return;
    }

    const userId = newUser.user.id;

    await supabase.from('profiles').upsert({ id: userId, full_name: fullName, role: 'client', status: 'active' });

    const { data: clientRow, error: clientError } = await supabase
      .from('clients')
      .insert({ profile_id: userId, service_type: serviceType, phone: phone, created_by: callerData.user.id })
      .select('id').single();

    if (clientError || !clientRow) {
      res.status(500).json({ error: 'client insert failed: ' + (clientError ? clientError.message : 'no row') });
      return;
    }

    const { data: appRow } = await supabase
      .from('applications')
      .insert({
        client_id: clientRow.id, service_type: serviceType,
        destination: destination, stage: 'documents_requested',
        stage_updated_at: new Date().toISOString()
      })
      .select('id').single();

    let documentsPopulated = 0;
    if (appRow) {
      const { data: reqs } = await supabase
        .from('document_requirements').select('document_name, required')
        .eq('service_type', serviceType);
      if (reqs && reqs.length > 0) {
        await supabase.from('documents').insert(
          reqs.map(function(r) {
            return { application_id: appRow.id, document_name: r.document_name, status: 'required' };
          })
        );
        documentsPopulated = reqs.length;
      }
    }

    await supabase.from('audit_log').insert({
      admin_id: callerData.user.id, action: 'client_created',
      target_table: 'clients', target_id: clientRow.id,
      detail: 'Registered ' + fullName + ' (' + email + ') for ' + serviceType
    });

    // Send welcome email via Resend
    var RESEND_KEY = process.env.RESEND_API_KEY;
    var FROM = process.env.RESEND_FROM || 'info@omasynergiestravel.com';
    var emailResult = { sent: false, error: null };
    if (RESEND_KEY) {
      var firstName = fullName.split(' ')[0];
      var portalUrl = 'https://www.omasynergiestravel.com/portal';
      var whatsapp = '0806 769 6464';

      var htmlBody = '<!DOCTYPE html>'
        + '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
        + '<body style="margin:0;padding:0;background:#F4F5F8;font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F8;padding:32px 0;">'
        + '<tr><td align="center">'
        + '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">'

        // Header
        + '<tr><td style="background:#14152A;padding:28px 36px;">'
        + '<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#F0B124;text-transform:uppercase;">OMA SYNERGIES</p>'
        + '<p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.45);letter-spacing:0.04em;">Travels and Tours Ltd</p>'
        + '</td></tr>'

        // Gold accent bar
        + '<tr><td style="height:3px;background:linear-gradient(90deg,#F0B124,#F6C863);"></td></tr>'

        // Body
        + '<tr><td style="padding:36px 36px 28px;">'
        + '<h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#14152A;letter-spacing:-0.01em;">Welcome, ' + firstName + '.</h1>'
        + '<p style="margin:0 0 22px;font-size:15px;color:#5B5F76;line-height:1.7;">Your application with Oma Synergies Travels and Tours Ltd has been registered. Your personal client portal is now active — use it to track your application, upload documents, and communicate directly with your consultant.</p>'

        // Credentials box
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F8;border-radius:8px;margin-bottom:24px;">'
        + '<tr><td style="padding:20px 22px;">'
        + '<p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#8B90A8;text-transform:uppercase;">Your Login Details</p>'
        + '<table width="100%" cellpadding="0" cellspacing="0">'
        + '<tr><td style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.06);">'
        + '<span style="font-size:12px;color:#8B90A8;font-weight:500;">Portal</span>'
        + '<br><a href="' + portalUrl + '" style="font-size:14px;color:#14152A;font-weight:600;text-decoration:none;">' + portalUrl + '</a>'
        + '</td></tr>'
        + '<tr><td style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.06);">'
        + '<span style="font-size:12px;color:#8B90A8;font-weight:500;">Email</span>'
        + '<br><span style="font-size:14px;color:#14152A;font-weight:600;">' + email + '</span>'
        + '</td></tr>'
        + '<tr><td style="padding:8px 0;">'
        + '<span style="font-size:12px;color:#8B90A8;font-weight:500;">Temporary password</span>'
        + '<br><span style="font-size:15px;color:#14152A;font-weight:700;font-family:\'Courier New\',monospace;letter-spacing:0.05em;">' + tempPassword + '</span>'
        + '</td></tr>'
        + '</table>'
        + '</td></tr></table>'

        // CTA button
        + '<table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">'
        + '<tr><td style="background:#F0B124;border-radius:100px;padding:14px 28px;">'
        + '<a href="' + portalUrl + '" style="font-size:14px;font-weight:700;color:#14152A;text-decoration:none;">Log in to your portal →</a>'
        + '</td></tr></table>'

        + '<p style="margin:0 0 6px;font-size:14px;color:#5B5F76;line-height:1.7;"><strong style="color:#14152A;">Important:</strong> Please log in and change your password immediately. Your credentials are private — do not share them.</p>'
        + '<p style="margin:0;font-size:14px;color:#5B5F76;line-height:1.7;">Your consultant will be in touch with you shortly to begin your application process. If you have any questions in the meantime, WhatsApp us on <strong style="color:#14152A;">' + whatsapp + '</strong>.</p>'
        + '</td></tr>'

        // Footer
        + '<tr><td style="background:#F4F5F8;padding:20px 36px;border-top:1px solid #E8E7E4;">'
        + '<p style="margin:0;font-size:12px;color:#8B90A8;line-height:1.7;">'
        + 'Oma Synergies Travels and Tours Ltd<br>'
        + 'Block B8, 29/32 Utako Market Plaza, Abuja<br>'
        + 'WhatsApp: ' + whatsapp + ' &nbsp;·&nbsp; <a href="mailto:info@omasynergiestravel.com" style="color:#8B90A8;">info@omasynergiestravel.com</a>'
        + '</p>'
        + '</td></tr>'
        + '</table>'
        + '</td></tr></table>'
        + '</body></html>';

      var textBody = 'Welcome, ' + firstName + '.\n\n'
        + 'Your application with Oma Synergies Travels and Tours Ltd has been registered.\n\n'
        + 'YOUR LOGIN DETAILS\n'
        + 'Portal:    ' + portalUrl + '\n'
        + 'Email:     ' + email + '\n'
        + 'Password:  ' + tempPassword + '\n\n'
        + 'Please log in and change your password immediately.\n\n'
        + 'Your consultant will be in touch with you shortly.\n'
        + 'Questions? WhatsApp: ' + whatsapp + '\n\n'
        + 'Oma Synergies Travels and Tours Ltd\n'
        + 'Block B8, 29/32 Utako Market Plaza, Abuja\n'
        + 'info@omasynergiestravel.com';
      try {
        var emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RESEND_KEY },
          body: JSON.stringify({
            from: 'Oma Synergies Travels and Tours Ltd <' + FROM + '>',
            to: [email],
            subject: 'Welcome to Oma Synergies — Your Portal is Ready',
            html: htmlBody,
            text: textBody
          })
        });
        var emailData = await emailRes.json();
        if (emailRes.ok) {
          emailResult = { sent: true, id: emailData.id };
        } else {
          emailResult = { sent: false, error: emailData.message || JSON.stringify(emailData) };
        }
      } catch(emailErr) {
        emailResult = { sent: false, error: emailErr.message };
      }
    } else {
      emailResult = { sent: false, error: 'RESEND_API_KEY not set' };
    }

    res.status(200).json({ success: true, clientId: clientRow.id, tempPassword: tempPassword, documentsPopulated: documentsPopulated, emailResult: emailResult });

  } catch(err) {
    res.status(500).json({ error: 'Exception: ' + (err && err.message ? err.message : String(err)) });
  }
};
