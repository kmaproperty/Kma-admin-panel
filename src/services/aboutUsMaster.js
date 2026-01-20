import { axiosInstance } from "./axiosService";

export const fetchAboutus = async () => {
  const { data } = await axiosInstance.get("admin/configurations");
  return data;
};


export const createAboutusmasterConfiguration = async ({ id, payload }) => {
  const { data } = await axiosInstance.post("admin/configurations", payload);
  return data;
};

export const updateAboutusmasterConfiguration = async ({ id, payload }) => {

  const { data } = await axiosInstance.patch(`admin/configurations/${id}`, payload);
  return data;
};

export const deleteAboutusmasterConfiguration = async (id) => {
  const { data } = await axiosInstance.delete(`admin/configurations/${id}`);
  return data;
};
