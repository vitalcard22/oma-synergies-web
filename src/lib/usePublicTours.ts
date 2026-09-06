import { useEffect, useState } from 'react';
import { TOURS } from '../data/tours';

export interface PublicTour {
  id: string;
  slug: string;
  name: string;
  categories: string[];
  nights: number;
  fromPrice: number;
  perPersonSharing: boolean;
  img?: string;
}

// Static fallback built once at module load - used when the DB is empty
// or unreachable, ensuring the page never goes blank regardless of DB state.
const STATIC_FALLBACK: PublicTour[] = TOURS.map((t) => ({
  id: t.slug,
  slug: t.slug,
  name: t.name,
  categories: [...t.categories],
  nights: t.nights,
  fromPrice: t.fromPrice,
  perPersonSharing: t.perPersonSharing,
  img: t.img,
}));

export function usePublicTours() {
  const [tours, setTours] = useState<PublicTour[]>(STATIC_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('tour_packages')
          .select('id, name, nights, from_price, per_person_sharing, categories, status')
          .eq('status', 'active')
          .order('display_order', { ascending: true });

        if (cancelled) return;

        // Supabase returns {data: null, error: ...} on network failure -
        // not a thrown exception - so we check both paths explicitly.
        if (error || !data || data.length === 0) {
          // DB empty or unreachable - static fallback already set as
          // initial state, just stop loading.
          setLoading(false);
          return;
        }

        const staticByName = Object.fromEntries(TOURS.map((t) => [t.name, t]));
        setTours(
          data.map((row) => ({
            id: row.id,
            slug: staticByName[row.name]?.slug ?? row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: row.name,
            categories: row.categories ?? [],
            nights: row.nights,
            fromPrice: row.from_price,
            perPersonSharing: row.per_person_sharing,
            img: staticByName[row.name]?.img,
          }))
        );
      } catch {
        // Unexpected error (e.g. dynamic import fails) - static fallback
        // already in state from useState initializer.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { tours, loading };
}
