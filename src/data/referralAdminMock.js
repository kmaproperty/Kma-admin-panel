export const REFERRAL_STATUS = {
  PENDING: "Pending",
  IN_PROCESS: "In Process",
  DEAL_CLOSED: "Deal Closed",
};

export const PROPERTY_TYPES = ["Buy", "Sell", "Rent"];

export const REDEEM_STATUS = {
  REQUESTED: "Requested",
  PROCESSING: "Processing",
  PAID: "Paid",
};

const baseDate = "2026-04-01T10:30:00.000Z";

export const initialMockReferrals = [
  {
    id: "ref-1",
    referrerName: "Amit",
    referrerUniqueId: "USER_AMIT_1024",
    clientName: "Rahul Sharma",
    clientMobile: "9876543210",
    channelPartnerId: "cp-1",
    channelPartnerName: "Partner ABC",
    propertyType: "Buy",
    location: "Pune, Maharashtra",
    status: REFERRAL_STATUS.PENDING,
    coinsCredited: 0,
    submittedAt: baseDate,
  },
  {
    id: "ref-2",
    referrerName: "Amit",
    referrerUniqueId: "USER_AMIT_1024",
    clientName: "Neha Patil",
    clientMobile: "9123456780",
    channelPartnerId: "cp-1",
    channelPartnerName: "Partner ABC",
    propertyType: "Rent",
    location: "Mumbai",
    status: REFERRAL_STATUS.IN_PROCESS,
    coinsCredited: 0,
    submittedAt: "2026-04-02T14:00:00.000Z",
  },
  {
    id: "ref-3",
    referrerName: "Priya",
    referrerUniqueId: "USER_PRIYA_2201",
    clientName: "Vikram Singh",
    clientMobile: "9988776655",
    channelPartnerId: "cp-2",
    channelPartnerName: "Partner XYZ",
    propertyType: "Sell",
    location: "Bangalore",
    status: REFERRAL_STATUS.DEAL_CLOSED,
    coinsCredited: 500,
    submittedAt: "2026-03-28T09:15:00.000Z",
  },
  {
    id: "ref-4",
    referrerName: "Priya",
    referrerUniqueId: "USER_PRIYA_2201",
    clientName: "Anita Desai",
    clientMobile: "9000011122",
    channelPartnerId: "cp-2",
    channelPartnerName: "Partner XYZ",
    propertyType: "Buy",
    location: "",
    status: REFERRAL_STATUS.PENDING,
    coinsCredited: 0,
    submittedAt: "2026-04-05T11:20:00.000Z",
  },
];

export const initialMockRedeemRequests = [
  {
    id: "rdm-1",
    userName: "Amit",
    uniqueId: "USER_AMIT_1024",
    coins: 800,
    method: "UPI",
    payoutDetail: "amit@upi",
    status: REDEEM_STATUS.REQUESTED,
    requestedAt: "2026-04-06T08:00:00.000Z",
  },
  {
    id: "rdm-2",
    userName: "Priya",
    uniqueId: "USER_PRIYA_2201",
    coins: 500,
    method: "Bank Transfer",
    payoutDetail: "HDFC ****4521",
    status: REDEEM_STATUS.PROCESSING,
    requestedAt: "2026-04-04T16:30:00.000Z",
  },
];

export const initialMockPayoutAudit = [
  {
    id: "aud-1",
    paidToName: "Amit",
    uniqueId: "USER_AMIT_1024",
    coins: 300,
    amountInr: 30,
    method: "UPI",
    processedAt: "2026-03-20T12:00:00.000Z",
    adminName: "Admin One",
  },
];
