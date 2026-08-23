import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContext } from 'react';
import {
  getCurrentUserFromStorage,
  setCurrentUserInStorage,
  clearCurrentUserStorage,
  getToken,
  loginRequest,
  signupRequest,
  fetchCurrentUser,
  logoutRequest,
} from '../api/authApi.js';
import { getInitials } from '../utils/helpers.js';
import { AuthContext } from './context.js';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function toProfile(user, provider) {
  if (!user) return null;
  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    avatar: '',
    initials: getInitials(user.name),
    provider,
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getCurrentUserFromStorage());
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, re-validate it against the backend
  // so a stale/expired token doesn't leave a stale user in the UI.
  useEffect(() => {
    let cancelled = false;
    async function rehydrate() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const user = await fetchCurrentUser();
        if (!cancelled) setAuth(toProfile(user, 'credentials'));
      } catch {
        if (!cancelled) {
          logoutRequest();
          setAuth(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (auth) setCurrentUserInStorage(auth);
    else clearCurrentUserStorage();
  }, [auth]);

  const login = useCallback(async ({ email, phone, password }) => {
    const user = await loginRequest({ email, phone, password });
    const profile = toProfile(user, 'credentials');
    setAuth(profile);
    return profile;
  }, []);

  const signup = useCallback(async ({ name, identifier, email, phone, password }) => {
    // The signup form collects a single "identifier" field (email or phone).
    // Split it out so the backend gets a proper email/phone pair.
    const trimmedIdentifier = identifier?.trim() ?? '';
    const isEmail = trimmedIdentifier.includes('@');
    const resolvedEmail = email ?? (isEmail ? trimmedIdentifier : undefined);
    const resolvedPhone = phone ?? (!isEmail ? trimmedIdentifier : undefined);

    const user = await signupRequest({ name, email: resolvedEmail, phone: resolvedPhone, password });
    const profile = toProfile(user, 'signup');
    setAuth(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setAuth(null);
  }, []);

  // Blinkit OAuth isn't wired up on the backend yet; surface a clear error
  // instead of silently faking a session.
  const loginWithBlinkit = useCallback(async () => {
    throw new Error('Sign in with Blinkit is not available yet. Please use email/password.');
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(auth),
    user: auth,
    provider: auth?.provider ?? null,
    loading,
    login,
    signup,
    logout,
    loginWithBlinkit,
  }), [auth, loading, login, signup, logout, loginWithBlinkit]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}