import { axiosInstance } from "./axiosService";

export const fetchAmenities = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/amenities", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchAmenityById = async (id) => {
  const { data } = await axiosInstance.get(`admin/amenities/${id}`);
  return data;
};

export const createAmenity = async (payload) => {
  const { data } = await axiosInstance.post("admin/amenities", payload);
  return data;
};

export const updateAmenity = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/amenities/${id}`, payload);
  return data;
};

export const deleteAmenity = async (id) => {
  const { data } = await axiosInstance.delete(`admin/amenities/${id}`);
  return data;
};
