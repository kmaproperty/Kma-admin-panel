import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Chip } from "@mui/material";
import { indigo, green, red, orange } from "@mui/material/colors";
import {
  Check,
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  Star,
  FileText,
  ArrowLeft,
  CreditCard,
  Fingerprint,
  Camera,
  FileCheck,
  Download,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getPartnerApiHandler,
  getCPReviewsApiHandler,
  approveLivePhotoApi,
  approveBankDetailsApi,
  approveAadhaarApi,
} from "../../services/channelPartnerService";
import { propertyListApiPayload } from "../../services/postProperty";
import MainWrapper from "../../components/common/layout/mainWrapper";
import ApproveRejectDialog from "./ApproveRejectDialog";

const AWS_URL = import.meta.env.VITE_AWS_URL || "";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-800 text-right max-w-[60%]">
        {value || "-"}
      </span>
    </div>
  );
}

function StatusBadge({ status, label }) {
  const colors = {
    yes: "bg-green-100 text-green-700",
    no: "bg-red-100 text-red-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-orange-100 text-orange-700",
  };
  const cls = colors[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value, color = "indigo" }) {
  const bgMap = { indigo: "bg-indigo-50", green: "bg-green-50", orange: "bg-orange-50", blue: "bg-blue-50" };
  const textMap = { indigo: "text-indigo-700", green: "text-green-700", orange: "text-orange-700", blue: "text-blue-700" };
  return (
    <div className={`${bgMap[color] || "bg-gray-50"} rounded-xl p-4 text-center`}>
      <p className={`text-2xl font-bold ${textMap[color] || "text-gray-700"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ApprovalStatusBadge({ approved }) {
  if (approved === true) return <StatusBadge status="approved" label="Approved" />;
  if (approved === false) return <StatusBadge status="rejected" label="Rejected" />;
  return <StatusBadge status="pending" label="Pending Review" />;
}

export default function ViewChannelPartner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialog, setDialog] = useState({ open: false, type: "", title: "", apiType: "" });

  const { data: cpData, isLoading } = useQuery({
    queryKey: ["cp-detail", id],
    queryFn: () => getPartnerApiHandler(id),
    enabled: !!id,
  });

  const { data: propertiesData } = useQuery({
    queryKey: ["cp-properties", id],
    queryFn: () => propertyListApiPayload({ userId: id, page: 1, limit: 100 }),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["cp-reviews", id],
    queryFn: () => getCPReviewsApiHandler(id),
    enabled: !!id,
  });

  // Mutations for approve/reject
  const { mutate: approveLivePhoto, isPending: photoLoading } = useMutation({
    mutationFn: approveLivePhotoApi,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["cp-detail", id] });
      closeDialog();
    },
    onError: (err) => toast.error(err?.message || "Failed"),
  });

  const { mutate: approveBankDetails, isPending: bankLoading } = useMutation({
    mutationFn: approveBankDetailsApi,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["cp-detail", id] });
      closeDialog();
    },
    onError: (err) => toast.error(err?.message || "Failed"),
  });

  const { mutate: approveAadhaar, isPending: aadhaarLoading } = useMutation({
    mutationFn: approveAadhaarApi,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["cp-detail", id] });
      closeDialog();
    },
    onError: (err) => toast.error(err?.message || "Failed"),
  });

  const closeDialog = () => setDialog({ open: false, type: "", title: "", apiType: "" });

  const handleDialogSubmit = (comment) => {
    const isApprove = dialog.type === "approve";
    const payload = { approved: isApprove, comment };

    switch (dialog.apiType) {
      case "photo":
        approveLivePhoto({ id, payload });
        break;
      case "bank":
        approveBankDetails({ id, payload });
        break;
      case "aadhaar":
        approveAadhaar({ id, payload });
        break;
    }
  };

  const openApproveDialog = (apiType, label) => {
    setDialog({ open: true, type: "approve", title: `Approve ${label}`, apiType });
  };

  const openRejectDialog = (apiType, label) => {
    setDialog({ open: true, type: "reject", title: `Reject ${label}`, apiType });
  };

  const cp = cpData?.data || cpData || {};
  const properties = propertiesData?.data || [];
  const totalProps = properties.length;
  const activeProps = properties.filter((p) => p.status === "active").length;
  const pendingProps = properties.filter((p) => p.status === "pending_review").length;
  const saleProps = properties.filter((p) => p.listingType?.code === "sale").length;
  const rentProps = properties.filter((p) => p.listingType?.code === "rent").length;

  const experience = useMemo(() => {
    if (!cp.businessSince) return 0;
    const since = new Date(cp.businessSince);
    return Math.max(0, Math.floor((Date.now() - since.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
  }, [cp.businessSince]);

  const profileImg = cp.profileImage
    ? cp.profileImage.startsWith("http") ? cp.profileImage : `${AWS_URL}${cp.profileImage}`
    : null;

  const livePhotoImg = cp.live_photo_url
    ? cp.live_photo_url.startsWith("http") ? cp.live_photo_url : `${AWS_URL}${cp.live_photo_url}`
    : null;

  const kycStatus = cp.kyc_status || {};
  const bankDetails = cp.bank_details;
  const aadhaarMeta = cp.digilocker_metadata || kycStatus?.step2_aadhaar?.digilocker_metadata;

  if (isLoading) {
    return (
      <MainWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <div className="mb-4">
        <button
          onClick={() => navigate("/channel-partners")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Channel Partners
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt={cp.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <Avatar sx={{ width: 96, height: 96, bgcolor: indigo[700], fontSize: "2rem" }}>
                    {(cp.name || "CP").slice(0, 2).toUpperCase()}
                  </Avatar>
                )}
                <Chip
                  label={cp.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: cp.isActive ? green[50] : red[50],
                    color: cp.isActive ? green[700] : red[700],
                    fontWeight: 600,
                  }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{cp.name || "-"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{cp.firmName || "Channel Partner"} &middot; {experience} yrs exp.</p>
                <p className="text-xs text-gray-400 mt-1">
                  <MapPin size={12} className="inline mr-1" />
                  {cp.cities || "-"} &middot; Joined {new Date(cp.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {cp.email || "-"}</span>
                  <span className="flex items-center gap-1.5"><Phone size={14} /> {cp.phone || "-"}</span>
                  <span className="flex items-center gap-1.5"><Building2 size={14} /> {cp.firmName || "-"}</span>
                  <span className="flex items-center gap-1.5"><FileText size={14} /> Code: {cp.channelPartnerCode || "-"}</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">About</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {cp.aboutYourSelf || "No information provided."}
              </p>
            </div>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="Total Properties" value={totalProps} color="indigo" />
            <StatCard label="Active" value={activeProps} color="green" />
            <StatCard label="Pending" value={pendingProps} color="orange" />
            <StatCard label="For Sale" value={saleProps} color="blue" />
            <StatCard label="For Rent" value={rentProps} color="indigo" />
          </div>

          {/* Profile Photo Verification */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Camera size={18} /> Profile Photo Verification
              </h3>
              <ApprovalStatusBadge approved={kycStatus?.step1_live_photo?.live_photo_approved ? true : livePhotoImg ? null : false} />
            </div>

            {livePhotoImg ? (
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <img src={livePhotoImg} alt="Live Photo" className="w-40 h-40 rounded-xl object-cover border border-gray-200" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-4">
                    Review the live photo submitted by the channel partner. Approve if the photo is clear and matches the partner's identity.
                  </p>
                  {!kycStatus?.step1_live_photo?.live_photo_approved && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => openApproveDialog("photo", "Profile Photo")}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => openRejectDialog("photo", "Profile Photo")}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                  {kycStatus?.step1_live_photo?.live_photo_approved && (
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                      <ShieldCheck size={16} /> Photo has been approved
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No live photo submitted yet.</p>
            )}

            {cp.kyc_rejection_reason && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700"><strong>KYC Rejection Reason:</strong> {cp.kyc_rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Agreement Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FileCheck size={18} /> Agreement Status
              </h3>
              <StatusBadge
                status={kycStatus?.step4_docusign_agreement?.docusign_agreement_signed ? "yes" : "no"}
                label={kycStatus?.step4_docusign_agreement?.docusign_agreement_signed ? "Signed" : "Not Signed"}
              />
            </div>

            <InfoRow
              label="Is Agreement Signed"
              value={kycStatus?.step4_docusign_agreement?.docusign_agreement_signed ? "Yes" : "No"}
            />

            {kycStatus?.step4_docusign_agreement?.docusign_agreement_signed && (
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5">
                  <Eye size={14} /> View Agreement
                </button>
                <button className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer flex items-center gap-1.5">
                  <Download size={14} /> Download Agreement
                </button>
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard size={18} /> Bank Details
              </h3>
              <ApprovalStatusBadge approved={cp.bank_details_approved} />
            </div>

            {bankDetails ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <InfoRow label="Account Holder Name" value={bankDetails.account_holder_name} />
                  <InfoRow label="Account Number" value={bankDetails.account_number} />
                  <InfoRow label="Bank Name" value={bankDetails.bank_name} />
                  <InfoRow label="IFSC Code" value={bankDetails.ifsc_code} />
                  {bankDetails.branch_name && <InfoRow label="Branch Name" value={bankDetails.branch_name} />}
                </div>

                {cp.bank_rejection_reason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {cp.bank_rejection_reason}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => openApproveDialog("bank", "Bank Details")}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} /> {cp.bank_details_approved === true ? "Re-Approve" : "Approve"}
                  </button>
                  <button
                    onClick={() => openRejectDialog("bank", "Bank Details")}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Bank details have not been filled yet.</p>
            )}
          </div>

          {/* Aadhaar Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Fingerprint size={18} /> Aadhaar Details
              </h3>
              <ApprovalStatusBadge approved={cp.aadhaar_admin_approved} />
            </div>

            {kycStatus?.step2_aadhaar?.aadhaar_verified ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <InfoRow label="Aadhaar Number" value={cp.aadhaar_number} />
                  <InfoRow label="Name (as per Aadhaar)" value={aadhaarMeta?.name} />
                  <InfoRow label="Mobile Number" value={aadhaarMeta?.mobile_number} />
                  <InfoRow label="Gender" value={aadhaarMeta?.gender} />
                  <InfoRow label="Date of Birth" value={aadhaarMeta?.dob} />
                  <InfoRow
                    label="DigiLocker Verified"
                    value={<StatusBadge status="approved" label="Verified" />}
                  />
                </div>

                {cp.aadhaar_rejection_reason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {cp.aadhaar_rejection_reason}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => openApproveDialog("aadhaar", "Aadhaar Details")}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} /> {cp.aadhaar_admin_approved === true ? "Re-Approve" : "Approve"}
                  </button>
                  <button
                    onClick={() => openRejectDialog("aadhaar", "Aadhaar Details")}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Aadhaar has not been verified yet.</p>
            )}
          </div>

          {/* Recent Properties */}
          {properties.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Properties</h3>
              <div className="space-y-3">
                {properties.slice(0, 5).map((prop) => {
                  const img = prop.photos?.[0]?.fileKey
                    ? `${AWS_URL}${prop.photos[0].fileKey}`
                    : null;
                  return (
                    <div key={prop.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                      {img ? (
                        <img src={img} alt="" className="w-16 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-400">No img</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {prop.society?.name || prop.propertyType?.name || "Property"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {prop.locality?.name}, {prop.city?.name} &middot; {prop.listingType?.name} &middot; {prop.category?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {prop.price ? `₹${Number(prop.price).toLocaleString("en-IN")}` : prop.monthlyRent ? `₹${Number(prop.monthlyRent).toLocaleString("en-IN")}/mo` : "-"}
                        </p>
                        <Chip
                          label={prop.status}
                          size="small"
                          sx={{
                            fontSize: "10px",
                            height: 20,
                            bgcolor: prop.status === "active" ? green[50] : orange[50],
                            color: prop.status === "active" ? green[700] : orange[700],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Reviews & Quick Info */}
        <div className="space-y-6">
          {/* KYC Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">KYC Overview</h3>
            <InfoRow
              label="Overall KYC"
              value={<StatusBadge status={cp.kyc_completed ? "approved" : "pending"} label={cp.kyc_completed ? "Completed" : "Pending"} />}
            />
            <InfoRow
              label="Photo Verification"
              value={<StatusBadge status={kycStatus?.step1_live_photo?.live_photo_approved ? "approved" : livePhotoImg ? "pending" : "no"} label={kycStatus?.step1_live_photo?.live_photo_approved ? "Approved" : livePhotoImg ? "Pending" : "Not Submitted"} />}
            />
            <InfoRow
              label="Aadhaar Verified"
              value={<StatusBadge status={kycStatus?.step2_aadhaar?.aadhaar_verified ? "approved" : "pending"} label={kycStatus?.step2_aadhaar?.aadhaar_verified ? "Verified" : "Not Verified"} />}
            />
            <InfoRow
              label="Bank Details"
              value={<StatusBadge status={kycStatus?.step3_bank_details?.bank_details_filled ? "yes" : "no"} label={kycStatus?.step3_bank_details?.bank_details_filled ? "Filled" : "Not Filled"} />}
            />
            <InfoRow
              label="Agreement Signed"
              value={<StatusBadge status={kycStatus?.step4_docusign_agreement?.docusign_agreement_signed ? "yes" : "no"} label={kycStatus?.step4_docusign_agreement?.docusign_agreement_signed ? "Yes" : "No"} />}
            />
          </div>

          {/* Ratings Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Ratings & Reviews</h3>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold text-gray-800">
                {reviewsData?.averageRating?.toFixed(1) || "0.0"}
              </p>
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(reviewsData?.averageRating || 0) ? "#F7BB06" : "#e5e7eb"}
                      stroke="none"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{reviewsData?.totalReviews || 0} reviews</p>
              </div>
            </div>

            {reviewsData?.starDistribution && (
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Number(reviewsData.starDistribution[String(star)] || 0);
                  const total = Math.max(1, reviewsData.totalReviews || 1);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-gray-500">{star}</span>
                      <Star size={10} fill="#F7BB06" stroke="none" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-gray-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {reviewsData?.reviews?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {reviewsData.reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="pb-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">{r.reviewerName}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} fill={i < r.rating ? "#F7BB06" : "#e5e7eb"} stroke="none" />
                        ))}
                      </div>
                    </div>
                    {r.review && <p className="text-xs text-gray-500 mt-1">{r.review}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Details</h3>
            <InfoRow label="Role" value={cp.role} />
            <InfoRow label="Intent" value={cp.intent} />
            <InfoRow label="Phone Verified" value={cp.phoneVerified ? "Yes" : "No"} />
            <InfoRow label="Is Blocked" value={cp.isBlocked ? "Yes" : "No"} />
            <InfoRow label="Business Since" value={cp.businessSince ? new Date(cp.businessSince).toLocaleDateString("en-IN") : "-"} />
            <InfoRow label="Created" value={cp.createdAt ? new Date(cp.createdAt).toLocaleDateString("en-IN") : "-"} />
          </div>
        </div>
      </div>

      {/* Approve/Reject Dialog */}
      <ApproveRejectDialog
        open={dialog.open}
        title={dialog.title}
        type={dialog.type}
        loading={photoLoading || bankLoading || aadhaarLoading}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
      />
    </MainWrapper>
  );
}
