import api from './client'; // Import custom Axios HTTP client instance

export const getBills = (params = {}) => // Export function to fetch list of generated bills with query parameters
  api.get('/bills/', { params }); // Execute GET request to /bills/ endpoint

export const getBill = (id) => // Export function to retrieve single bill details by bill ID
  api.get(`/bills/${id}/`); // Execute GET request to /bills/{id}/ endpoint

export const createBill = (data) => // Export function to generate a new bill for an order
  api.post('/bills/', data); // Execute POST request to /bills/ with order data

export const markBillPaid = (id, data) => // Export function to record payment for a bill
  api.patch(`/bills/${id}/pay/`, data); // Execute PATCH request to custom /bills/{id}/pay/ endpoint with payment method details

export const lookupForBilling = (params) => // Export function to look up unpaid orders or table bills
  api.get('/bills/lookup/', { params }); // Execute GET request to /bills/lookup/ with search params

