import { useCallback, useState } from 'react';

const FAVORITES_KEY = 'cookcart_favorites';

function readFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(list) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota errors */
  }
}

// Single source of truth for saved recipes. Each mounted view re-reads the
// list, so saving on a recipe overview and then visiting /favorites (or the
// profile) shows the same collection.
export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  const isSaved = useCallback((slug) => favorites.includes(slug), [favorites]);

  const toggle = useCallback((slug) => {
    setFavorites((current) => {
      const next = current.includes(slug)
        ? current.filter((id) => id !== slug)
        : [...current, slug];
      writeFavorites(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug) => {
    setFavorites((current) => {
      const next = current.filter((id) => id !== slug);
      writeFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isSaved, toggle, remove };
}
