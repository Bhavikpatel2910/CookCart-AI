import { useMemo, useState } from 'react';
import { useContext } from 'react';
import { getUserById, getDefaultUser, getCurrentUserFromStorage, setCurrentUserInStorage, clearCurrentUserStorage } from '../api/userApi.js';
import { UserContext } from './context.js';

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUserFromStorage());

  const loadUser = useMemo(() => async (userId) => {
    const userData = await getUserById(userId);
    if (userData) {
      setUser(userData);
      setCurrentUserInStorage(userData);
    }
    return userData;
  }, []);

  const loadDefaultUser = useMemo(() => async () => {
    const userData = await getDefaultUser();
    if (userData) {
      setUser(userData);
      setCurrentUserInStorage(userData);
    }
    return userData;
  }, []);

  const updateUser = useMemo(() => (patch) => {
    setUser(current => {
      const updated = { ...current, ...patch };
      setCurrentUserInStorage(updated);
      return updated;
    });
  }, []);

  const logout = useMemo(() => () => {
    setUser(null);
    clearCurrentUserStorage();
  }, []);

  const value = useMemo(() => ({
    user,
    loadUser,
    loadDefaultUser,
    updateUser,
    logout,
    isAuthenticated: Boolean(user),
  }), [user, loadUser, loadDefaultUser, updateUser, logout]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}