export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? 'NOT_SET';
  const hasServiceKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasResendKey = !!(process.env.RESEND_API_KEY);
  const nodeVersion = process.version;
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');

  let authTest = 'skipped';
  if (token && hasServiceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(
        process.env.SUPABASE_URL ?? 'https://rxuylffiobkhmbyrmvlk.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { data, error } = await sb.auth.getUser(token);
      authTest = error ? `error: ${error.message}` : `ok: ${data?.user?.email}`;
    } catch (e: any) {
      authTest = `exception: ${e.message}`;
    }
  }

  res.status(200).json({
    ok: true,
    nodeVersion,
    supabaseUrl: supabaseUrl.slice(0, 40),
    hasServiceKey,
    hasResendKey,
    method: req.method,
    authTest,
    env: Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NODE') && k !== 'PATH').sort()
  });
}
