import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type ApplicationStage = Database['public']['Tables']['stage_history']['Row']['stage'];
type DocumentStatus = DocumentRow['status'];
type ContactSubmissionRow = Database['public']['Tables']['contact_submissions']['Row'];
type EnquiryStatus = ContactSubmissionRow['status'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type PaymentStatus = PaymentRow['status'];

export interface ClientWithDetails extends ClientRow {
  profile: Pick<ProfileRow, 'id' | 'full_name'> | null;
  applications: ApplicationRow[];
}

/**
 * Fetches clients + their profile (for name) + their applications (for
 * destination/service/stage), joined in JavaScript rather than via
 * Postgrest's embedded-select syntax. Simpler and avoids needing the
 * Relationships metadata in database.types.ts to be fully accurate for
 * nested-select type inference - three flat queries, joined by hand,
 * is more than fast enough at this scale (a handful of clients, not
 * thousands).
 *
 * enabled defaults to true but should be passed as false until the caller
 * knows someone is actually authenticated as an admin - otherwise this
 * fires real (RLS-rejected) queries on the bare login screen, before
 * anyone's signed in. Caught this by testing the login page directly:
 * confirmed the hook's own useEffect was firing clients/stage_history/
 * contact_submissions requests before any session existed.
 */
export function useClients(enabled = true) {
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    const { data: clientRows, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientErr) {
      setError(clientErr.message);
      setLoading(false);
      return;
    }

    if (!clientRows || clientRows.length === 0) {
      setClients([]);
      setLoading(false);
      return;
    }

    const profileIds = clientRows.map((c) => c.profile_id);
    const clientIds = clientRows.map((c) => c.id);

    const [{ data: profiles }, { data: applications }] = await Promise.all([
      supabase.from('profiles').select('id, full_name').in('id', profileIds),
      supabase.from('applications').select('*').in('client_id', clientIds),
    ]);

    const merged: ClientWithDetails[] = clientRows.map((c) => ({
      ...c,
      profile: profiles?.find((p) => p.id === c.profile_id) ?? null,
      applications: applications?.filter((a) => a.client_id === c.id) ?? [],
    }));

    setClients(merged);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (enabled) refetch();
    else setLoading(false);
  }, [enabled, refetch]);

  return { clients, loading, error, refetch };
}

export interface DashboardStats {
  activeClients: number;
  newInquiries: number;
  loading: boolean;
}

export function useDashboardStats(enabled = true): DashboardStats {
  const [activeClients, setActiveClients] = useState(0);
  const [newInquiries, setNewInquiries] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      const [clientsRes, inquiriesRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
      ]);
      if (cancelled) return;
      setActiveClients(clientsRes.count ?? 0);
      setNewInquiries(inquiriesRes.count ?? 0);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [enabled]);

  return { activeClients, newInquiries, loading };
}

export interface ActivityEntry {
  id: string;
  clientName: string;
  update: string;
  service: string;
  when: string;
}

/**
 * Recent stage changes across all clients, newest first. Genuinely empty
 * until real applications exist and their stage gets updated at least
 * once - that's correct, not a bug, for a brand-new database.
 */
export function useRecentActivity(limit = 8, enabled = true) {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      const { data: history } = await supabase
        .from('stage_history')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (cancelled) return;

      if (!history || history.length === 0) {
        setActivity([]);
        setLoading(false);
        return;
      }

      const applicationIds = [...new Set(history.map((h) => h.application_id))];
      const { data: applications } = await supabase
        .from('applications')
        .select('id, client_id, service_type, destination')
        .in('id', applicationIds);

      const clientIds = [...new Set((applications ?? []).map((a) => a.client_id))];
      const { data: clients } = await supabase.from('clients').select('id, profile_id').in('id', clientIds);
      const profileIds = [...new Set((clients ?? []).map((c) => c.profile_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', profileIds);

      if (cancelled) return;

      const entries: ActivityEntry[] = history.map((h) => {
        const app = applications?.find((a) => a.id === h.application_id);
        const client = app ? clients?.find((c) => c.id === app.client_id) : undefined;
        const profile = client ? profiles?.find((p) => p.id === client.profile_id) : undefined;
        return {
          id: h.id,
          clientName: profile?.full_name ?? 'Unknown client',
          update: `Stage updated to "${h.stage.replace(/_/g, ' ')}"`,
          service: app?.service_type ?? '',
          when: new Date(h.changed_at).toLocaleDateString(),
        };
      });

      setActivity(entries);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [limit, enabled]);

  return { activity, loading };
}

/**
 * Documents for one specific application - fetched lazily, only when the
 * case detail modal is actually open for a client (applicationId is null
 * otherwise), rather than eagerly fetching every client's documents
 * up front.
 */
export function useApplicationDocuments(applicationId: string | null) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!applicationId) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('document_name', { ascending: true });
    setDocuments(data ?? []);
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { documents, loading, refetch };
}

/**
 * Updates an application's stage. Uses the regular authenticated client
 * (not a serverless function) - admins already have direct RLS permission
 * to write applications/stage_history/audit_log, no elevated service-role
 * access needed for this, unlike creating/deleting a login account.
 */
