import axios from 'axios';


const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('busgo_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('busgo_token');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const authAPI = {
  login:          d => API.post('/auth/login', d),
  register:       d => API.post('/auth/register', d),
  me:             () => API.get('/auth/me'),
  update:         d => API.put('/auth/profile', d),
  changePassword: d => API.put('/auth/change-password', d),
  forgotPassword: d => API.post('/auth/forgot-password', d),
  resetPassword:  d => API.post('/auth/reset-password', d),
};

export const busAPI = {
  getAll:   p    => API.get('/buses', { params: p }),
  getById:  id   => API.get(`/buses/${id}`),
  getSeats: id   => API.get(`/buses/${id}/seats`),
  create:   d    => API.post('/buses', d),
  update:   (id,d) => API.put(`/buses/${id}`, d),
  delete:   id   => API.delete(`/buses/${id}`),
};

export const routeAPI = {
  search:  p    => API.get('/routes/search', { params: p }),
  popular: ()   => API.get('/routes/popular'),
  getAll:  ()   => API.get('/routes'),
  getById: id   => API.get(`/routes/${id}`),
  create:  d    => API.post('/routes', d),
  update:  (id,d) => API.put(`/routes/${id}`, d),
  delete:  id   => API.delete(`/routes/${id}`),
};

export const bookingAPI = {
  create:      d    => API.post('/bookings', d),
  myBookings:  p    => API.get('/bookings/my', { params: p }),
  getById:     id   => API.get(`/bookings/${id}`),
  cancel:      (id,d) => API.put(`/bookings/${id}/cancel`, d),
  byPNR:       pnr  => API.get(`/bookings/pnr/${pnr}`),
  allBookings: p    => API.get('/bookings/all', { params: p }),
};

// Razorpay Payment API
export const paymentAPI = {
  createOrder: d => API.post('/payments/create-order', d),
  verify:      d => API.post('/payments/verify', d),
  refund:      d => API.post('/payments/refund', d),
  details:     id => API.get(`/payments/details/${id}`),
};

export const adminAPI = {
  dashboard: () => API.get('/admin/dashboard'),
  users:     p  => API.get('/admin/users', { params: p }),
  block:     id => API.put(`/admin/users/${id}/block`),
  unblock:   id => API.put(`/admin/users/${id}/unblock`),
};

export const reviewAPI = {
  create:   d  => API.post('/reviews', d),
  getByBus: id => API.get(`/reviews/bus/${id}`),
};

export default API;