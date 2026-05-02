import { useState } from "react";
import { axiosInstance } from "../../services/axiosService";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";

const SELLER_URL =
  import.meta.env.VITE_SELLER_URL || "https://seller.kmaglobalproperty.com";

export default function AddKmaProperty() {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("admin/auth/kma-internal-login");
      const accessToken = data?.accessToken;
      const refreshToken = data?.refreshToken;
      if (!accessToken || !refreshToken) {
        toast.error("Failed to issue KMA CP tokens");
        setLoading(false);
        return;
      }

      const url = `${SELLER_URL}/api/set-token?at=${encodeURIComponent(
        accessToken
      )}&rt=${encodeURIComponent(refreshToken)}&redirect=${encodeURIComponent(
        "/post-property"
      )}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to start KMA property post";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add KMA Property</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-2xl">
        Open the seller post-property flow as the KMA Internal Channel Partner. Listings
        you submit through this flow are automatically approved and published — no manual
        verification step is required.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-2xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              Start a new KMA listing
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              You will be signed into the seller app as the KMA Internal CP and dropped
              straight onto the multi-step post-property form. Closing that tab returns
              you here.
            </p>
            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {loading ? "Preparing..." : "Open Post-Property Flow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
