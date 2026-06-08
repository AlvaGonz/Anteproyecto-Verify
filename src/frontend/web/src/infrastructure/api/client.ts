import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor — attach JWT from memory (NOT localStorage)
let _accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

// We don't attach Bearer token here because we use HttpOnly cookies
// But we keep _accessToken in memory if needed by tests/auth state.
instance.interceptors.request.use((config) => {
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor — surface API errors cleanly
instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return instance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        
        return instance(originalRequest);
      } catch (err) {
        processQueue(err as Error, null);
        setAccessToken(null);
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Default error handling
    const message = (error.response?.data as any)?.message ?? error.message ?? "Unknown API error";
    // We reject with an error that retains the response property so that tests like 'toMatchObject({ response: { status: 500 } })' work
    const rejectError = new Error(message) as any;
    rejectError.response = error.response;
    return Promise.reject(rejectError);
  },
);

export const apiClient = instance;
export default apiClient;
export const getAccessToken = () => _accessToken;
