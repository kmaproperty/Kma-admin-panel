// Add KMA Property — admin route that hosts the *literal* seller-frontend
// post-property module under a KMA-Internal-CP session. The whole UI/flow
// (4-step wizard, property-type icons, city/locality/society autocomplete,
// amenities, photos, videos) is driven by the components copied from
// kma-website-frontend/seller — see /src/cp/components/postProperty/*.
//
// The only admin-specific shell here is:
//   1) issuing KMA Internal CP tokens for property/* and uploads/* requests
//      (handled by axiosService's CP-token interceptor)
//   2) translating the admin route shape (?id=<uuid>) into the seller's
//      params.propertyId expectation. Done via the localStorage-bridged
//      Redux store + the seller's own restore logic in form.tsx.
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { axiosInstance } from "../../services/axiosService";
import ContentLayout from "../../cp/components/postProperty/contentLayout";
import { PROPERTY_FORM_MODE } from "../../cp/lib/enums";

function useKmaCpSession() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.post("admin/auth/kma-internal-login");
        if (cancelled) return;
        if (!data?.accessToken) {
          setError("Failed to issue KMA Internal CP tokens");
          return;
        }
        sessionStorage.setItem("cpAccessToken", data.accessToken);
        sessionStorage.setItem("cpRefreshToken", data.refreshToken);
        // Some seller code reads localStorage("user") to render owner name.
        // Plant a synthetic record so the welcome heading shows correctly.
        try {
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: "6545765e-ae9a-47ee-9c5c-0728710f1815",
              name: "KMA Internal CP",
              role: "CHANNEL_PARTNER",
              phone: "9000000000",
              email: "internal@kmaglobalproperty.com",
              isActive: true,
            })
          );
        } catch {/* ignore */}
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || "Auth failed");
      }
    })();
    return () => {
      cancelled = true;
      sessionStorage.removeItem("cpAccessToken");
      sessionStorage.removeItem("cpRefreshToken");
    };
  }, []);
  return { ready, error };
}

export default function AddKmaProperty() {
  const session = useKmaCpSession();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const editId = params?.propertyId || searchParams.get("id");
  const mode = editId ? PROPERTY_FORM_MODE.EDIT : PROPERTY_FORM_MODE.CREATE;

  if (session.error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-text-red/30 bg-text-red/5 p-4 text-sm text-text-red">
          {session.error}
        </div>
      </div>
    );
  }
  if (!session.ready) {
    return (
      <div className="p-6 flex items-center gap-3 text-sm text-text-gray">
        <Loader2 className="w-4 h-4 animate-spin" />
        Initialising KMA Internal CP session…
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <ContentLayout mode={mode} />
    </div>
  );
}
