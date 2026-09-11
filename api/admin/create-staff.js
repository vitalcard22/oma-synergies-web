var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var create_staff_exports = {};
__export(create_staff_exports, {
  default: () => handler
});
module.exports = __toCommonJS(create_staff_exports);
var import_supabase_js = require("@supabase/supabase-js");
const supabaseAdmin = (0, import_supabase_js.createClient)(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "https://rxuylffiobkhmbyrmvlk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
function generateTempPassword() {
  const words = ["Mango", "Trail", "River", "Cedar", "Falcon", "Amber", "Coral", "Delta", "Ember", "Marble"];
  const word = words[Math.floor(Math.random() * words.length)];
  const symbols = ["#", "!", "$", "%", "&"];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${word}${symbol}${num}`;
}
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === "string" ? authHeader.replace("Bearer ", "") : null;
  if (!token) {
    res.status(401).json({ error: "Missing authorization token." });
    return;
  }
  const { data: callerAuth, error: callerAuthError } = await supabaseAdmin.auth.getUser(token);
  if (callerAuthError || !callerAuth.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }
  const { data: callerProfile, error: callerProfileError } = await supabaseAdmin.from("profiles").select("role, status").eq("id", callerAuth.user.id).single();
  if (callerProfileError || !callerProfile) {
    res.status(403).json({ error: "No matching profile for this session." });
    return;
  }
  if (callerProfile.status === "suspended") {
    res.status(403).json({ error: "This account has been suspended." });
    return;
  }
  if (callerProfile.role !== "super_admin") {
    res.status(403).json({ error: "Only the Super Admin can create staff accounts." });
    return;
  }
  const body = req.body;
  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!fullName || !email) {
    res.status(400).json({ error: "Full name and email are required." });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "That email address doesn't look valid." });
    return;
  }
  const tempPassword = generateTempPassword();
  const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true
  });
  if (createUserError || !newUser.user) {
    const isDuplicate = createUserError?.message?.toLowerCase().includes("already registered") || createUserError?.message?.toLowerCase().includes("already exists");
    res.status(isDuplicate ? 409 : 500).json({
      error: isDuplicate ? "An account with this email already exists." : createUserError?.message ?? "Failed to create the account."
    });
    return;
  }
  const newUserId = newUser.user.id;
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: newUserId,
    role: "staff_admin",
    full_name: fullName,
    phone: body.phone ?? null,
    title: body.title?.trim() || null,
    status: "active",
    created_by: callerAuth.user.id
  });
  if (profileError) {
    res.status(500).json({ error: `Account created but profile setup failed: ${profileError.message}` });
    return;
  }
  await supabaseAdmin.from("audit_log").insert({
    admin_id: callerAuth.user.id,
    action: "staff_created",
    target_table: "profiles",
    target_id: newUserId,
    detail: `Created staff account for ${fullName} (${email})`
  });
  res.status(200).json({ success: true, staffId: newUserId, tempPassword });
}
