import { axiosInstance } from "./axiosService";

export const fetchVerifyPropertyList = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/property-verifications", {
    params: { page, limit, search }
  });
  return data;
};

export const fetchVerifyPropertyById = async (id) => {
  const { data } = await axiosInstance.get(`admin/property-verifications/${id}`);
  return data;
};

export const approveVerifyProperty = async ({ id, payload }) => {
  const { data } = await axiosInstance.post(`admin/property-verifications/${id}/approve`, payload);
  return data;
};

export const rejectVerifyProperty = async ({ id, payload }) => {

  const { data } = await axiosInstance.post(`admin/property-verifications/${id}/reject`, payload);
  return data;
};