import api from './client'; // Import custom Axios HTTP client instance

export const getAnalyticsSummary = (params = {}) => // Export function to fetch top-level dashboard metrics summary
  api.get('/analytics/summary/', { params }); // Execute GET request to /analytics/summary/ endpoint

export const getSalesByDay = (params = {}) => // Export function to fetch daily sales revenue totals
  api.get('/analytics/sales_by_day/', { params }); // Execute GET request to /analytics/sales_by_day/ endpoint

export const getPopularItems = (params = {}) => // Export function to fetch top best-selling menu items breakdown
  api.get('/analytics/popular_items/', { params }); // Execute GET request to /analytics/popular_items/ endpoint

export const getPeakHours = (params = {}) => // Export function to fetch order volume distribution across operating hours
  api.get('/analytics/peak_hours/', { params }); // Execute GET request to /analytics/peak_hours/ endpoint

export const getRevenueByCategory = (params = {}) => // Export function to fetch revenue distribution grouped by menu category
  api.get('/analytics/revenue_by_category/', { params }); // Execute GET request to /analytics/revenue_by_category/ endpoint

