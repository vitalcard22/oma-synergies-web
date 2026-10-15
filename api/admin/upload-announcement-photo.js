const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "https://rxuylffiobkhmbyrmvlk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;  // 50 MB

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = typeof req.headers.authorization === "string"
    ? req.headers.authorization.replace("Bearer ", "")
    : null;
  if (!token) {
    res.status(401).json({ error: "Missing authorization token." });
    return;
  }

  const { data: callerAuth, error: callerAuthError } = await supabaseAdmin.auth.getUser(token);
  if (callerAuthError || !callerAuth.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }

  const { data: callerProfile } = await supabaseAdmin
    .from("profiles")
    .select("role, status")
    .eq("id", callerAuth.user.id)
    .single();
  if (!callerProfile || callerProfile.status === "suspended") {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  if (callerProfile.role !== "super_admin" && callerProfile.role !== "staff_admin") {
    res.status(403).json({ error: "Only staff accounts can upload media." });
    return;
  }

  const body = req.body;
  if (!body.fileName || !body.fileBase64 || !body.mimeType) {
    res.status(400).json({ error: "fileName, fileBase64, and mimeType are required." });
    return;
  }

  if (!ALLOWED_TYPES.includes(body.mimeType)) {
    res.status(400).json({ error: "Supported formats: JPEG, PNG, WebP, MP4, WebM, MOV." });
    return;
  }

  const isVideo = VIDEO_TYPES.includes(body.mimeType);
  const fileBuffer = Buffer.from(body.fileBase64, "base64");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (fileBuffer.length > maxBytes) {
    res.status(400).json({ error: `File must be under ${isVideo ? "50MB" : "5MB"}.` });
    return;
  }

  const extMap = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
  const ext = extMap[body.mimeType] ?? body.mimeType.split("/")[1];
  const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("announcement-images")
    .upload(storagePath, fileBuffer, { contentType: body.mimeType, upsert: false });

  if (uploadError) {
    res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    return;
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("announcement-images")
    .getPublicUrl(storagePath);

  res.status(200).json({ success: true, photoUrl: urlData.publicUrl, isVideo });
};
