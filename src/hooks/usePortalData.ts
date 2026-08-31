import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ClientRow = Database['public']['Tables']['clients']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type StageHistoryRow = Database['public']['Tables']['stage_history']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

export interface PortalData {
  loading: boolean;
  error: string | null;
  client: ClientRow | null;
  application: ApplicationRow | null;
  documents: DocumentRow[];
  stageHistory: StageHistoryRow[];
}

/**
 * Everything a logged-in client needs to see about their own case. RLS
 * already scopes every one of these queries to rows the caller owns
 * (clients.profile_id = auth.uid(), applications/documents/stage_history
 * joined transitively through that) - this hook doesn't need to filter
 * by "my own ID" itself, Supabase's security rules do that regardless of
 * what this code asks for.
 */
export function usePortalData(userId: string | null): PortalData {
  const [state, setState] = useState<Omit<PortalData, 'loading' | 'error'>>({
    client: null,
    application: null,
    documents: [],
    stageHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const currentUserId = userId; // narrow once, outside the closure below
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: client, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('profile_id', currentUserId)
        .single();

      if (cancelled) return;
      if (clientErr || !client) {
        setError(clientErr?.message ?? 'No client record found for this account.');
        setLoading(false);
        return;
      }

      const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const application = applications?.[0] ?? null;

      let documents: DocumentRow[] = [];
      let stageHistory: StageHistoryRow[] = [];
      if (application) {
        const [{ data: docs }, { data: history }] = await Promise.all([
          supabase.from('documents').select('*').eq('application_id', application.id).order('document_name'),
          supabase.from('stage_history').select('*').eq('application_id', application.id).order('changed_at', { ascending: true }),
        ]);
        documents = docs ?? [];
        stageHistory = history ?? [];
      }

      if (cancelled) return;
      setState({ client, application, documents, stageHistory });
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  return { ...state, loading, error };
}

/**
 * The message thread for a client - two-way, matching the RLS policies
 * that already let a client both read their own thread and insert new
 * messages into it (never other clients' threads).
 */
export function usePortalMessages(clientId: string | null) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!clientId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function sendMessage(body: string, senderId: string) {
    if (!clientId || !body.trim()) return null;
    const { error } = await supabase.from('messages').insert({ client_id: clientId, sender_id: senderId, body: body.trim() });
    if (error) return error.message;
    await refetch();
    return null;
  }

  return { messages, loading, refetch, sendMessage };
}

/**
 * Forced first-login password change. Updates the auth password itself,
 * then marks onboarding_complete on their clients row so the gate only
 * ever shows once.
 */
export async function completeOnboarding(clientId: string, newPassword: string): Promise<string | null> {
  const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
  if (pwError) return pwError.message;

  const { error: clientError } = await supabase.from('clients').update({ onboarding_complete: true }).eq('id', clientId);
  if (clientError) return clientError.message;

  return null;
}
