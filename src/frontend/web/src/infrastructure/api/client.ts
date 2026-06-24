import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

let BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";
if (BASE_URL && !BASE_URL.endsWith("/api") && !BASE_URL.endsWith("/api/")) {
  BASE_URL = BASE_URL.replace(/\/$/, "") + "/api";
}

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor — attach JWT from memory (NOT localStorage)
let _accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  _accessToken = token;
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};

instance.interceptors.request.use((config) => {
  if (_accessToken && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

// Response interceptor — surface API errors cleanly
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        setAccessToken(data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        
        return instance(originalRequest);
      } catch (err) {
        setAccessToken(null);
        window.dispatchEvent(new Event("auth:force-logout"));
        return Promise.reject(err);
      }
    }

    // Default error handling
    const message = (error.response?.data as any)?.message ?? error.message ?? "Unknown API error";
    const rejectError = new Error(message) as any;
    rejectError.response = error.response;
    return Promise.reject(rejectError);
  }
);

export const apiClient = instance;
export default apiClient;
export const getAccessToken = () => _accessToken;
