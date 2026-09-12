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

    const { documentId, fileName, fileBase64, mimeType } = req.body || {};
    if (!documentId || !fileBase64 || !mimeType) {
      res.status(400).json({ error: 'documentId, fileBase64, mimeType required' }); return;
    }

    // Verify the document belongs to this client via join
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, application_id, status, file_url, applications!inner(client_id, clients!inner(profile_id))')
      .eq('id', documentId)
      .single();

    if (docError || !doc) { res.status(404).json({ error: 'Document not found' }); return; }

    const profileId = doc.applications && doc.applications.clients && doc.applications.clients.profile_id;
    if (profileId !== callerData.user.id) {
      res.status(403).json({ error: 'Not authorised' }); return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(mimeType)) {
      res.status(400).json({ error: 'Only PDF, JPEG, PNG and WebP supported' }); return;
    }

    const fileBuffer = Buffer.from(fileBase64, 'base64');
    if (fileBuffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'File must be under 10MB' }); return;
    }

    const ext = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1].replace('jpeg', 'jpg');
    const storagePath = doc.application_id + '/' + documentId + '-' + Date.now() + '.' + ext;
    const previousUrl = doc.file_url || null;

    const { error: uploadError } = await supabase.storage
      .from('client-documents')
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

    if (uploadError) { res.status(500).json({ error: 'Upload failed: ' + uploadError.message }); return; }

    const { data: urlData } = supabase.storage.from('client-documents').getPublicUrl(storagePath);

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        file_url: urlData.publicUrl,
        file_uploaded_by: callerData.user.id,
        file_uploaded_at: new Date().toISOString(),
        status: 'pending',
        previous_version_url: previousUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (updateError) { res.status(500).json({ error: 'Uploaded but record update failed: ' + updateError.message }); return; }

    res.status(200).json({ success: true, fileUrl: urlData.publicUrl });

  } catch (err) {
    res.status(500).json({ error: 'Exception: ' + (err && err.message ? err.message : String(err)) });
  }
};
