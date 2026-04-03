/**
 * services/api.js
 *
 * WHAT: Central Axios instance + all API call functions.
 * HOW:  Creates one Axios instance with baseURL from env.
 *       Request interceptor attaches JWT from localStorage.
 *       Response interceptor handles 401 auto-logout.
 *       Every endpoint is an exported async function so pages
 *       never build URLs or touch axios directly.
 * WHY:  Single source of truth for API URLs; easy to swap baseURL
 *       for different environments.
 */

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Helper: extract error message ────────────────────────────────────────────
export const getErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.errors?.[0]?.message) return err.response.data.errors[0].message;
  if (err.message === 'Network Error') return 'Cannot connect to server. Is the backend running?';
  return err.message || 'Something went wrong';
};

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════
export const authAPI = {
  signup: (data)          => api.post('/auth/signup', data),
  login:  (data)          => api.post('/auth/login', data),
  getMe:  ()              => api.get('/auth/me'),
  changePassword: (data)  => api.put('/auth/change-password', data),
};

// ════════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════════
export const userAPI = {
  getProfile:        (id)    => api.get(`/users/${id}`),
  updateProfile:     (data)  => api.put('/users/profile', data),
  deleteAccount:     ()      => api.delete('/users/account'),
  getFreelancers:    (params) => api.get('/users/freelancers', { params }),
  getClients:        (params) => api.get('/users/clients', { params }),
  getUserStats:      (id)    => api.get(`/users/${id}/stats`),
  addPortfolioItem:  (data)  => api.post('/users/portfolio', data),
  removePortfolioItem: (id)  => api.delete(`/users/portfolio/${id}`),
};

// ════════════════════════════════════════════════════════════════════════════
// JOBS
// ════════════════════════════════════════════════════════════════════════════
export const jobAPI = {
  getAll:       (params) => api.get('/jobs', { params }),
  getById:      (id)     => api.get(`/jobs/${id}`),
  create:       (data)   => api.post('/jobs', data),
  update:       (id, data) => api.put(`/jobs/${id}`, data),
  remove:       (id)     => api.delete(`/jobs/${id}`),
  getMyJobs:    (params) => api.get('/jobs/my-jobs', { params }),
  getCategories: ()      => api.get('/jobs/categories'),
};

// ════════════════════════════════════════════════════════════════════════════
// APPLICATIONS
// ════════════════════════════════════════════════════════════════════════════
export const applicationAPI = {
  apply:              (data)   => api.post('/applications', data),
  getMyApplications:  (params) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getById:            (id)     => api.get(`/applications/${id}`),
  updateStatus:       (id, data) => api.patch(`/applications/${id}/status`, data),
  withdraw:           (id)     => api.patch(`/applications/${id}/withdraw`),
};

export default api;
