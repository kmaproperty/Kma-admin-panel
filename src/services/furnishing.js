import { axiosInstance } from "./axiosService";

export const fetchFurnishing = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/furnishings", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchFurnishingById = async (id) => {
  const { data } = await axiosInstance.get(`admin/furnishings/${id}`);
  return data;
};

export const createFurnishing = async (payload) => {
  const { data } = await axiosInstance.post("admin/furnishings", payload);
  return data;
};

export const updateFurnishing = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/furnishings/${id}`, payload);
  return data;
};

export const deleteFurnishing = async (id) => {
  const { data } = await axiosInstance.delete(`admin/furnishings/${id}`);
  return data;
};
