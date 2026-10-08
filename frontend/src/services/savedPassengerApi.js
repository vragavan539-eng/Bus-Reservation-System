import API from './api';

/*
  savedPassengerApi.js
  ---------------------------------------------------------
  Place in: /frontend/src/services/savedPassengerApi.js

  Uses the same default-exported axios instance (`API`) your
  other services already use (e.g. API.post('/payments/create-order', ...)
  seen in BookingPage.js), so auth headers / base URL are already
  handled consistently.
*/

export const savedPassengerAPI = {
  getAll: () => API.get('/passengers'),
  add: (data) => API.post('/passengers', data),
  update: (id, data) => API.put(`/passengers/${id}`, data),
  remove: (id) => API.delete(`/passengers/${id}`),
};