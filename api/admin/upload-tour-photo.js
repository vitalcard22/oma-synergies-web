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
var upload_tour_photo_exports = {};
__export(upload_tour_photo_exports, {
  default: () => handler
});
module.exports = __toCommonJS(upload_tour_photo_exports);
var import_supabase_js = require("@supabase/supabase-js");
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
    res.status(403).json({ error: "Only staff accounts can upload photos." });
    return;
  }
  const body = req.body;
  if (!body.tourId || !body.fileName || !body.fileBase64 || !body.mimeType) {
    res.status(400).json({ error: "tourId, fileName, fileBase64, and mimeType are required." });
    return;
  }
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowed.includes(body.mimeType)) {
    res.status(400).json({ error: "Only JPEG, PNG, and WebP images are supported." });
    return;
  }
  const fileBuffer = Buffer.from(body.fileBase64, "base64");
  if (fileBuffer.length > 5 * 1024 * 1024) {
    res.status(400).json({ error: "Photo must be under 5MB." });
    return;
  }
  const ext = body.mimeType.split("/")[1].replace("jpeg", "jpg");
  const storagePath = `${body.tourId}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage.from("tour-photos").upload(storagePath, fileBuffer, {
    contentType: body.mimeType,
    upsert: true
    // replace if exists
  });
  if (uploadError) {
    res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    return;
  }
  const { data: urlData } = supabaseAdmin.storage.from("tour-photos").getPublicUrl(storagePath);
  const photoUrl = urlData.publicUrl;
  const { error: updateError } = await supabaseAdmin.from("tour_packages").update({ photo_url: photoUrl, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", body.tourId);
  if (updateError) {
    res.status(500).json({ error: `Photo uploaded but failed to save URL: ${updateError.message}` });
    return;
  }
  res.status(200).json({ success: true, photoUrl });
}
