// Add these to your existing src/services/api.js (or import this file where needed).
// Assumes you already have a configured axios instance exported as `api`
// (the same one routeAPI etc. use), e.g.:
//   import axios from 'axios';
//   const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });
//   api.interceptors.request.use(cfg => { const t = localStorage.getItem('token');
//     if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });

import api from './api'; // adjust import to wherever your axios instance lives

export const reviewAPI = {
  list: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const walletAPI = {
  get: () => api.get('/wallet'),
  topUp: (amount) => api.post('/wallet/topup', { amount }),
  payFromWallet: (amount, bookingId) => api.post('/wallet/pay', { amount, bookingId }),
};

export const couponAPI = {
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`),
  apply: (code, amount) => api.post('/coupons/apply', { code, amount }),
  confirmUse: (code) => api.post('/coupons/confirm-use', { code }),
};

export const notificationAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const chatAPI = {
  startSession: (subject) => api.post('/chat/session', { subject }),
  getMessages: (sessionId) => api.get(`/chat/${sessionId}/messages`),
  sendMessage: (sessionId, message) => api.post(`/chat/${sessionId}/messages`, { message }),
  allSessions: () => api.get('/chat/sessions'), // admin
  closeSession: (sessionId) => api.put(`/chat/${sessionId}/close`),
};