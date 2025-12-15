import axios from "axios";
import { handleRefreshToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.log('error', error)
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    // Prevent infinite retry loop
    console.log('error',error)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await handleRefreshToken();
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }else{
          window.location.href = '/sign-in'
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        localStorage.clear();
        window.location.href = "/sign-in"
      }
    }else if(error.response?.status === 401){
      localStorage.clear();
      window.location.href = "/sign-in"
    }
    console.log('error in reject', error)
    return Promise.reject(error?.response?.data ?? error);
  }
);
