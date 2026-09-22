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
    const profileId = clientRow.profile_id;

    // A handful of tables reference clients/profiles WITHOUT "on delete cascade"
    // (refunds -> payments, disputes/testimonials/contact_submissions -> clients,
    // consent_log -> profiles). Deleting the auth user directly trips those
    // foreign keys, and Supabase only ever surfaces it as a generic
    // "Database error deleting user". Clear those first, in dependency order,
    // then let the normal cascades handle everything else.

    const { data: pays, error: paysError } = await supabase.from('payments').select('id').eq('client_id', clientId);
    if (paysError) { res.status(500).json({ error: 'Delete failed: ' + paysError.message }); return; }
    const paymentIds = (pays || []).map((p) => p.id);
    if (paymentIds.length) {
      const { error: refundsError } = await supabase.from('refunds').delete().in('payment_id', paymentIds);
      if (refundsError) { res.status(500).json({ error: 'Delete failed: ' + refundsError.message }); return; }
    }

    const { error: disputesError } = await supabase.from('disputes').delete().eq('client_id', clientId);
    if (disputesError) { res.status(500).json({ error: 'Delete failed: ' + disputesError.message }); return; }

    // Keep testimonials and converted contact submissions as historical records —
    // just unlink them from the client being removed instead of deleting them.
    const { error: testimonialsError } = await supabase.from('testimonials').update({ client_id: null }).eq('client_id', clientId);
    if (testimonialsError) { res.status(500).json({ error: 'Delete failed: ' + testimonialsError.message }); return; }

    const { error: contactError } = await supabase.from('contact_submissions').update({ converted_client_id: null }).eq('converted_client_id', clientId);
    if (contactError) { res.status(500).json({ error: 'Delete failed: ' + contactError.message }); return; }

    const { error: consentError } = await supabase.from('consent_log').delete().eq('profile_id', profileId);
    if (consentError) { res.status(500).json({ error: 'Delete failed: ' + consentError.message }); return; }

    // Now safe to remove the client record itself — cascades through
    // applications, stage_history, documents, messages, consultant_reminders, payments.
    const { error: clientDeleteError } = await supabase.from('clients').delete().eq('id', clientId);
    if (clientDeleteError) { res.status(500).json({ error: 'Delete failed: ' + clientDeleteError.message }); return; }

    // Finally delete the auth user — cascades to the now-unblocked profiles row.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(profileId);
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
