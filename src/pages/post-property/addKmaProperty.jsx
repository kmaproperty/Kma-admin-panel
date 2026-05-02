import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../../services/axiosService";
import { toast } from "react-toastify";

const SELLER_URL =
  import.meta.env.VITE_SELLER_URL || "https://seller.kmaglobalproperty.com";

export default function AddKmaProperty() {
  const [iframeSrc, setIframeSrc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.post("admin/auth/kma-internal-login");
        if (cancelled) return;
        const at = data?.accessToken;
        const rt = data?.refreshToken;
        if (!at || !rt) {
          setError("Failed to issue KMA CP tokens");
          setLoading(false);
          return;
        }
        const url = `${SELLER_URL}/api/set-token?embed=1&at=${encodeURIComponent(
          at
        )}&rt=${encodeURIComponent(rt)}&redirect=${encodeURIComponent(
          "/post-property"
        )}`;
        setIframeSrc(url);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message || err?.message || "Failed to start KMA property post";
        setError(Array.isArray(msg) ? msg.join(", ") : msg);
        setLoading(false);
        toast.error(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenInTab = () => {
    if (iframeSrc) window.open(iframeSrc, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-4 lg:p-6 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Add KMA Property</h1>
          <p className="text-xs text-gray-500 mt-1">
            Posting as <span className="font-medium">KMA Internal CP</span>. Submissions are auto-approved
            and published instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenInTab}
          disabled={!iframeSrc}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Open in new tab
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Preparing KMA Internal CP session…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {iframeSrc && !error && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="Post Property as KMA Internal CP"
            className="w-full"
            style={{ height: "calc(100vh - 160px)", border: 0 }}
            allow="clipboard-write; fullscreen"
          />
        </div>
      )}
    </div>
  );
}
