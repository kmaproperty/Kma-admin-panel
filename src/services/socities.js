import { axiosInstance } from "./axiosService";

export const fetchSociety = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/societies", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchSocietyById = async (id) => {
  const { data } = await axiosInstance.get(`admin/societies/${id}`);
  return data;
};

export const createSociety = async (payload) => {
  const { data } = await axiosInstance.post("admin/societies", payload);
  return data;
};

export const updateSociety = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/societies/${id}`, payload);
  return data;
};

export const deleteSociety = async (id) => {
  const { data } = await axiosInstance.delete(`admin/societies/${id}`);
  return data;
};
