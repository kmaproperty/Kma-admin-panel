import { axiosInstance } from "./axiosService";

export const fetchKmaReviews = async ({ page, limit, search, isApproved } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (typeof isApproved === "boolean") params.isApproved = isApproved;
  const { data } = await axiosInstance.get("admin/rating-reviews", { params });
  return data;
};

export const approveKmaReview = async ({ id, comment } = {}) => {
  const { data } = await axiosInstance.post(`admin/rating-reviews/${id}/approve`, {
    ...(comment ? { comment } : {}),
  });
  return data;
};

export const disapproveKmaReview = async ({ id, comment } = {}) => {
  const { data } = await axiosInstance.post(`admin/rating-reviews/${id}/disapprove`, {
    ...(comment ? { comment } : {}),
  });
  return data;
};
