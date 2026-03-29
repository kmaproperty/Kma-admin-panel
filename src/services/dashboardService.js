import { axiosInstance } from "./axiosService";

export const fetchDashboardStats = async () => {
  const { data } = await axiosInstance.get("admin/dashboard/stats");
  return data;
};
