import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Generic CRUD with pagination + search + sort
export const getAll = (resource, params = {}) => api.get(`/${resource}`, { params });
export const getOne = (resource, id) => api.get(`/${resource}/${id}`);
export const create = (resource, data) => api.post(`/${resource}`, data);
export const update = (resource, id, data) => api.put(`/${resource}/${id}`, data);
export const remove = (resource, id) => api.delete(`/${resource}/${id}`);

// AI Analysis
export const analyzeAI = (type, data) => api.post(`/ai/analyze/${type}`, data);
export const aiSearch = (data) => api.post('/ai/search', data);
export const agentSearch = (data) => api.post('/ai/agent-search', data);
export const generateFOIALetter = (data) => api.post('/ai/foia-letter', data);
export const entityLink = (data) => api.post('/ai/entity-link', data);

// Watchlists
export const getWatchlists = (params = {}) => api.get('/watchlists', { params });
export const createWatchlist = (data) => api.post('/watchlists', data);
export const deleteWatchlist = (id) => api.delete(`/watchlists/${id}`);
export const checkWatchlist = (id) => api.post(`/watchlists/${id}/check`);

export default api;
