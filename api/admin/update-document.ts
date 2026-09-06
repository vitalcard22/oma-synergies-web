import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { documentRejectedEmail, sendEmail } from '../email';

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

type DocumentStatus = Database['public']['Tables']['documents']['Row']['status'];

interface UpdateDocumentBody {
  documentId: string;
  status: DocumentStatus;
  rejectionReason?: string;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;
  if (!token) { res.status(401).json({ error: 'Missing authorization token.' }); return; }

  const { data: callerAuth, error: callerAuthError } = await supabaseAdmin.auth.getUser(token);
  if (callerAuthError || !callerAuth.user) { res.status(401).json({ error: 'Invalid or expired session.' }); return; }

  const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role, status').eq('id', callerAuth.user.id).single();
  if (!callerProfile || callerProfile.status === 'suspended') { res.status(403).json({ error: 'Access denied.' }); return; }
  if (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin') { res.status(403).json({ error: 'Access denied.' }); return; }

  const body = req.body as Partial<UpdateDocumentBody>;
  if (!body.documentId || !body.status) { res.status(400).json({ error: 'documentId and status are required.' }); return; }

  const { error: updateError } = await supabaseAdmin
    .from('documents')
    .update({
      status: body.status,
      rejection_reason: body.status === 'rejected' ? (body.rejectionReason ?? null) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.documentId);
  if (updateError) { res.status(500).json({ error: updateError.message }); return; }

  // Only send email on rejection
  if (body.status === 'rejected') {
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('document_name, application_id')
      .eq('id', body.documentId)
      .single();

    if (doc) {
      const { data: app } = await supabaseAdmin.from('applications').select('client_id').eq('id', doc.application_id).single();
      if (app) {
        const { data: client } = await supabaseAdmin.from('clients').select('profile_id').eq('id', app.client_id).single();
        if (client) {
          const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', client.profile_id).single();
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.profile_id);
          const clientEmail = authUser?.user?.email;
          const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
          if (clientEmail) {
            const emailContent = documentRejectedEmail({
              firstName,
              documentName: doc.document_name,
              reason: body.rejectionReason ?? null,
            });
            sendEmail({ to: clientEmail, ...emailContent }).catch((err) => console.error('Document rejected email failed:', err));
          }
        }
      }
    }
  }

  res.status(200).json({ success: true });
}
