import { axiosInstance } from "./axiosService";

export const fetchAboutUs = async ({ page, limit }) => {
  const { data } = await axiosInstance.get("admin/about-us", { params: { page, limit } });
  return data;
};

export const createAboutUs = async (payload) => {
  const { data } = await axiosInstance.post("admin/about-us", payload);
  return data;
};

export const updateAboutUs = async ({ id, payload }) => {
  const { data } = await axiosInstance.patch(`admin/about-us/${id}`, payload);
  return data;
};
