const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rxuylffiobkhmbyrmvlk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
      res.status(401).json({ error: 'Invalid session' }); return;
    }

    const { data: callerProfile } = await supabase
      .from('profiles').select('role, status').eq('id', callerData.user.id).single();
    if (!callerProfile || (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin')) {
      res.status(403).json({ error: 'Staff access required' }); return;
    }

    const clientId = (req.body || {}).clientId;
    if (!clientId) { res.status(400).json({ error: 'clientId required' }); return; }

    // Get the client's profile_id (auth user ID)
    const { data: clientRow, error: clientError } = await supabase
      .from('clients').select('id, profile_id').eq('id', clientId).single();
    if (clientError || !clientRow) {
      res.status(404).json({ error: 'Client not found' }); return;
    }

    // Delete the auth user — cascades through profiles, clients, applications, documents, messages
    const { error: deleteError } = await supabase.auth.admin.deleteUser(clientRow.profile_id);
    if (deleteError) {
      res.status(500).json({ error: 'Delete failed: ' + deleteError.message }); return;
    }

    await supabase.from('audit_log').insert({
      admin_id: callerData.user.id, action: 'client_deleted',
      target_table: 'clients', target_id: clientId,
      detail: 'Client account permanently deleted'
    });

    res.status(200).json({ success: true });

  } catch(err) {
    res.status(500).json({ error: 'Exception: ' + (err && err.message ? err.message : String(err)) });
  }
};
