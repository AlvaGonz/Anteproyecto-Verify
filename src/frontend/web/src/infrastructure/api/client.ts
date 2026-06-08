import axios, { type AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

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

instance.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Response interceptor — surface API errors cleanly
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Unknown API error";
    return Promise.reject(new Error(message));
  },
);

export const apiClient = instance;
export default apiClient;
export const getAccessToken = () => _accessToken;
