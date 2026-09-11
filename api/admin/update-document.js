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
var update_document_exports = {};
__export(update_document_exports, {
  default: () => handler
});
module.exports = __toCommonJS(update_document_exports);
var import_supabase_js = require("@supabase/supabase-js");
var import_email = require("../email");
const supabaseAdmin = (0, import_supabase_js.createClient)(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "https://rxuylffiobkhmbyrmvlk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
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
  const { data: callerProfile } = await supabaseAdmin.from("profiles").select("role, status").eq("id", callerAuth.user.id).single();
  if (!callerProfile || callerProfile.status === "suspended") {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  if (callerProfile.role !== "super_admin" && callerProfile.role !== "staff_admin") {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  const body = req.body;
  if (!body.documentId || !body.status) {
    res.status(400).json({ error: "documentId and status are required." });
    return;
  }
  const { error: updateError } = await supabaseAdmin.from("documents").update({
    status: body.status,
    rejection_reason: body.status === "rejected" ? body.rejectionReason ?? null : null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", body.documentId);
  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }
  if (body.status === "rejected") {
    const { data: doc } = await supabaseAdmin.from("documents").select("document_name, application_id").eq("id", body.documentId).single();
    if (doc) {
      const { data: app } = await supabaseAdmin.from("applications").select("client_id").eq("id", doc.application_id).single();
      if (app) {
        const { data: client } = await supabaseAdmin.from("clients").select("profile_id").eq("id", app.client_id).single();
        if (client) {
          const { data: profile } = await supabaseAdmin.from("profiles").select("full_name").eq("id", client.profile_id).single();
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(client.profile_id);
          const clientEmail = authUser?.user?.email;
          const firstName = profile?.full_name?.split(" ")[0] ?? "there";
          if (clientEmail) {
            const emailContent = (0, import_email.documentRejectedEmail)({
              firstName,
              documentName: doc.document_name,
              reason: body.rejectionReason ?? null
            });
            (0, import_email.sendEmail)({ to: clientEmail, ...emailContent }).catch((err) => console.error("Document rejected email failed:", err));
          }
        }
      }
    }
  }
  res.status(200).json({ success: true });
}
