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
            return { application_id: appRow.id, document_name: r.document_name, is_mandatory: r.required, status: 'required' };
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

    res.status(200).json({ success: true, tempPassword: tempPassword, documentsPopulated: documentsPopulated });

  } catch(err) {
    res.status(500).json({ error: 'Exception: ' + (err && err.message ? err.message : String(err)) });
  }
};
