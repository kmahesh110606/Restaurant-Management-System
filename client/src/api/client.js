import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: `${API_BASE}/api/v1`, headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
let refreshing = null;
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});
api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  const refreshToken = localStorage.getItem('refresh_token');
  if (error.response?.status !== 401 || !request || request._retry || !refreshToken || request.url?.includes('/auth/login/') || request.url?.includes('/auth/google/')) return Promise.reject(error);
  request._retry = true;
  if (!refreshing) {
    refreshing = axios.post(`${API_BASE}/api/v1/auth/token/refresh/`, { refresh: refreshToken }, { timeout: 15000 })
      .then(({ data }) => {
        // A late response must not sign a user back in after logout.
        if (localStorage.getItem('refresh_token') !== refreshToken) throw new Error('Session changed');
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        return data.access;
      }).finally(() => { refreshing = null; });
  }
  try { request.headers.Authorization = `Bearer ${await refreshing}`; return await api(request); }
  catch (refreshError) {
    if (refreshError.response?.status === 401 || refreshError.response?.status === 400) {
      localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('rms-session-expired'));
    }
    return Promise.reject(refreshError);
  }
});

// Existing list screens display complete collections. Follow page numbers through
// this client so a proxy-generated absolute next URL never receives credentials.
export async function getCollection(path, params = {}) {
  const response = await api.get(path, { params });
  if (!Array.isArray(response.data?.results)) return response;
  const results = [...response.data.results];
  let next = response.data.next;
  const seen = new Set();
  while (next) {
    const page = new URL(next, window.location.origin).searchParams.get('page');
    if (!page || seen.has(page)) throw new Error('Invalid pagination response');
    seen.add(page);
    const result = await api.get(path, { params: { ...params, page } });
    results.push(...result.data.results);
    next = result.data.next;
  }
  return { ...response, data: { ...response.data, results, next: null } };
}
export default api;
