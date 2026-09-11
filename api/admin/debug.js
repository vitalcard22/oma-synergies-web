module.exports = function handler(req, res) {
  res.status(200).json({
    ok: true,
    node: process.version,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.SUPABASE_URL ?? 'not set',
    time: new Date().toISOString()
  });
};
