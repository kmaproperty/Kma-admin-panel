import axios from "axios";
import { handleRefreshToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach access token.
// Default = admin accessToken from localStorage. The "Add KMA Property"
// page stashes a Channel-Partner-shaped token in sessionStorage that we
// ONLY substitute for property/* and uploads/* endpoints — admin/* and
// every other admin route always sees the admin token, otherwise the
// dashboard etc. would 401-and-logout right after sign-in.
const CP_TOKEN_URL_PREFIXES = ["property/", "/property/", "uploads/", "/uploads/"];
axiosInstance.interceptors.request.use(
  async (config) => {
    const url = config.url ?? "";
    const wantsCpToken = CP_TOKEN_URL_PREFIXES.some((p) => url.startsWith(p));
    const cpToken = sessionStorage.getItem("cpAccessToken");
    const accessToken =
      (wantsCpToken && cpToken) || localStorage.getItem("accessToken");
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
