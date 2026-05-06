import { Dialog, DialogContent } from "@mui/material";
import { Mail, Phone, X, MapPin, Building2, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fetchLeadById } from "../../services/leadAdmin";

const formatBudget = (min, max) => {
  const fmt = (n) => {
    if (n == null) return "";
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)} L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)} K`;
    return String(n);
  };
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `₹${fmt(min)} – ₹${fmt(max)}`;
  if (min != null) return `₹${fmt(min)}+`;
  return `Up to ₹${fmt(max)}`;
};

const formatSize = (min, max) => {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `${min}+`;
  return `Up to ${max}`;
};

const safeDate = (iso) => {
  if (!iso) return "—";
  try { return format(parseISO(iso), "dd MMM yyyy, hh:mm a"); } catch { return "—"; }
};

const Row = ({ label, value, href }) => (
  <div className="flex justify-between items-start gap-4 py-3 border-b border-gray-100">
    <p className="text-gray-500 text-sm shrink-0">{label}</p>
    {href ? (
      <a href={href} className="text-gray-800 font-medium text-sm text-right break-all">
        {value || "—"}
      </a>
    ) : (
      <p className="text-gray-800 font-medium text-sm text-right break-words">{value || "—"}</p>
    )}
  </div>
);

export default function ViewLeadDialog({ open, leadId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-lead", leadId],
    queryFn: () => fetchLeadById(leadId),
    enabled: !!leadId && open,
  });

  const lead = data;
  const propertyContacts = lead?.propertyContacts ?? [];
  const notes = lead?.notes ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent className="p-0">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-lg font-semibold text-gray-800">Lead Details</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : !lead ? (
          <div className="p-10 text-center text-gray-500">Lead not found</div>
        ) : (
          <div className="px-5 py-4">
            {/* Top: name + status */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xl font-semibold text-gray-900">{lead.name || "—"}</p>
              <span className="rounded-md bg-blue-100 text-blue-800 px-3 py-1 text-xs font-semibold uppercase">
                {lead.status || "NEW"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-3">
              <Row label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
              <Row label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
              <Row label="Building Type" value={lead.buildingType} />
              <Row label="Properties Contacted" value={lead.propertiesContactedCount ?? 0} />
              <Row label="Budget" value={formatBudget(lead.budgetMin, lead.budgetMax)} />
              <Row label="Size (Sq.Ft.)" value={formatSize(lead.sizeMin, lead.sizeMax)} />
              <Row label="Property Types" value={(lead.propertyTypes ?? []).join(", ")} />
              <Row label="Locations" value={(lead.locations ?? []).join(", ")} />
              <Row label="Last Contact" value={safeDate(lead.lastContactedAt)} />
              <Row label="Created" value={safeDate(lead.createdAt)} />
            </div>

            {/* Properties contacted */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Properties Contacted ({propertyContacts.length})
              </p>
              {propertyContacts.length === 0 ? (
                <p className="text-sm text-gray-400">No property contacts on record.</p>
              ) : (
                <div className="space-y-2">
                  {propertyContacts.map((pc) => {
                    const p = pc.property || {};
                    const price = p.price ?? p.monthlyRent;
                    return (
                      <div key={pc.id} className="rounded-md border border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                              <Home className="w-4 h-4 shrink-0" />
                              <span className="truncate">{p.title || "Untitled property"}</span>
                            </p>
                            {(p.societyName || p.localityName) && (
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {[p.societyName, p.localityName].filter(Boolean).join(", ")}
                              </p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                              {p.bhkTypeName && <span>{p.bhkTypeName}</span>}
                              {p.area && <span>{p.area} {p.areaUnit || "sq.ft."}</span>}
                              {price && <span className="font-semibold">₹{Number(price).toLocaleString("en-IN")}</span>}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 shrink-0">
                            {pc.contactedAt ? safeDate(pc.contactedAt) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            {notes.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Notes ({notes.length})</p>
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-md border border-gray-200 p-3 bg-yellow-50">
                      <p className="text-sm text-gray-800">{n.note}</p>
                      <p className="text-xs text-gray-500 mt-1">{safeDate(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
