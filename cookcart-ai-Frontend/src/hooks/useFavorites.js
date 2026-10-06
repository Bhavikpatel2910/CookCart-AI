import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth.js';
import { saveFavoritesToServer } from '../api/userApi.js';

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
  const { user, serverUser, syncStatus } = useAuth();
  const userId = user?.user_id ?? null;
  const mergedFor = useRef(null);

  // Merge favourites saved in the DB into this device once per signed-in user.
  useEffect(() => {
    if (!userId || syncStatus !== 'synced' || !serverUser || mergedFor.current === userId) return;
    mergedFor.current = userId;
    const remote = serverUser.favorites || [];
    setFavorites((current) => {
      const merged = [...new Set([...current, ...remote])];
      writeFavorites(merged);
      if (merged.length !== remote.length) saveFavoritesToServer(userId, merged).catch(() => {});
      return merged;
    });
  }, [userId, syncStatus, serverUser]);

  const pushToServer = useCallback((list) => {
    if (userId && syncStatus === 'synced') saveFavoritesToServer(userId, list).catch(() => {});
  }, [userId, syncStatus]);

  const isSaved = useCallback((slug) => favorites.includes(slug), [favorites]);

  const toggle = useCallback((slug) => {
    setFavorites((current) => {
      const next = current.includes(slug)
        ? current.filter((id) => id !== slug)
        : [...current, slug];
      writeFavorites(next);
      pushToServer(next);
      return next;
    });
  }, [pushToServer]);

  const remove = useCallback((slug) => {
    setFavorites((current) => {
      const next = current.filter((id) => id !== slug);
      writeFavorites(next);
      pushToServer(next);
      return next;
    });
  }, [pushToServer]);

  return { favorites, isSaved, toggle, remove };
}
