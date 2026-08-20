import { useEffect } from 'react';

const DEFAULT_TITLE = 'Oma Synergies Travels And Tours Ltd — Study, Visa & Travel, Guided End to End';
const DEFAULT_DESCRIPTION = 'Global admissions, visa support, study loans, and travel services — guided end to end, with real-time tracking.';

// This is a client-only SPA with a single static <title>/<meta description>
// in index.html, so every route - home, the destinations index, and all 12
// destination detail pages - was showing identical search-result text and
// browser tab titles. This hook lets any page set its own, and restores the
// site default on unmount so navigating away (e.g. via the back button)
// doesn't leave a stale title/description behind.
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? DEFAULT_DESCRIPTION;

    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle || DEFAULT_TITLE;
      if (meta) meta.setAttribute('content', previousDescription);
    };
  }, [title, description]);
}
