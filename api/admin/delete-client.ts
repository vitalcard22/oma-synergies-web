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

interface DeleteClientBody {
  clientId: string;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ---- Same admin verification as create-client.ts ----
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token.' });
    return;
  }

  const { data: callerAuth, error: callerAuthError } = await supabaseAdmin.auth.getUser(token);
  if (callerAuthError || !callerAuth.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', callerAuth.user.id)
    .single();

  if (callerProfileError || !callerProfile) {
    res.status(403).json({ error: 'No matching profile for this session.' });
    return;
  }
  if (callerProfile.status === 'suspended') {
    res.status(403).json({ error: 'This account has been suspended.' });
    return;
  }
  if (callerProfile.role !== 'super_admin' && callerProfile.role !== 'staff_admin') {
    res.status(403).json({ error: 'Only staff accounts can delete clients.' });
    return;
  }

  // ---- Validate input, look up the client ----
  const body = req.body as Partial<DeleteClientBody>;
  const clientId = body.clientId?.trim();
  if (!clientId) {
    res.status(400).json({ error: 'clientId is required.' });
    return;
  }

  const { data: clientRow, error: clientLookupError } = await supabaseAdmin
    .from('clients')
    .select('id, profile_id')
    .eq('id', clientId)
    .single();

  if (clientLookupError || !clientRow) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }

  const { data: clientProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', clientRow.profile_id)
    .single();

  // ---- Get the client's own email before deletion (for the audit record) ----
  const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(clientRow.profile_id);
  const clientEmail = authUserData?.user?.email ?? 'unknown';

  // ---- Unlink (don't cascade-delete) testimonials and disputes ----
  // Both reference client_id WITHOUT on delete cascade in the schema, on
  // purpose - a testimonial is public-facing content that shouldn't vanish
  // just because the account behind it was deleted, and a dispute/complaint
  // record can be a legitimate business/legal reason to retain something
  // even after a deletion request (the Privacy Policy's deletion clause
  // already accounts for this: "we may not always be able to comply -
  // for example, where records are required by law"). Nulling client_id
  // keeps the content itself but removes the personal association, rather
  // than either fully deleting real content or blocking the deletion
  // outright (which is what would happen by default - both columns lack
  // on delete cascade, so leaving them pointed at a since-deleted auth
  // user would fail the delete with a foreign key violation).
  await supabaseAdmin.from('testimonials').update({ client_id: null }).eq('client_id', clientId);
  await supabaseAdmin.from('disputes').update({ client_id: null }).eq('client_id', clientId);

  // ---- Audit log BEFORE deletion (target row won't exist to look up after) ----
  await supabaseAdmin.from('audit_log').insert({
    admin_id: callerAuth.user.id,
    action: 'client_deleted',
    target_table: 'clients',
    target_id: clientId,
    detail: `Deleted ${clientProfile?.full_name ?? 'unknown'} (${clientEmail})`,
  });

  // ---- Delete the auth user - cascades through profiles -> clients ->
  // applications -> documents/stage_history, and client_id-referencing
  // messages/consultant_reminders/payments, via the on delete cascade
  // foreign keys already defined in the schema. One call removes
  // everything genuinely tied to this person. ----
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(clientRow.profile_id);
  if (deleteError) {
    res.status(500).json({ error: `Failed to delete: ${deleteError.message}` });
    return;
  }

  res.status(200).json({ success: true });
}
