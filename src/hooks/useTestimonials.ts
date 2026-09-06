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

export function useTestimonials(enabled = true) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      setTestimonials((data ?? []) as Testimonial[]);
    } catch {
      // Network error or dynamic import failure - leave testimonials empty,
      // the empty state in Stories.tsx handles this gracefully.
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { testimonials, loading, refetch };
}
