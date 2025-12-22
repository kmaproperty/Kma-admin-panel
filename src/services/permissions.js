import { axiosInstance } from "./axiosService";

export const permissionsListApiPayload = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/permissions", {
    params: { page, limit, search }
  });
  return data;
};