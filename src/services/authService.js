import axios from "axios";
import { axiosInstance } from "./axiosService";

export const handleRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/refresh-token`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newAccessToken = response?.data?.accessToken;

    if (newAccessToken) {
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export const loginApi = async (payload) => {
  try {
    // Clear any stale KMA Internal CP tokens left in sessionStorage from a
    // previous Add-KMA-Property session — otherwise the axios interceptor
    // could attach them to fresh admin requests and trigger an instant 401.
    sessionStorage.removeItem("cpAccessToken");
    sessionStorage.removeItem("cpRefreshToken");
    const response = await axiosInstance.post("admin/login", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};
