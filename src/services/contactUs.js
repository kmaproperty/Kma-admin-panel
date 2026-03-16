import { axiosInstance } from "./axiosService";

export const fetchContactUs = async ({ page, limit, search }) => {
  const { data } = await axiosInstance.get("admin/contact-us", {
    params: { page, limit, search },
  });
  return data;
};
