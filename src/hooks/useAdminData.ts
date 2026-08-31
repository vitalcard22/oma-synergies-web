import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type ApplicationStage = Database['public']['Tables']['stage_history']['Row']['stage'];
type DocumentStatus = DocumentRow['status'];

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

