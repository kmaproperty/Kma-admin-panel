import { axiosInstance } from "./axiosService";

/**
 * Expected API shapes (implement on backend):
 * GET admin/referrals → { data: Referral[], total: number }
 * PATCH admin/referrals/:id → { success, message }
 * GET admin/referrals/redeem-requests → { data: RedeemRequest[], total }
 * PATCH admin/referrals/redeem-requests/:id → body: { status: 'Paid' | 'Processing', ... }
 * GET admin/referrals/payout-audit → { data: AuditRow[], total }
 */

export async function fetchAdminReferrals(params) {
  const { data } = await axiosInstance.get("admin/referrals", { params });
  return data;
}

export async function patchAdminReferral(id, payload) {
  const { data } = await axiosInstance.patch(`admin/referrals/${id}`, payload);
  return data;
}

export async function fetchRedeemRequests(params) {
  const { data } = await axiosInstance.get("admin/referrals/redeem-requests", {
    params,
  });
  return data;
}

export async function patchRedeemRequest(id, payload) {
  const { data } = await axiosInstance.patch(
    `admin/referrals/redeem-requests/${id}`,
    payload
  );
  return data;
}

export async function fetchPayoutAuditLog(params) {
  const { data } = await axiosInstance.get("admin/referrals/payout-audit", {
    params,
  });
  return data;
}
