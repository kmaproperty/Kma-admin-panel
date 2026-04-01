import { axiosInstance } from "./axiosService";

export const getPropertyListApiHandler = async () => {
    try{
        const response = await axiosInstance.get(
      "property/listing-types");

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const getPropertyCategoryApiHandler = async () => {
    try{
        const response = await axiosInstance.get(
      "property/categories");

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const getPropertyTypeApiHandler = async ({propertyListType, propertyCategory}) => {
    try{
        const response = await axiosInstance.get(
      "property/master/property-types", {
        params: { 'property-listing-type': propertyListType, 'property-category': propertyCategory} 
      }); 
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step1PostPropertyCreateApiHandler = async (paylaod) => {
    try{
        const response = await axiosInstance.post(
      "property/step-1", paylaod);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step1PostPropertyDetailsApiHandler = async (propertyId) => {
    try{
        const response = await axiosInstance.get(
      `property/step-1/${propertyId}`,);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step2PostPropertyCreateApiHandler = async (paylaod) => {
    try{
        const response = await axiosInstance.post(
      "property/step-2", paylaod);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step2PostPropertyDetailsApiHandler = async (propertyId) => {
    try{
        const response = await axiosInstance.get(
      `property/step-2/${propertyId}`,);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step3PostPropertyCreateApiHandler = async (paylaod) => {
    try{
        const response = await axiosInstance.post(
      "property/step-3", paylaod);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step3PostPropertyDetailsApiHandler = async (propertyId) => {
    try{
        const response = await axiosInstance.get(
      `property/step-3/${propertyId}`,);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step4PostPropertyCreateApiHandler = async (paylaod) => {
    try{
        const response = await axiosInstance.post(
      "property/step-4", paylaod);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const step4PostPropertyDetailsApiHandler = async (propertyId) => {
    try{
        const response = await axiosInstance.get(
      `property/step-4/${propertyId}`,);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const resetPostPropertyApiHandler = async (paylaod) => {
    try{
        const response = await axiosInstance.post(
      "property/reset", paylaod);

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const propertyEditAsAdminAPiPayload = async (paylaod) => {
    try{
        const response = await axiosInstance.patch(
      "admin/properties/" + paylaod.id, paylaod.data);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const propertyListApiPayload = async (paylaod) => {
    try{
        const response = await axiosInstance.get(
      "admin/properties",{
        params: paylaod
      });
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const getPropertyDetailsApiHandler = async (id) => {
    try{
        const response = await axiosInstance.get(
      "admin/properties/" + id);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const deletePropertyApiHandler = async (id) => {
    try{
        const response = await axiosInstance.delete(
      "admin/properties/" + id);
    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const approvePropertyApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/approve`, {
        comment: payload.comment
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const rejectPropertyApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/reject`, {
        comment: payload.comment
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const verifyPropertyApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/verify`, {
        comment: payload.comment
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const markTopPropertiesApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/mark-top`, {
        id: payload.id
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const removeTopPropertiesApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/remove-top`, {
        id: payload.id
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const markFeaturedPropertiesApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/mark-featured`, {
        id: payload.id
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const removeFeaturedPropertiesApiHandler = async (payload) => {
    try{
        const response = await axiosInstance.post(
      `admin/properties/${payload.id}/remove-featured`, {
        id: payload.id
      });

    return response.data;
    }catch(error){
        throw error.response?.data ?? error;
    }
}

export const approveMediaApiHandler = async (payload) => {
    try {
        const response = await axiosInstance.post(
            `admin/properties/${payload.propertyId}/media/approve`, {
                fileKey: payload.fileKey
            });
        return response.data;
    } catch (error) {
        throw error.response?.data ?? error;
    }
}

export const rejectMediaApiHandler = async (payload) => {
    try {
        const response = await axiosInstance.post(
            `admin/properties/${payload.propertyId}/media/reject`, {
                fileKey: payload.fileKey,
                reason: payload.reason
            });
        return response.data;
    } catch (error) {
        throw error.response?.data ?? error;
    }
}

export const bulkApproveMediaApiHandler = async (payload) => {
    try {
        const response = await axiosInstance.post(
            `admin/properties/${payload.propertyId}/media/bulk-approve`, {
                fileKeys: payload.fileKeys
            });
        return response.data;
    } catch (error) {
        throw error.response?.data ?? error;
    }
}