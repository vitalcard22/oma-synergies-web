import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';

interface VercelReq {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}
interface VercelRes {
  status(code: number): VercelRes;
  json(body: unknown): void;
  end(): void;
}

const supabaseAdmin = createClient<Database>(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface UploadPhotoBody {
  tourId: string;
  fileName: string;      // e.g. "dubai.jpg"
  fileBase64: string;    // base64-encoded file content
  mimeType: string;      // e.g. "image/jpeg"
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // Verify caller is a genuine admin
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;
  if (!token) { res.status(401).json({ error: 'Missing authorization token.' }); return; }

  const { data: callerAuth, error: callerAuthError } = await supabaseAdmin.auth.getUser(token);
  if (callerAuthError || !callerAuth.user) { res.status(401).json({ error: 'Invalid or expired session.' }); return; }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles').select('role, status').eq('id', callerAuth.user.id).single();
  if (!callerProfile || callerProfile.status === 'suspended') { res.status(403).json({ error: 'Access denied.' }); return; }
  if (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin') {
    res.status(403).json({ error: 'Only staff accounts can upload photos.' }); return;
  }

  const body = req.body as Partial<UploadPhotoBody>;
  if (!body.tourId || !body.fileName || !body.fileBase64 || !body.mimeType) {
    res.status(400).json({ error: 'tourId, fileName, fileBase64, and mimeType are required.' }); return;
  }

  // Validate file type
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(body.mimeType)) {
    res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are supported.' }); return;
  }

  // Convert base64 to Buffer
  const fileBuffer = Buffer.from(body.fileBase64, 'base64');

  // Max 5MB
  if (fileBuffer.length > 5 * 1024 * 1024) {
    res.status(400).json({ error: 'Photo must be under 5MB.' }); return;
  }

  // Use tourId as the filename so re-uploading replaces the old photo
  const ext = body.mimeType.split('/')[1].replace('jpeg', 'jpg');
  const storagePath = `${body.tourId}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('tour-photos')
    .upload(storagePath, fileBuffer, {
      contentType: body.mimeType,
      upsert: true, // replace if exists
    });

  if (uploadError) {
    res.status(500).json({ error: `Upload failed: ${uploadError.message}` }); return;
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage.from('tour-photos').getPublicUrl(storagePath);
  const photoUrl = urlData.publicUrl;

  // Save the URL back to the tour_packages row
  const { error: updateError } = await supabaseAdmin
    .from('tour_packages')
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq('id', body.tourId);

  if (updateError) {
    res.status(500).json({ error: `Photo uploaded but failed to save URL: ${updateError.message}` }); return;
  }

  res.status(200).json({ success: true, photoUrl });
}
