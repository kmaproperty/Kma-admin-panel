import { axiosInstance } from "./axiosService";

/* Contact Details */

export const CreateContactDetailsApiHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "contact-us",
      payload
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

/* Validate Channel Partner Code */

export const ValidateChannelPartnerCodeApiHandler = async (payload) => {
  try {
    const response = await axiosInstance.get(
      "channel-partner-codes/validate",
      {
        params: payload,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

/* User Dashboard */

export const UserDashboardDetailsApiHandler = async () => {
  try {
    const response = await axiosInstance.get(
      "users/dashboard"
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

/* Upgrade Owner to Channel Partner */

export const UpgreadOwnerToChannelPartnerApiHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "users/upgrade-channel-partner",
      payload
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

/* User Logout */

export const UserLogoutApiHandler = async () => {
  try {
    const response = await axiosInstance.post(
      "users/logout"
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};

/* Channel Partner Agreement */

export const ChannelPartnerAgreementApiHandler = async (returnUrl) => {
  try {
    const response = await axiosInstance.post(
      "users/docusign/channel-partner-agreement",
      { returnUrl }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data ?? error;
  }
};
