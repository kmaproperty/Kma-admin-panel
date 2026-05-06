import { axiosInstance } from "./axiosService";

export const fetchLeads = async ({ page, limit, search, status, buildingType }) => {
  const { data } = await axiosInstance.get("admin/leads", {
    params: { page, limit, search, status, buildingType },
  });
  return data;
};

export const fetchLeadById = async (id) => {
  const { data } = await axiosInstance.get(`admin/leads/${id}`);
  return data;
};

export const deleteLead = async (id) => {
  const { data } = await axiosInstance.delete(`admin/leads/${id}`);
  return data;
};
