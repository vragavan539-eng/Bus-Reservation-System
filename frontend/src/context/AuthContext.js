import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // if you use a different toast lib, change this import

export const AuthContext = createContext();

// Axios instance — points to your backend API
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // change to your backend URL/port if different
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('busgo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;s
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on first mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('busgo_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem('busgo_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('busgo_token', data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('busgo_token', data.token);
    setUser(data.user);
    toast.success(`Account created! Welcome, ${data.user.name}!`);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    localStorage.setItem('busgo_token', data.token);
    setUser(data.user);
    toast.success(`Welcome, ${data.user.name}! 🚌`);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('busgo_token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, updateUser, api }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;