import axios from "axios";

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://legaltrack-server.onrender.com/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for file uploads with longer timeout
export const fileUploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 דקות להעלאת קבצים
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Utility functions
export const getAuthToken = (): string | null => {
  try {
    let token = localStorage.getItem("token");
    if (token) {
      return token.replace(/^"|"$/g, '');
    }
    return null;
  } catch {
    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API call wrapper
export const apiCall = async <T>(
  request: () => Promise<{ data: T }>
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.data?.message || error.message,
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
};

export { API_BASE_URL };