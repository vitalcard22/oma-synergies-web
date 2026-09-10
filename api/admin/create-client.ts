import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://rxuylffiobkhmbyrmvlk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + '#' + Math.floor(Math.random() * 90 + 10);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // Verify caller token
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Missing token.' }); return; }

  const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
  if (callerError || !callerData?.user) { res.status(401).json({ error: 'Invalid session.' }); return; }

  const { data: callerProfile } = await supabase
    .from('profiles').select('role, status').eq('id', callerData.user.id).single();
  if (!callerProfile || callerProfile.status === 'suspended') { res.status(403).json({ error: 'Access denied.' }); return; }
  if (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin') {
    res.status(403).json({ error: 'Staff access required.' }); return;
  }

  const { fullName, email, phone, serviceType, destination } = req.body ?? {};
  if (!fullName || !email || !serviceType) {
    res.status(400).json({ error: 'Full name, email, and service type are required.' }); return;
  }

  const tempPassword = generatePassword();

  // Create the auth user
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });
  if (createError || !newUser?.user) {
    res.status(400).json({ error: createError?.message ?? 'Could not create user account.' }); return;
  }

  const userId = newUser.user.id;

  // Create profile
  await supabase.from('profiles').upsert({
    id: userId, full_name: fullName, role: 'client', status: 'active'
  });

  // Create client record
  const { data: clientRow, error: clientError } = await supabase
    .from('clients')
    .insert({ profile_id: userId, service_type: serviceType, phone: phone ?? null })
    .select('id').single();
  if (clientError || !clientRow) {
    res.status(500).json({ error: 'Account created but client record failed: ' + (clientError?.message ?? '') }); return;
  }

  // Create application
  const { data: appRow } = await supabase
    .from('applications')
    .insert({
      client_id: clientRow.id,
      service_type: serviceType,
      destination: destination ?? null,
      stage: 'documents_requested',
      stage_updated_at: new Date().toISOString()
    })
    .select('id').single();

  // Populate document checklist from template
  let documentsPopulated = 0;
  if (appRow) {
    const { data: requirements } = await supabase
      .from('document_requirements')
      .select('document_name, is_mandatory')
      .eq('service_type', serviceType);
    if (requirements && requirements.length > 0) {
      await supabase.from('documents').insert(
        requirements.map((r) => ({
          application_id: appRow.id,
          document_name: r.document_name,
          is_mandatory: r.is_mandatory,
          status: 'required'
        }))
      );
      documentsPopulated = requirements.length;
    }
  }

  // Audit log
  await supabase.from('audit_log').insert({
    admin_id: callerData.user.id,
    action: 'client_created',
    target_table: 'clients',
    target_id: clientRow.id,
    detail: `Registered ${fullName} (${email}) for ${serviceType}`
  });

  // Send welcome email (non-blocking)
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (RESEND_KEY) {
    const firstName = fullName.split(' ')[0];
    const portalUrl = 'https://oma-synergies-web.vercel.app/portal';
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: `Oma Synergies <${process.env.RESEND_FROM ?? 'info@omasynergiestravel.com'}>`,
        to: [email],
        subject: 'Welcome to Oma Synergies — Your Portal Access',
        html: `<p>Hi ${firstName},</p><p>Your portal is ready. Log in at <a href="${portalUrl}">${portalUrl}</a></p><p>Email: ${email}<br>Password: ${tempPassword}</p><p>Please change your password after logging in.</p><p>— Oma Synergies Team</p>`,
        text: `Hi ${firstName},\n\nYour portal is ready: ${portalUrl}\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease change your password after logging in.\n\n— Oma Synergies Team`
      })
    }).catch(() => {/* non-critical */});
  }

  res.status(200).json({ success: true, tempPassword, documentsPopulated });
}
