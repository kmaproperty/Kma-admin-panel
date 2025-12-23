import { axiosInstance } from "./axiosService";

export const adminsListApiPayload = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/admins", {
    params: { page, limit, search }
  });
  return data;
};

export const adminCreateApiPayload = async (payload) => {
  const { data } = await axiosInstance.post(`admin/admins`, payload);
  return data;
};