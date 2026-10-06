import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContext } from 'react';
import { getCurrentUserFromStorage, setCurrentUserInStorage, clearCurrentUserStorage, syncUserToServer } from '../api/userApi.js';
import { getInitials } from '../utils/helpers.js';
import { AuthContext } from './context.js';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// No remote placeholders: avatars fall back to initials in the UI.
const PLACEHOLDER_AVATAR = '';

// Small deterministic hash (FNV-1a) -> short stable id for an email/phone.
function userIdFor(identifier) {
  const normalized = String(identifier).trim().toLowerCase().replace(/[\s-]/g, '');
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `USR${hash.toString(36).toUpperCase()}${normalized.length.toString(36).toUpperCase()}`;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getCurrentUserFromStorage());

  useEffect(() => {
    if (auth) setCurrentUserInStorage(auth);
    else clearCurrentUserStorage();
  }, [auth]);

  // Copy of the user's record from the database (cart + favourites). `syncStatus`
  // is 'idle' | 'syncing' | 'synced' | 'error' so consumers know when it is safe
  // to merge server data or push local changes.
  const [serverUser, setServerUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  // Set at signup so the chosen name is written once; later logins never overwrite it.
  const pendingNameRef = useRef(null);

  // Upsert the user in MongoDB whenever a (different) user is signed in.
  const userId = auth?.user_id ?? null;
  useEffect(() => {
    if (!auth || !userId) {
      setServerUser(null);
      setSyncStatus('idle');
      return undefined;
    }
    let cancelled = false;
    setSyncStatus('syncing');
    const updateName = pendingNameRef.current === userId;
    syncUserToServer(auth, { updateName })
      .then((user) => {
        if (cancelled) return;
        if (updateName) pendingNameRef.current = null;
        setServerUser(user);
        setSyncStatus('synced');
        // Use the name stored in the database (e.g. the one given at signup).
        if (user?.name) {
          setAuth((prev) => (prev && prev.user_id === user.userId && prev.name !== user.name
            ? { ...prev, name: user.name, initials: getInitials(user.name) }
            : prev));
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('Could not sync user to the database:', error?.message);
        setSyncStatus('error');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loginWithBlinkit = useCallback(async () => {
    // Demo sign-in: one account per browser, so different people never share an order history.
    let deviceId = '';
    try {
      deviceId = localStorage.getItem('cookcart_blinkit_id') || '';
      if (!deviceId) {
        deviceId = Math.random().toString(36).slice(2, 10).toUpperCase();
        localStorage.setItem('cookcart_blinkit_id', deviceId);
      }
    } catch {
      deviceId = Math.random().toString(36).slice(2, 10).toUpperCase();
    }
    const profile = {
      user_id: `USRBLK${deviceId}`,
      name: 'Blinkit Member',
      email: 'member@blinkit.demo',
      phone: '',
      avatar: PLACEHOLDER_AVATAR,
      initials: getInitials('Blinkit Member'),
      provider: 'blinkit',
    };
    setAuth(profile);
    return profile;
  }, []);

  // Accounts are keyed by a stable id derived from the email/phone, so signing in
  // again (on any device) reaches the same record — and the same orders — in the DB.
  const login = useCallback(({ email, phone }) => {
    const identifier = (email || phone || '').trim();
    if (!identifier) return null;
    const isEmail = identifier.includes('@');
    const guessedName = isEmail ? identifier.split('@')[0] : 'Chef';
    const profile = {
      user_id: userIdFor(identifier),
      name: guessedName,
      email: isEmail ? identifier.toLowerCase() : '',
      phone: isEmail ? '' : identifier.replace(/\D/g, ''),
      avatar: PLACEHOLDER_AVATAR,
      initials: getInitials(guessedName),
      provider: 'credentials',
    };
    setAuth(profile);
    return profile;
  }, []);

  const signup = useCallback(({ name, email, phone }) => {
    const identifier = (email || phone || '').trim();
    const profile = {
      user_id: userIdFor(identifier || `anon-${Date.now()}`),
      name: name?.trim() || 'Chef',
      email: email?.trim().toLowerCase() || '',
      phone: phone ? phone.replace(/\D/g, '') : '',
      avatar: PLACEHOLDER_AVATAR,
      initials: getInitials(name || identifier),
      provider: 'signup',
    };
    pendingNameRef.current = profile.user_id;
    setAuth(profile);
    return profile;
  }, []);

  const logout = useCallback(() => setAuth(null), []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(auth),
    user: auth,
    serverUser,
    syncStatus,
    provider: auth?.provider ?? null,
    loginWithBlinkit,
    login,
    signup,
    logout,
  }), [auth, serverUser, syncStatus, loginWithBlinkit, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}