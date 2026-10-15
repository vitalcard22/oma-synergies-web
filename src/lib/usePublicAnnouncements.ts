import { useEffect, useState } from 'react';

export interface PublicAnnouncement {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link: string | null;
  link_label: string | null;
  created_at: string;
}

export function usePublicAnnouncements() {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { supabase } = await import('./supabase');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('announcements') as any)
          .select('id, title, body, image_url, link, link_label, created_at')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (cancelled) return;
        if (error || !data) { setLoading(false); return; }
        setAnnouncements(data as PublicAnnouncement[]);
      } catch {
        // network or import error - show nothing rather than crash
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { announcements, loading };
}
