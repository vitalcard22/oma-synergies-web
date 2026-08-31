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

interface CreateStaffBody {
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
}

function generateTempPassword(): string {
  const words = ['Mango', 'Trail', 'River', 'Cedar', 'Falcon', 'Amber', 'Coral', 'Delta', 'Ember', 'Marble'];
  const word = words[Math.floor(Math.random() * words.length)];
  const symbols = ['#', '!', '$', '%', '&'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${word}${symbol}${num}`;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ---- Verify caller, but this time require super_admin specifically -
  // not staff_admin. Staff creating other staff accounts was explicitly
  // ruled out during planning: only the CEO (super_admin) creates admin
  // accounts. This is the one meaningful difference from create-client.ts's
  // verification block, which allows either admin role. ----
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
  if (callerProfile.role !== 'super_admin') {
    res.status(403).json({ error: 'Only the Super Admin can create staff accounts.' });
    return;
  }

  // ---- Validate input ----
  const body = req.body as Partial<CreateStaffBody>;
  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!fullName || !email) {
    res.status(400).json({ error: 'Full name and email are required.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'That email address doesn\'t look valid.' });
    return;
  }

  // ---- Create the auth user ----
  const tempPassword = generateTempPassword();
  const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (createUserError || !newUser.user) {
    const isDuplicate = createUserError?.message?.toLowerCase().includes('already registered')
      || createUserError?.message?.toLowerCase().includes('already exists');
    res.status(isDuplicate ? 409 : 500).json({
      error: isDuplicate
        ? 'An account with this email already exists.'
        : (createUserError?.message ?? 'Failed to create the account.'),
    });
    return;
  }

  const newUserId = newUser.user.id;

  // ---- Insert the staff profile (no clients/applications rows - staff
  // aren't clients, unlike create-client.ts which creates a whole chain
  // of related records) ----
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: newUserId,
    role: 'staff_admin',
    full_name: fullName,
    phone: body.phone ?? null,
    title: body.title?.trim() || null,
    status: 'active',
    created_by: callerAuth.user.id,
  });
  if (profileError) {
    res.status(500).json({ error: `Account created but profile setup failed: ${profileError.message}` });
    return;
  }

  await supabaseAdmin.from('audit_log').insert({
    admin_id: callerAuth.user.id,
    action: 'staff_created',
    target_table: 'profiles',
    target_id: newUserId,
    detail: `Created staff account for ${fullName} (${email})`,
  });

  res.status(200).json({ success: true, staffId: newUserId, tempPassword });
}
