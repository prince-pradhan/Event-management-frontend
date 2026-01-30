import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';
import { USER_ROLE } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .checkAuth()
      .then((res) => {
        if (res.data?.success && res.data?.user) setUser(res.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.data?.success && res.data?.user) setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    if (res.data?.success && res.data?.user) setUser(res.data.user);
    return res;
  };

  const verifyEmail = async (code) => {
    const res = await authApi.verifyEmail(code);
    if (res.data?.success && res.data?.user) setUser(res.data.user);
    return res;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLE.ADMIN,
    login,
    logout,
    signup,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
