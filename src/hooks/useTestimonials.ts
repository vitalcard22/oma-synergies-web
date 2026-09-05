import { useEffect, useState, useCallback } from 'react';

export type Testimonial = {
  id: string;
  client_name: string;
  destination: string | null;
  category: string | null;
  service_tag: string | null;
  quote: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  client_id: string | null;
  service_type: string | null;
};

/**
 * Fetches testimonials from Supabase. Lazy-imports the Supabase client
 * so this hook can be safely used in Home.tsx (the eagerly-loaded entry
 * point) without pulling the 208KB Supabase SDK into the initial bundle.
 * The SDK is already bundled separately for the Admin/Portal chunks -
 * this way the homepage fetch shares that same chunk on first use rather
 * than inlining a second copy.
 *
 * RLS decides what's visible - an anonymous visitor only ever gets
 * approved rows, while a signed-in admin session gets everything via
 * the same query. No need for a separate admin-only variant.
 */
export function useTestimonials(enabled = true) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Dynamic import keeps the Supabase SDK out of the initial bundle
    // when this hook is used from Home.tsx (the only eagerly-loaded page).
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    setTestimonials((data ?? []) as Testimonial[]);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { testimonials, loading, refetch };
}
