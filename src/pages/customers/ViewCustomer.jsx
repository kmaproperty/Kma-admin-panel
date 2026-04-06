import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Chip } from "@mui/material";
import { indigo, green, red } from "@mui/material/colors";
import {
  Mail,
  Phone,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { getPartnerApiHandler } from "../../services/channelPartnerService";
import MainWrapper from "../../components/common/layout/mainWrapper";

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

export default function ViewCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["customer-detail", id],
    queryFn: () => getPartnerApiHandler(id),
    enabled: !!id,
  });

  const user = userData?.data || userData || {};

  const profileImg = user.profileImage
    ? user.profileImage.startsWith("http") ? user.profileImage : `${AWS_URL}${user.profileImage}`
    : null;

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
          onClick={() => navigate("/customers")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Customers
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
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <Avatar sx={{ width: 96, height: 96, bgcolor: indigo[700], fontSize: "2rem" }}>
                    {(user.name || "CU").slice(0, 2).toUpperCase()}
                  </Avatar>
                )}
                <Chip
                  label={user.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: user.isActive ? green[50] : red[50],
                    color: user.isActive ? green[700] : red[700],
                    fontWeight: 600,
                  }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{user.name || "-"}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Customer</p>
                <p className="text-xs text-gray-400 mt-1">
                  <MapPin size={12} className="inline mr-1" />
                  {user.cities || "-"} &middot; Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}
                </p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email || "-"}</span>
                  <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total Properties" value={user.totalProperties ?? 0} color="indigo" />
            <StatCard label="For Sale" value={user.saleProperties ?? 0} color="blue" />
            <StatCard label="For Rent" value={user.rentedProperties ?? 0} color="green" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Details</h3>
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="Intent" value={user.intent} />
            <InfoRow label="Phone Verified" value={user.phoneVerified ? "Yes" : "No"} />
            <InfoRow label="Is Blocked" value={user.isBlocked ? "Yes" : "No"} />
            <InfoRow label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-"} />
          </div>
        </div>
      </div>
    </MainWrapper>
  );
}
