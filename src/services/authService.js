import axios from "axios";
import { axiosInstance } from "./axiosService";


export const sendSignUpOtpApiHandler = async (
  payload
) => {
  try {
    const response = await axiosInstance.post(
      "users/signup/send-otp",
      payload
    );

    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

export const sendSignInOtpApiHandler = async (
  payload
) => {
  try {
    const response = await axiosInstance.post(
      "users/login/send-otp",
      payload
    );

    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

export const handleRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/refresh-token`,
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
