import api from './client';

export const getAnalyticsSummary = (params = {}) =>
  api.get('/analytics/summary/', { params });

export const getSalesByDay = (params = {}) =>
  api.get('/analytics/sales_by_day/', { params });

export const getPopularItems = (params = {}) =>
  api.get('/analytics/popular_items/', { params });

export const getPeakHours = (params = {}) =>
  api.get('/analytics/peak_hours/', { params });

export const getRevenueByCategory = (params = {}) =>
  api.get('/analytics/revenue_by_category/', { params });
