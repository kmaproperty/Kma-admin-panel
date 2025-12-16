import { axiosInstance } from "./axiosService";

export const fetchCities = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/cities", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchCitiesById = async (id) => {
  const { data } = await axiosInstance.get(`admin/cities/${id}`);
  return data;
};

export const createCities = async (payload) => {
  const { data } = await axiosInstance.post("admin/cities", payload);
  return data;
};

export const updateCities = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/cities/${id}`, payload);
  return data;
};

export const deleteCities = async (id) => {
  const { data } = await axiosInstance.delete(`admin/cities/${id}`);
  return data;
};
