import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';

/**
 * Minimal local types matching Vercel's documented Node.js serverless
 * function signature exactly (method, headers, body pre-parsed on req;
 * status/json/end on res). Deliberately not using @vercel/node's official
 * types - that package pulled in ajv/path-to-regexp/undici versions with
 * 5 known vulnerabilities (2 moderate, 3 high) just for these two type
 * names. These types are erased at compile time either way - Vercel's
 * actual runtime provides these exact fields/methods regardless of which
 * package supplied the TypeScript types, so this is just as correct
 * without the dependency.
 */
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

// Server-side only client, using the service role key - bypasses Row Level
// Security entirely. This file runs in a private Node.js environment
// (Vercel serverless function), never bundled into the site's JavaScript,
// so this key never reaches a browser. SUPABASE_SERVICE_ROLE_KEY is
// deliberately NOT prefixed with VITE_ for exactly this reason - Vite only
// exposes VITE_-prefixed variables to client-side code.
const supabaseAdmin = createClient<Database>(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface CreateClientBody {
  fullName: string;
  email: string;
  phone?: string;
  serviceType: string;
  destination?: string;
  assignedTo?: string;
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

  // ---- Verify the caller is a genuine, currently-active admin ----
  // Anyone who discovers this URL could otherwise create arbitrary login
  // accounts, since the code past this point runs with full admin
  // privileges. The browser sends its own Supabase session token; this
  // verifies that token against Supabase itself (not just trusting
  // whatever the request claims) and checks the resulting user's role.
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
    res.status(403).json({ error: 'Only staff accounts can register new clients.' });
    return;
  }

  // ---- Validate input ----
  const body = req.body as Partial<CreateClientBody>;
  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  const serviceType = body.serviceType?.trim();

  if (!fullName || !email || !serviceType) {
    res.status(400).json({ error: 'Full name, email, and service type are required.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'That email address doesn\'t look valid.' });
    return;
  }

  // ---- Create the auth user ----
  // email_confirm: true skips the confirmation-email loop, matching the
  // same "Auto Confirm User" pattern used to create the CEO account -
  // there's no transactional email set up yet to send a real confirmation.
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
        ? 'A client with this email already has an account.'
        : (createUserError?.message ?? 'Failed to create the account.'),
    });
    return;
  }

  const newUserId = newUser.user.id;

  // ---- Insert profile, client, initial application ----
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: newUserId,
    role: 'client',
    full_name: fullName,
    phone: body.phone ?? null,
    status: 'active',
    created_by: callerAuth.user.id,
  });
  if (profileError) {
    res.status(500).json({ error: `Account created but profile setup failed: ${profileError.message}` });
    return;
  }

  const { data: newClient, error: clientError } = await supabaseAdmin
    .from('clients')
    .insert({
      profile_id: newUserId,
      assigned_to: body.assignedTo ?? callerAuth.user.id,
      service_type: serviceType,
      created_by: callerAuth.user.id,
    })
    .select('id')
    .single();
  if (clientError || !newClient) {
    res.status(500).json({ error: `Account created but client record failed: ${clientError?.message ?? 'unknown error'}` });
    return;
  }

  const { data: newApplication, error: applicationError } = await supabaseAdmin
    .from('applications')
    .insert({
      client_id: newClient.id,
      service_type: serviceType,
      destination: body.destination ?? null,
      stage: 'documents_requested',
      awaiting_client: true,
    })
    .select('id')
    .single();
  if (applicationError || !newApplication) {
    res.status(500).json({ error: `Client created but application setup failed: ${applicationError?.message ?? 'unknown error'}` });
    return;
  }

  // ---- Auto-populate the document checklist from the editable template ----
  const { data: requirements } = await supabaseAdmin
    .from('document_requirements')
    .select('document_name')
    .eq('service_type', serviceType)
    .order('display_order', { ascending: true });

  if (requirements && requirements.length > 0) {
    await supabaseAdmin.from('documents').insert(
      requirements.map((r) => ({
        application_id: newApplication.id,
        document_name: r.document_name,
        status: 'required' as const,
      }))
    );
  }

  // ---- Stage history + audit log ----
  await supabaseAdmin.from('stage_history').insert({
    application_id: newApplication.id,
    stage: 'documents_requested',
    changed_by: callerAuth.user.id,
  });

  await supabaseAdmin.from('audit_log').insert({
    admin_id: callerAuth.user.id,
    action: 'client_created',
    target_table: 'clients',
    target_id: newClient.id,
    detail: `Registered ${fullName} (${email}) for ${serviceType}`,
  });

  res.status(200).json({
    success: true,
    clientId: newClient.id,
    tempPassword,
    documentsPopulated: requirements?.length ?? 0,
  });
}