export async function updateApplicationStage(
  applicationId: string,
  newStage: ApplicationStage,
  adminId: string
): Promise<string | null> {
  const { error: appError } = await supabase
    .from('applications')
    .update({ stage: newStage, stage_updated_at: new Date().toISOString() })
    .eq('id', applicationId);
  if (appError) return appError.message;

  await supabase.from('stage_history').insert({ application_id: applicationId, stage: newStage, changed_by: adminId });
  await supabase.from('audit_log').insert({
    admin_id: adminId,
    action: 'stage_updated',
    target_table: 'applications',
    target_id: applicationId,
    detail: `Stage changed to "${newStage.replace(/_/g, ' ')}"`,
  });
  return null;
}

export async function updateApplicationNotes(
  applicationId: string,
  adminNotes: string,
  clientVisibleMessage: string
): Promise<string | null> {
  const { error } = await supabase
    .from('applications')
    .update({ admin_notes: adminNotes, client_visible_message: clientVisibleMessage })
    .eq('id', applicationId);
  return error?.message ?? null;
}

export async function updateDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  rejectionReason: string | null
): Promise<string | null> {
  const { error } = await supabase
    .from('documents')
    .update({ status, rejection_reason: status === 'rejected' ? rejectionReason : null, updated_at: new Date().toISOString() })
    .eq('id', documentId);
  return error?.message ?? null;
}

/**
 * The website's real contact form (Contact.tsx) inserts here anonymously -
 * RLS allows public INSERT but only admins can SELECT, so this is the one
 * place these submissions become visible at all.
 */
export function useContactSubmissions(enabled = true) {
  const [submissions, setSubmissions] = useState<ContactSubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { submissions, loading, refetch };
}

export async function updateSubmissionStatus(id: string, status: EnquiryStatus): Promise<string | null> {
  const { error } = await supabase.from('contact_submissions').update({ status }).eq('id', id);
  return error?.message ?? null;
}

/**
 * Staff (and the Super Admin's own row) - both are just profiles with
 * role in (super_admin, staff_admin). Fetched with a real client count
 * per staff member (how many clients.assigned_to points at them), used
 * to show workload at a glance.
 */
export interface StaffWithCount extends ProfileRow {
  clientCount: number;
}

export function useStaffList(enabled = true) {
  const [staff, setStaff] = useState<StaffWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'staff_admin'])
      .order('created_at', { ascending: true });

    if (!profiles || profiles.length === 0) {
      setStaff([]);
      setLoading(false);
      return;
    }

    const { data: clients } = await supabase.from('clients').select('assigned_to');
    const counts = new Map<string, number>();
    (clients ?? []).forEach((c) => {
      if (c.assigned_to) counts.set(c.assigned_to, (counts.get(c.assigned_to) ?? 0) + 1);
    });

    setStaff(profiles.map((p) => ({ ...p, clientCount: counts.get(p.id) ?? 0 })));
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { staff, loading, refetch };
}

/**
 * Suspending/reactivating an existing staff account is a plain profiles
 * UPDATE, not a serverless-function call - unlike creating one, this
 * doesn't touch the auth layer at all, and RLS itself already restricts
 * writes to profiles to super_admin only ("Super admin manages profiles"
 * / for all using (is_super_admin())). A staff_admin session attempting
 * this would be rejected by the database regardless of what the UI shows.
 */
export async function updateStaffStatus(staffId: string, status: 'active' | 'suspended'): Promise<string | null> {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', staffId);
  return error?.message ?? null;
}

export interface PaymentWithClient extends PaymentRow {
  clientName: string;
}

/**
 * Every payment record, joined with the paying client's name in JavaScript
 * (same reasoning as useClients - avoids relying on Postgrest's embedded-
 * select syntax given database.types.ts's Relationships arrays are empty).
 */
