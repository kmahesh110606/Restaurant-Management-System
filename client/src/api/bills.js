import api from './client';

export const getBills = (params = {}) =>
  api.get('/bills/', { params });

export const getBill = (id) =>
  api.get(`/bills/${id}/`);

export const createBill = (data) =>
  api.post('/bills/', data);

export const markBillPaid = (id, data) =>
  api.patch(`/bills/${id}/pay/`, data);

export const lookupForBilling = (params) =>
  api.get('/bills/lookup/', { params });
