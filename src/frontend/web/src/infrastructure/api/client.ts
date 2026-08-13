import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

let BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";
if (BASE_URL && !BASE_URL.endsWith("/api") && !BASE_URL.endsWith("/api/")) {
  BASE_URL = BASE_URL.replace(/\/$/, "") + "/api";
}

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 15000, // 15 second timeout to prevent hanging requests
});

// Separate instance for authenticated requests that need cookies (refresh token)
const authInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
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
  
  // Delete Content-Type for FormData, Axios handles it automatically and appends boundary in v1+
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

export const refreshAuthToken = (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await authInstance.post(
        '/auth/refresh',
        {},
        { 
          headers: { 'X-Skip-Retry': '1' } 
        }
      );
      
      setAccessToken(data.accessToken);
      processQueue(null, data.accessToken);
      resolve(data.accessToken);
    } catch (err) {
      processQueue(err, null);
      setAccessToken(null);
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth/refresh;";
      reject(err);
    } finally {
      isRefreshing = false;
    }
  });
};

// Response interceptor — surface API errors cleanly
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isPublicEndpoint = originalRequest?.url?.startsWith("/public/");
    const isAuthEndpoint =
      originalRequest?.url === "/auth/refresh" ||
      originalRequest?.url === "/auth/me" ||
      originalRequest?.url === "/auth/logout";
    const shouldRetryOn401 =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      !isPublicEndpoint &&
      !originalRequest.headers?.['X-Skip-Retry'];

    if (shouldRetryOn401) {
      originalRequest._retry = true;
      try {
        const token = await refreshAuthToken();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (err) {
        window.dispatchEvent(new Event("auth:force-logout"));
        return Promise.reject(err);
      }
    }

    // Default error handling
    let message = (error.response?.data as any)?.message ?? error.message ?? "Unknown API error";
    
    if (error.response?.data) {
      const data = error.response.data as any;
      if (typeof data === "string") {
        message = data;
      } else if (data.title && data.errors) {
        const errors = Object.values(data.errors).flat();
        if (errors.length > 0) {
          message = `${data.title}: ${errors.join(", ")}`;
        } else {
          message = data.title;
        }
      } else if (data.detail) {
        message = data.detail;
      } else if (data.title) {
        message = data.title;
      }
    }

    const rejectError = new Error(message) as any;
    rejectError.response = error.response;
    return Promise.reject(rejectError);
  }
);

export const apiClient = instance;
export default apiClient;
export const getAccessToken = () => _accessToken;
