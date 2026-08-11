// Slim stub of seller's userService — only what the postProperty form
// actually consumes, with KMA-Internal-CP semantics (always KYC'd, unlimited
// listings, role = CHANNEL_PARTNER).

export interface UserDashboardDetailsResponse {
  role: string;
  intent?: string;
  kycStatus?: {
    kyc_completed: boolean;
    kyc_status?: string;
  };
  freeListings: {
    total: number;
    used: number;
    remaining: number;
  };
}

// KMA Internal CP is always treated as KYC-complete with unlimited listings.
export const UserDashboardDetailsApiHandler = async (): Promise<UserDashboardDetailsResponse> => {
  return {
    role: "CHANNEL_PARTNER",
    intent: "channel_partner",
    kycStatus: {
      kyc_completed: true,
      kyc_status: "approved",
    },
    freeListings: {
      total: 9999,
      used: 0,
      remaining: 9999,
    },
  };
};
