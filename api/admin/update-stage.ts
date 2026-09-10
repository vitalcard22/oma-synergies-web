import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { stageUpdateEmail, sendEmail } from '../email';

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
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? 'https://rxuylffiobkhmbyrmvlk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type ApplicationStage = Database['public']['Tables']['stage_history']['Row']['stage'];

interface UpdateStageBody {
  applicationId: string;
  newStage: ApplicationStage;
  clientVisibleMessage?: string;
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

  const body = req.body as Partial<UpdateStageBody>;
  if (!body.applicationId || !body.newStage) { res.status(400).json({ error: 'applicationId and newStage are required.' }); return; }

  // Update the application
  const { error: appError } = await supabaseAdmin
    .from('applications')
    .update({
      stage: body.newStage,
      stage_updated_at: new Date().toISOString(),
      ...(body.clientVisibleMessage !== undefined ? { client_visible_message: body.clientVisibleMessage } : {}),
    })
    .eq('id', body.applicationId);
  if (appError) { res.status(500).json({ error: appError.message }); return; }

  await supabaseAdmin.from('stage_history').insert({ application_id: body.applicationId, stage: body.newStage, changed_by: callerAuth.user.id });
  await supabaseAdmin.from('audit_log').insert({
    admin_id: callerAuth.user.id,
    action: 'stage_updated',
    target_table: 'applications',
    target_id: body.applicationId,
    detail: `Stage changed to "${body.newStage.replace(/_/g, ' ')}"`,
  });

  // Fetch client email and name to send notification
  const { data: app } = await supabaseAdmin.from('applications').select('client_id, client_visible_message').eq('id', body.applicationId).single();
  if (app) {
    const { data: client } = await supabaseAdmin.from('clients').select('profile_id').eq('id', app.client_id).single();
    if (client) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', client.profile_id).single();
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.profile_id);
      const clientEmail = authUser?.user?.email;
      const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
      if (clientEmail) {
        const emailContent = stageUpdateEmail({
          firstName,
          stage: body.newStage,
          clientMessage: body.clientVisibleMessage ?? app.client_visible_message ?? null,
        });
        sendEmail({ to: clientEmail, ...emailContent }).catch((err) => console.error('Stage email failed:', err));
      }
    }
  }

  res.status(200).json({ success: true });
}
