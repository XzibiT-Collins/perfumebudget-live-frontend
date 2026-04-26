/// <reference types="vite/client" />
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND_URL
    ? `${import.meta.env.VITE_API_BACKEND_URL}${import.meta.env.VITE_API_BASE_URL || '/api/v1'}`
    : (import.meta.env.VITE_API_BASE_URL || '/api/v1'),
  withCredentials: true, // Cookie-based JWT (access + refresh cookies)
});

// ─── Token-refresh queue ──────────────────────────────────────────────────────
//
// Problem: if 3 requests fire simultaneously and all hit a 401, without
// coordination all 3 would race to call /auth/refresh. The queue ensures
// exactly one refresh attempt runs at a time — the other failed requests
// are paused and retried automatically once a new token is issued.

type QueueEntry = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

/** Flush the queue: resolve all waiters on success, reject all on failure. */
const processQueue = (error: unknown) => {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(null);
    }
  });
  failedQueue = [];
};

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    const status = error.response?.status;

    // Only attempt refresh for 401 errors that haven't already been retried,
    // and skip the refresh endpoint itself to avoid infinite loops.
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const isLoginEndpoint = originalRequest.url?.includes('/auth/login');

    if (status === 401 && !originalRequest._retry && !isRefreshEndpoint && !isLoginEndpoint) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one to retry later.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh endpoint — the refresh token arrives via httpOnly cookie
        // so no body is needed; the server reads it from the cookie automatically.
        await api.post('/auth/refresh');

        processQueue(null); // Let all queued requests retry
        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        processQueue(refreshError); // Reject all queued requests

        // Refresh itself failed — the session is truly expired.
        // Dispatch a custom event so AuthContext can log the user out cleanly.
        window.dispatchEvent(new CustomEvent('auth:session-expired'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, log them (but don't toast — let callers handle UI).
    if (status !== 401) {
      const message =
        error.response?.data?.description ||
        error.response?.data?.message ||
        error.message ||
        'Something went wrong';
      console.error('API Error:', message);
    }

    return Promise.reject(error);
  }
);

export default api;
