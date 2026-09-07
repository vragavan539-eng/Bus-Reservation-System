import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('busgo_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('busgo_token');
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('busgo_token')).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('busgo_token', data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 🚌`);
    return data.user;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await api.post('/auth/register', { name, email, phone, password });
    localStorage.setItem('busgo_token', data.token);
    setUser(data.user);
    toast.success('Account created! Welcome to BusGo 🎉');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('busgo_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updated) => setUser(prev => ({ ...prev, ...updated }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;