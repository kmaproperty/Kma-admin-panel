import { axiosInstance } from "./axiosService";

export const channelPartnersListApiPayload = async (paylaod) => {
    try{
        const response = await axiosInstance.get(
      "admin/users",{
        params: paylaod
      });
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const channelPartnersDetailsApiHandler = async (id) => {
    try{
        const response = await axiosInstance.get(
      "admin/users/" + id);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const getCPPropertiesApiHandler = async ({ id, page = 1, limit = 10 }) => {
    try {
        const response = await axiosInstance.get("admin/properties", {
            params: { page, limit, userId: id }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data ?? error;
    }
}

export const getCPReviewsApiHandler = async (id) => {
    try {
        const response = await axiosInstance.get(
            `end-user/channel-partners/${id}/reviews`, {
                params: { page: 1, limit: 50, sortBy: 'newest' }
            });
        return response.data;
    } catch (error) {
        throw error.response?.data ?? error;
    }
}

export const channelPartnerCodesListApiPayload = async (paylaod) => {
    try{
        const response = await axiosInstance.get(
      "admin/channel-partner-codes",{
        params: paylaod
      });
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const deletePartnerCodeApiHandler = async (id) => {
    try{
        const response = await axiosInstance.delete(
      "admin/channel-partner-codes/" + id);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const addPartnerCodeApiHandler = async (paylaod) => {
    try{
        const response = await axiosInstance.post(
      "admin/channel-partner-codes", paylaod);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const editPartnerCodeApiHandler = async ({ payload, id }) => {
  console.log("Payload inside handler:", payload, "ID:", id);
  try {
    const response = await axiosInstance.put(
      `/admin/channel-partner-codes/${id}`, 
      payload // Match the variable name here
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
}

export const getPartnerCodeApiHandler = async (id) => {
    try{
        const response = await axiosInstance.get(
      "admin/channel-partner-codes/" + id);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const getPartnerApiHandler = async (id) => {
    try{
        const response = await axiosInstance.get(
      "/admin/users/" + id);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}


export const editPartnerApiHandler = async ({ payload, id }) => {
  try {
    const response = await axiosInstance.patch(
      `/admin/users/${id}`,
      payload // Match the variable name here
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
}

export const blockUserApi = async (id) => {
  try {
    const response = await axiosInstance.post(`/admin/users/${id}/block`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};
export const unblockUserApi = async (id) => {
  try {
    const response = await axiosInstance.post(`/admin/users/${id}/unblock`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

export const approveRejectProfilePhotoApi = async ({payload,id}) => {
  try {
    const response = await axiosInstance.post(`/admin/users/${id}/approve-kyc`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};