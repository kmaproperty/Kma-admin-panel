import { axiosInstance } from "./axiosService";

export const fetchBhk = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/bhks", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchBhkById = async (id) => {
  const { data } = await axiosInstance.get(`admin/bhks/${id}`);
  return data;
};

export const createBhk = async (payload) => {
  const { data } = await axiosInstance.post("admin/bhks", payload);
  return data;
};

export const updateBhk = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/bhks/${id}`, payload);
  return data;
};

export const deleteBhk = async (id) => {
  const { data } = await axiosInstance.delete(`admin/bhks/${id}`);
  return data;
};
