import { axiosInstance } from "./axiosService";

export const fetchLocality = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/localities", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchLocalityById = async (id) => {
  const { data } = await axiosInstance.get(`admin/localities/${id}`);
  return data;
};

export const createLocality = async (payload) => {
  const { data } = await axiosInstance.post("admin/localities", payload);
  return data;
};

export const updateLocality = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/localities/${id}`, payload);
  return data;
};

export const deleteLocality = async (id) => {
  const { data } = await axiosInstance.delete(`admin/localities/${id}`);
  return data;
};
