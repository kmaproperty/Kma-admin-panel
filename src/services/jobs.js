import { axiosInstance } from "./axiosService";

export const fetchJobCategories = async () => {
  const { data } = await axiosInstance.get("admin/job-categories");
  return data;
};

export const createJobCategory = async (payload) => {
  const { data } = await axiosInstance.post("admin/job-categories", payload);
  return data;
};

export const updateJobCategory = async ({ id, payload }) => {
  const { data } = await axiosInstance.patch(`admin/job-categories/${id}`, payload);
  return data;
};

export const deleteJobCategory = async (id) => {
  const { data } = await axiosInstance.delete(`admin/job-categories/${id}`);
  return data;
};

export const fetchJobs = async ({ page, limit, search, status }) => {
  const { data } = await axiosInstance.get("admin/jobs", {
    params: { page, limit, search, status },
  });
  return data;
};

export const fetchJobById = async (id) => {
  const { data } = await axiosInstance.get(`admin/jobs/${id}`);
  return data;
};

export const createJob = async (payload) => {
  const { data } = await axiosInstance.post("admin/jobs", payload);
  return data;
};

export const updateJob = async ({ id, payload }) => {
  const { data } = await axiosInstance.patch(`admin/jobs/${id}`, payload);
  return data;
};

export const deleteJob = async (id) => {
  const { data } = await axiosInstance.delete(`admin/jobs/${id}`);
  return data;
};
