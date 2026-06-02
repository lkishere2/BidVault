import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const SKIP_REFRESH_PATHS = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
];

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

type QueueEntry = { resolve: () => void; reject: (err: unknown) => void; };
let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

function enqueueRequest(): Promise<void> {
    return new Promise((resolve, reject) => refreshQueue.push({ resolve, reject }));
}

function flushRefreshQueue(error: unknown) {
    refreshQueue.forEach((entry) => error ? entry.reject(error) : entry.resolve());
    refreshQueue = [];
}

interface RetryableConfig extends AxiosRequestConfig { _retry?: boolean; }

function shouldSkipRefresh(url: string | undefined): boolean {
    return SKIP_REFRESH_PATHS.some((path) => url?.includes(path));
}

async function refreshAccessToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

    localStorage.setItem('accessToken', response.data.accessToken);
    if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest: RetryableConfig = error.config;
        const status: number | undefined = error.response?.status;
        const shouldIntercept = status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url);

        if (!shouldIntercept) return Promise.reject(error);
        if (isRefreshing) return enqueueRequest().then(() => api(originalRequest));

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await refreshAccessToken();
            flushRefreshQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            flushRefreshQueue(refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export async function logout(): Promise<void> {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        // Send the refresh token to the backend in the header so it can be blacklisted/invalidated
        if (refreshToken) {
            await api.post('/auth/logout', undefined, {
                headers: {
                    'X-Refresh-Token': refreshToken,
                },
            });
        } else {
            await api.post('/auth/logout');
        }
    } catch {
        // Intentionally swallowed - we want to force the frontend logout regardless of backend errors
    } finally {
        // Clear ALL auth-related items from local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('bidvault_user');

        window.location.href = '/login';
    }
}

export default api;