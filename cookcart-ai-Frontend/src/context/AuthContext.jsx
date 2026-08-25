import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContext } from 'react';
import { getAllUsers, getDefaultUser, getCurrentUserFromStorage, setCurrentUserInStorage, clearCurrentUserStorage } from '../api/userApi.js';
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

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getCurrentUserFromStorage());

  useEffect(() => {
    if (auth) setCurrentUserInStorage(auth);
    else clearCurrentUserStorage();
  }, [auth]);

  const loginWithBlinkit = useCallback(async () => {
    const user = await getDefaultUser();
    if (user) {
      const profile = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || PLACEHOLDER_AVATAR,
        initials: getInitials(user.name),
        provider: 'blinkit',
      };
      setAuth(profile);
      return profile;
    }
    return null;
  }, []);

  const login = useCallback(async ({ email, phone }) => {
    const users = await getAllUsers();
    let user = null;
    if (email) user = users.find(u => u.email === email);
    if (!user && phone) user = users.find(u => u.phone === phone);
    
    if (user) {
      const profile = {
        user_id: user.user_id,
        name: user.name,
        email: email || user.email,
        phone: phone || user.phone || '',
        avatar: user.avatar || PLACEHOLDER_AVATAR,
        initials: getInitials(user.name),
        provider: 'credentials',
      };
      setAuth(profile);
      return profile;
    }

    const defaultUser = await getDefaultUser();
    if (defaultUser) {
      const profile = {
        user_id: defaultUser.user_id,
        name: defaultUser.name,
        email: email || defaultUser.email,
        phone: phone || defaultUser.phone || '',
        avatar: defaultUser.avatar || PLACEHOLDER_AVATAR,
        initials: getInitials(defaultUser?.name || 'Guest'),
        provider: 'credentials',
      };
      setAuth(profile);
      return profile;
    }
    return null;
  }, []);

  const signup = useCallback(({ name, email, phone }) => {
    const profile = {
      user_id: `USR${Date.now()}`,
      name: name?.trim() || 'Chef',
      email: email?.trim() || phone?.trim() || '',
      phone: phone?.trim() || email?.trim() || '',
      avatar: PLACEHOLDER_AVATAR,
      initials: getInitials(name),
      provider: 'signup',
    };
    setAuth(profile);
    return profile;
  }, []);

  const logout = useCallback(() => setAuth(null), []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(auth),
    user: auth,
    provider: auth?.provider ?? null,
    loginWithBlinkit,
    login,
    signup,
    logout,
  }), [auth, loginWithBlinkit, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}