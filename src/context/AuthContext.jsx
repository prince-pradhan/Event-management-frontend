import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, institutionsApi } from '../api/endpoints';
import { USER_ROLE } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInstitutionForUser = async (userData) => {
    if (userData?.role === USER_ROLE.INSTITUTION_ADMIN) {
      try {
        const instRes = await institutionsApi.getMine();
        if (instRes.data?.success && instRes.data?.institution) {
          return { ...userData, institutionData: instRes.data.institution };
        }
      } catch (err) {
        console.error('Failed to fetch institution for user', err);
      }
    }
    return userData;
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    authApi
      .checkAuth()
      .then(async (res) => {
        if (res.data?.success && res.data?.user) {
          const userWithInst = await fetchInstitutionForUser(res.data.user);
          setUser(userWithInst);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.data?.success && res.data?.user) {
      // Set basic user data first to satisfy isAuthenticated and role checks immediately
      setUser(res.data.user);
      
      // Then enrich with institution data if needed
      const userWithInst = await fetchInstitutionForUser(res.data.user);
      setUser(userWithInst);
    }
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    if (res.data?.success && res.data?.user) {
      setUser(res.data.user);
      const userWithInst = await fetchInstitutionForUser(res.data.user);
      setUser(userWithInst);
    }
    return res;
  };

  const verifyEmail = async (code) => {
    const res = await authApi.verifyEmail(code);
    if (res.data?.success && res.data?.user) {
      setUser(res.data.user);
      const userWithInst = await fetchInstitutionForUser(res.data.user);
      setUser(userWithInst);
    }
    return res;
  };

  /** Call after Google (or other) auth that returns { success, user } */
  const setUserFromResponse = async (data) => {
    if (data?.success && data?.user) {
      setUser(data.user);
      const userWithInst = await fetchInstitutionForUser(data.user);
      setUser(userWithInst);
    }
  };

  const refreshUser = async () => {
    console.log('Refreshing user profile...');
    try {
      const res = await authApi.checkAuth();
      if (res.data?.success && res.data?.user) {
        const userWithInst = await fetchInstitutionForUser(res.data.user);
        setUser(userWithInst);
        console.log('User profile refreshed successfully.');
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    // isSystemAdmin: strictly for top-level system management (like institution verification)
    isSystemAdmin: user?.role === USER_ROLE.SYSTEM_ADMIN || user?.role === USER_ROLE.ADMIN,
    // isRegularAdmin: strictly for the legacy ADMIN role if needed
    isRegularAdmin: user?.role === USER_ROLE.ADMIN,
    // isInstitutionAdmin: strictly for institution-level management
    isInstitutionAdmin: user?.role === USER_ROLE.INSTITUTION_ADMIN,
    // isAdmin: any type of administrative role
    isAdmin: user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.SYSTEM_ADMIN || user?.role === USER_ROLE.INSTITUTION_ADMIN,
    login,
    logout,
    signup,
    verifyEmail,
    setUserFromResponse,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}