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

/**
 * Fetches active tour packages from the database for the public /tours page.
 * Falls back to the static TOURS array if the database returns nothing -
 * this means the page stays populated before 0003_seed_tours.sql has been
 * run, and also gives graceful degradation if Supabase is temporarily
 * unreachable.
 *
 * Uses a dynamic import of the Supabase client (same pattern as
 * useTestimonials) so the 208KB SDK stays out of the initial bundle.
 * Tours is a lazy-loaded route anyway, so this is belt-and-suspenders,
 * but it's the correct pattern regardless.
 */
export function usePublicTours() {
  const [tours, setTours] = useState<PublicTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { supabase } = await import('./supabase');
        const { data } = await supabase
          .from('tour_packages')
          .select('id, name, nights, from_price, per_person_sharing, categories, status')
          .eq('status', 'active')
          .order('display_order', { ascending: true });

        if (cancelled) return;

        if (data && data.length > 0) {
          // Map database rows to the same shape Tours.tsx already knows
          // about, keeping the bundled photo assets from the static file
          // since photos aren't stored in the DB yet.
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
        } else {
          // Database empty (migration not run yet) - fall back to static
          setTours(TOURS.map((t) => ({ ...t, id: t.slug, fromPrice: t.fromPrice, perPersonSharing: t.perPersonSharing })));
        }
      } catch {
        // Network/Supabase error - fall back to static data so the page
        // never goes completely blank
        if (!cancelled) {
          setTours(TOURS.map((t) => ({ ...t, id: t.slug, fromPrice: t.fromPrice, perPersonSharing: t.perPersonSharing })));
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { tours, loading };
}
