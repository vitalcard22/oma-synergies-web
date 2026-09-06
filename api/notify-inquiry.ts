import { newInquiryEmail, sendEmail } from './email';

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

const ADMIN_EMAIL = process.env.RESEND_FROM ?? 'info@omasynergiestravel.com';

interface InquiryBody {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  destination?: string;
  message?: string;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const body = req.body as Partial<InquiryBody>;
  if (!body.name || !body.email) { res.status(400).json({ error: 'name and email are required.' }); return; }

  const emailContent = newInquiryEmail({
    name: body.name,
    email: body.email,
    phone: body.phone ?? null,
    service: body.service ?? null,
    destination: body.destination ?? null,
    message: body.message ?? null,
  });

  // Send to the admin inbox - non-blocking
  sendEmail({ to: ADMIN_EMAIL, ...emailContent }).catch((_err) =>
    console.error('Inquiry alert email failed')
  );

  res.status(200).json({ success: true });
}
