import axios from "axios";
import { axiosInstance } from "./axiosService";

// --- Cities ---
export const getCityApiHandler = async () => {
  try {
    const response = await axiosInstance.get("users/cities");
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Property List ---
export const getPropertyListApiHandler = async () => {
  try {
    const response = await axiosInstance.get("property/listing-types");
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Property Category ---
export const getPropertyCategoryApiHandler = async () => {
  try {
    const response = await axiosInstance.get("property/categories");
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Property Types ---
export const getPropertyTypeApiHandler = async ({ propertyListType, propertyCategory }) => {
  try {
    const response = await axiosInstance.get("property/master/property-types", {
      params: {
        "property-listing-type": propertyListType,
        "property-category": propertyCategory,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- City Search ---
export const getCitySearchApiHandler = async (q) => {
  try {
    const response = await axiosInstance.get("property/cities/search", {
      params: { q },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Building Search ---
export const getBuildingSearchApiHandler = async ({ query, cityId, cityName }) => {
  try {
    const response = await axiosInstance.get("property/locations/search", {
      params: { q: query, cityId: cityId ?? "", cityName: cityName ?? "" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Locality Search ---
export const getLocalitySearchApiHandler = async ({ query, cityId, cityName }) => {
  try {
    const response = await axiosInstance.get("property/localities/search", {
      params: { q: query, cityId: cityId ?? "", cityName: cityName ?? "" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- BHK / Built-up Area ---
export const getBhkApiHandler = async ({ societyId, propertyTypeId }) => {
  try {
    const response = await axiosInstance.get("property/bhk-types-and-areas", {
      params: { societyId: societyId ?? "", propertyTypeId: propertyTypeId ?? "" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Presigned URL for File Upload ---
export const getFileUploadUrlApiHandler = async (payload) => {
  try {
    const response = await axiosInstance.post("uploads/presigned-url", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

// --- Upload File to S3 ---
export const uploadFileToS3ApiHandler = async ({ url, file }) => {
  try {
    const response = await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return {
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    throw error.response?.data ?? error;
  }
};
