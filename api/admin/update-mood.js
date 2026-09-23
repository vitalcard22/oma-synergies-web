const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rxuylffiobkhmbyrmvlk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Fixed preset, kept in sync with MOOD_OPTIONS in src/pages/admin/Admin.tsx.
// Never trust/store arbitrary client-supplied text in this column - it's
// shown to other staff, so it's allow-listed here rather than freeform.
const ALLOWED_EMOJI = ['😊', '😐', '😫', '☕', '😴', '🎯'];

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
    if (!callerProfile || callerProfile.role === 'client') {
      res.status(403).json({ error: 'Staff access required' }); return;
    }
    if (callerProfile.status === 'suspended') {
      res.status(403).json({ error: 'Account suspended' }); return;
    }

    const emoji = (req.body || {}).emoji ?? null;
    if (emoji !== null && !ALLOWED_EMOJI.includes(emoji)) {
      res.status(400).json({ error: 'Invalid emoji' }); return;
    }

    // Scoped to the caller's own row only - staff can set their own mood,
    // never anyone else's, and this column is the only thing written.
    const { error: updateError } = await supabase
      .from('profiles').update({ mood_emoji: emoji }).eq('id', callerData.user.id);
    if (updateError) {
      res.status(500).json({ error: 'Update failed: ' + updateError.message }); return;
    }

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Exception: ' + (err && err.message ? err.message : String(err)) });
  }
};
