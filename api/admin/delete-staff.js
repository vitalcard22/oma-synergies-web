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

    // Only the Super Admin manages the team - matches the UI, which hides
    // the whole Staff & Roles page from anyone else.
    const { data: callerProfile } = await supabase
      .from('profiles').select('role, status').eq('id', callerData.user.id).single();
    if (!callerProfile || callerProfile.role !== 'super_admin') {
      res.status(403).json({ error: 'Only the Super Admin can remove staff accounts' }); return;
    }

    const staffId = (req.body || {}).staffId;
    if (!staffId) { res.status(400).json({ error: 'staffId required' }); return; }

    if (staffId === callerData.user.id) {
      res.status(400).json({ error: "You can't remove your own account" }); return;
    }

    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles').select('id, role, full_name').eq('id', staffId).single();
    if (targetError || !targetProfile) {
      res.status(404).json({ error: 'Staff member not found' }); return;
    }
    if (targetProfile.role === 'super_admin') {
      res.status(400).json({ error: 'Super Admin accounts cannot be removed here' }); return;
    }
    if (targetProfile.role === 'client') {
      res.status(400).json({ error: 'This is not a staff account' }); return;
    }

    // clients.created_by, messages.sender_id and consultant_reminders.consultant_id
    // all reference profiles WITHOUT "on delete cascade" AND are NOT NULL -
    // they can't just be cleared, and silently reassigning someone's authored
    // clients/messages/reminders to another admin would quietly rewrite who
    // actually did that work. Block with a clear reason instead of letting it
    // fail as a generic Postgres error, and tell the admin what their options
    // are rather than deleting.
    const [clientsMade, messagesSent, reminders] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('created_by', staffId),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', staffId),
      supabase.from('consultant_reminders').select('id', { count: 'exact', head: true }).eq('consultant_id', staffId),
    ]);
    for (const [label, result] of [['clients created', clientsMade], ['messages sent', messagesSent], ['reminders', reminders]]) {
      if (result.error) { res.status(500).json({ error: 'Delete failed: ' + result.error.message }); return; }
    }

    const blockers = [];
    if (clientsMade.count) blockers.push(`created ${clientsMade.count} client record${clientsMade.count === 1 ? '' : 's'}`);
    if (messagesSent.count) blockers.push(`sent ${messagesSent.count} message${messagesSent.count === 1 ? '' : 's'}`);
    if (reminders.count) blockers.push(`has ${reminders.count} reminder${reminders.count === 1 ? '' : 's'} on file`);
    if (blockers.length) {
      res.status(409).json({
        error: `Can't remove ${targetProfile.full_name} - they've ${blockers.join(', ')}, and deleting the account would break that history. Reassign their clients to another staff member first, or keep this account suspended instead of removing it.`
      });
      return;
    }

    // Safe to unlink everything else (all nullable) before deleting.
    const unlinkSteps = [
      supabase.from('profiles').update({ created_by: null }).eq('created_by', staffId),
      supabase.from('clients').update({ assigned_to: null }).eq('assigned_to', staffId),
      supabase.from('stage_history').update({ changed_by: null }).eq('changed_by', staffId),
      supabase.from('documents').update({ file_uploaded_by: null }).eq('file_uploaded_by', staffId),
      supabase.from('refunds').update({ requested_by: null }).eq('requested_by', staffId),
      supabase.from('refunds').update({ approved_by: null }).eq('approved_by', staffId),
      supabase.from('disputes').update({ handled_by: null }).eq('handled_by', staffId),
      supabase.from('audit_log').update({ admin_id: null }).eq('admin_id', staffId),
    ];
    for (const step of unlinkSteps) {
      const { error } = await step;
      if (error) { res.status(500).json({ error: 'Delete failed: ' + error.message }); return; }
    }

    const { error: consentError } = await supabase.from('consent_log').delete().eq('profile_id', staffId);
    if (consentError) { res.status(500).json({ error: 'Delete failed: ' + consentError.message }); return; }

    // Finally delete the auth user - cascades to the now-unblocked profiles row.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(staffId);
    if (deleteError) {
      res.status(500).json({ error: 'Delete failed: ' + deleteError.message }); return;
    }

    await supabase.from('audit_log').insert({
      admin_id: callerData.user.id, action: 'staff_deleted',
      target_table: 'profiles', target_id: staffId,
      detail: `Staff account permanently removed: ${targetProfile.full_name}`
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Exception: ' + (err && err.message ? err.message : String(err)) });
  }
};
