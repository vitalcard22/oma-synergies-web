import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://rxuylffiobkhmbyrmvlk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export default async function handler(req: any, res: any) {
  // Catch everything and return it as JSON so we can see exactly what's failing
  try {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const token = (req.headers.authorization ?? '').replace('Bearer ', '');
    if (!token) { res.status(401).json({ error: 'Missing token' }); return; }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify caller
    const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !callerData?.user) {
      res.status(401).json({ error: 'Invalid session: ' + (callerError?.message ?? 'no user') }); return;
    }

    const { data: callerProfile } = await supabase
      .from('profiles').select('role, status').eq('id', callerData.user.id).single();
    if (!callerProfile) { res.status(403).json({ error: 'No profile found for caller' }); return; }
    if (callerProfile.status === 'suspended') { res.status(403).json({ error: 'Account suspended' }); return; }
    if (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin') {
      res.status(403).json({ error: 'Staff access required, got: ' + callerProfile.role }); return;
    }

    const { fullName, email, phone, serviceType, destination } = req.body ?? {};
    if (!fullName || !email || !serviceType) {
      res.status(400).json({ error: 'fullName, email, serviceType required' }); return;
    }

    // Generate temp password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPassword = '';
    for (let i = 0; i < 10; i++) tempPassword += chars[Math.floor(Math.random() * chars.length)];
    tempPassword += '#' + Math.floor(Math.random() * 90 + 10);

    // Create auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email, password: tempPassword, email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (createError || !newUser?.user) {
      res.status(400).json({ error: 'createUser failed: ' + (createError?.message ?? 'unknown') }); return;
    }

    const userId = newUser.user.id;

    // Create profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId, full_name: fullName, role: 'client', status: 'active'
    });
    if (profileError) {
      res.status(500).json({ error: 'profile upsert failed: ' + profileError.message }); return;
    }

    // Create client record
    const { data: clientRow, error: clientError } = await supabase
      .from('clients')
      .insert({ profile_id: userId, service_type: serviceType, phone: phone ?? null })
      .select('id').single();
    if (clientError || !clientRow) {
      res.status(500).json({ error: 'client insert failed: ' + (clientError?.message ?? 'no row') }); return;
    }

    // Create application
    const { data: appRow, error: appError } = await supabase
      .from('applications')
      .insert({
        client_id: clientRow.id, service_type: serviceType,
        destination: destination ?? null, stage: 'documents_requested',
        stage_updated_at: new Date().toISOString()
      })
      .select('id').single();
    if (appError) {
      res.status(500).json({ error: 'application insert failed: ' + appError.message }); return;
    }

    // Document checklist
    let documentsPopulated = 0;
    if (appRow) {
      const { data: reqs } = await supabase
        .from('document_requirements').select('document_name, is_mandatory')
        .eq('service_type', serviceType);
      if (reqs && reqs.length > 0) {
        await supabase.from('documents').insert(
          reqs.map((r: any) => ({
            application_id: appRow.id, document_name: r.document_name,
            is_mandatory: r.is_mandatory, status: 'required'
          }))
        );
        documentsPopulated = reqs.length;
      }
    }

    // Audit log
    await supabase.from('audit_log').insert({
      admin_id: callerData.user.id, action: 'client_created',
      target_table: 'clients', target_id: clientRow.id,
      detail: `Registered ${fullName} (${email}) for ${serviceType}`
    });

    // Welcome email (non-blocking)
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
          html: `<p>Hi ${firstName},</p><p>Portal: <a href="${portalUrl}">${portalUrl}</a></p><p>Email: ${email}<br>Password: ${tempPassword}</p><p>Please change your password after first login.</p>`,
          text: `Hi ${firstName},\n\nPortal: ${portalUrl}\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease change your password after first login.`
        })
      }).catch(() => {});
    }

    res.status(200).json({ success: true, tempPassword, documentsPopulated });

  } catch (err: any) {
    // Return the actual error so we can see what's crashing
    res.status(500).json({
      error: 'Unhandled exception',
      message: err?.message ?? String(err),
      stack: err?.stack?.split('\n').slice(0, 5).join(' | ')
    });
  }
}
