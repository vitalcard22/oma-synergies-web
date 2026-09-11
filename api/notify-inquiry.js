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
var notify_inquiry_exports = {};
__export(notify_inquiry_exports, {
  default: () => handler
});
module.exports = __toCommonJS(notify_inquiry_exports);
var import_email = require("./email");
const ADMIN_EMAIL = process.env.RESEND_FROM ?? "info@omasynergiestravel.com";
async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = req.body;
  if (!body.name || !body.email) {
    res.status(400).json({ error: "name and email are required." });
    return;
  }
  const emailContent = (0, import_email.newInquiryEmail)({
    name: body.name,
    email: body.email,
    phone: body.phone ?? null,
    service: body.service ?? null,
    destination: body.destination ?? null,
    message: body.message ?? null
  });
  (0, import_email.sendEmail)({ to: ADMIN_EMAIL, ...emailContent }).catch(
    (_err) => console.error("Inquiry alert email failed")
  );
  res.status(200).json({ success: true });
}