export function usePayments(enabled = true) {
  const [payments, setPayments] = useState<PaymentWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: paymentRows } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!paymentRows || paymentRows.length === 0) {
      setPayments([]);
      setLoading(false);
      return;
    }

    const clientIds = [...new Set(paymentRows.map((p) => p.client_id))];
    const { data: clients } = await supabase.from('clients').select('id, profile_id').in('id', clientIds);
    const profileIds = [...new Set((clients ?? []).map((c) => c.profile_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', profileIds);

    const merged: PaymentWithClient[] = paymentRows.map((p) => {
      const client = clients?.find((c) => c.id === p.client_id);
      const profile = client ? profiles?.find((pr) => pr.id === client.profile_id) : undefined;
      return { ...p, clientName: profile?.full_name ?? 'Unknown client' };
    });

    setPayments(merged);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { payments, loading, refetch };
}

export interface NewPaymentInput {
  clientId: string;
  expectedAmount: number;
  amountPaid: number;
  status: PaymentStatus;
  selarOrderId?: string;
  selarProductName?: string;
}

export async function addPayment(input: NewPaymentInput): Promise<string | null> {
  const { error } = await supabase.from('payments').insert({
    client_id: input.clientId,
    expected_amount: input.expectedAmount,
    amount_paid: input.amountPaid,
    status: input.status,
    selar_order_id: input.selarOrderId || null,
    selar_product_name: input.selarProductName || null,
    paid_at: input.status === 'confirmed' ? new Date().toISOString() : null,
  });
  return error?.message ?? null;
}

type TestimonialStatusValue = Database['public']['Tables']['testimonials']['Row']['status'];

export async function updateTestimonialStatus(id: string, status: TestimonialStatusValue): Promise<string | null> {
  const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
  return error?.message ?? null;
}

export interface NewTestimonialInput {
  clientName: string;
  destination: string;
  category: string;
  serviceTag: string;
  quote: string;
  clientId?: string;
}

export async function addTestimonial(input: NewTestimonialInput): Promise<string | null> {
  const { error } = await supabase.from('testimonials').insert({
    client_name: input.clientName,
    destination: input.destination || null,
    category: input.category || null,
    service_tag: input.serviceTag || null,
    quote: input.quote,
    client_id: input.clientId || null,
    status: 'pending',
  });
  return error?.message ?? null;
}

// ---- Tour Packages ----

type TourPackageRow = Database['public']['Tables']['tour_packages']['Row'];

export function useTourPackages(enabled = true) {
  const [tours, setTours] = useState<TourPackageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('tour_packages').select('*').order('display_order', { ascending: true });
    setTours(data ?? []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { refetch(); }, [refetch]);
  return { tours, loading, refetch };
}

export interface TourPackageInput {
  name: string;
  destination: string;
  nights: number;
  fromPrice: number;
  perPersonSharing: boolean;
  categories: string[];
  status: 'active' | 'hidden';
}

export async function upsertTourPackage(id: string | null, input: TourPackageInput): Promise<string | null> {
  const payload = {
    name: input.name,
    destination: input.destination,
    nights: input.nights,
    from_price: input.fromPrice,
    per_person_sharing: input.perPersonSharing,
    categories: input.categories,
    status: input.status,
    updated_at: new Date().toISOString(),
  };
  const { error } = id
    ? await supabase.from('tour_packages').update(payload).eq('id', id)
    : await supabase.from('tour_packages').insert({ ...payload, display_order: 99 });
  return error?.message ?? null;
}

export async function updateTourStatus(id: string, status: 'active' | 'hidden'): Promise<string | null> {
  const { error } = await supabase.from('tour_packages').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  return error?.message ?? null;
}

// ---- Masterclasses ----

type MasterclassRow = Database['public']['Tables']['masterclasses']['Row'];

export function useMasterclasses(enabled = true) {
  const [masterclasses, setMasterclasses] = useState<MasterclassRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('masterclasses').select('*').order('class_date', { ascending: true });
    setMasterclasses(data ?? []);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { refetch(); }, [refetch]);
  return { masterclasses, loading, refetch };
}

export interface MasterclassInput {
  title: string;
  topic: string;
  classDate: string;
  classTime: string;
  format: string;
  price: number;
  seatsTotal: number;
  seatsRemaining: number;
  status: 'open' | 'sold_out' | 'coming_soon' | 'completed';
  bookingLink: string;
}

export async function upsertMasterclass(id: string | null, input: MasterclassInput): Promise<string | null> {
  const payload = {
    title: input.title,
    topic: input.topic,
    class_date: input.classDate,
    class_time: input.classTime,
    format: input.format,
    price: input.price,
    seats_total: input.seatsTotal,
    seats_remaining: input.seatsRemaining,
    status: input.status,
    booking_link: input.bookingLink || null,
  };
  const { error } = id
    ? await supabase.from('masterclasses').update(payload).eq('id', id)
    : await supabase.from('masterclasses').insert(payload);
  return error?.message ?? null;
}

// ---- Client Messages (two-way thread visible to admin) ----

type MessageRow = Database['public']['Tables']['messages']['Row'];

export interface MessageWithSender extends MessageRow {
  senderName: string;
  fromClient: boolean;
}

/**
 * Fetches the message thread for one client, joining sender names from
 * profiles. Gated on clientId being non-null so it only fires when a
 * case modal is open, not on every admin panel render.
 */
export function useClientMessages(clientId: string | null, clientProfileId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!clientId) { setMessages([]); return; }
    setLoading(true);
    const { data: msgRows } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    if (!msgRows || msgRows.length === 0) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const senderIds = [...new Set(msgRows.map((m) => m.sender_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', senderIds);

    setMessages(msgRows.map((m) => ({
      ...m,
      senderName: profiles?.find((p) => p.id === m.sender_id)?.full_name ?? 'Unknown',
      fromClient: m.sender_id === clientProfileId,
    })));
    setLoading(false);
  }, [clientId, clientProfileId]);

  useEffect(() => { refetch(); }, [refetch]);
  return { messages, loading, refetch };
}

export async function sendAdminMessage(
  clientId: string,
  senderId: string,
  body: string
): Promise<string | null> {
  const { error } = await supabase.from('messages').insert({
    client_id: clientId,
    sender_id: senderId,
    body: body.trim(),
  });
  return error?.message ?? null;
}


