import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Loader2,
  Pencil,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  propertyListApiPayload,
  deletePropertyApiHandler,
} from "../../services/postProperty";

// KMA Internal CP user — properties posted as this owner are KMA-managed.
const KMA_INTERNAL_CP_USER_ID = "6545765e-ae9a-47ee-9c5c-0728710f1815";
const PAGE_SIZE = 20;

const STATUS_STYLES = {
  active: "bg-green-50 text-green-700 border-green-200",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  deactivated: "bg-gray-100 text-gray-500 border-gray-200",
};

const formatPrice = (item) => {
  const v = Number(item.price ?? item.monthlyRent ?? 0);
  if (!v) return "—";
  if (item.monthlyRent && !item.price) return `₹${v.toLocaleString("en-IN")}/mo`;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const StatCard = ({ title, count, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-xs text-text-gray">{title}</div>
      <div className="text-2xl font-semibold text-text-black">{count ?? 0}</div>
    </div>
  </div>
);

export default function KmaPropertiesList() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["kma-properties", page, statusFilter],
    queryFn: () =>
      propertyListApiPayload({
        userId: KMA_INTERNAL_CP_USER_ID,
        page,
        limit: PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    keepPreviousData: true,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      const hay = [
        p.society?.name,
        p.locality?.name,
        p.city?.name,
        p.propertyType?.name,
        p.category?.name,
        p.listingType?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const deleteMutation = useMutation({
    mutationFn: deletePropertyApiHandler,
    onSuccess: (res) => {
      toast.success(res?.message || "Property deleted");
      qc.invalidateQueries({ queryKey: ["kma-properties"] });
    },
    onError: (err) => {
      const msg = err?.message || "Failed to delete";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const onDelete = (id, label) => {
    if (!window.confirm(`Delete property "${label || id}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  const summary = data?.summary ?? {};

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-text-black">KMA Properties</h1>
          <p className="text-xs text-text-gray mt-1">
            All properties posted by <span className="font-medium text-text-black">KMA Internal CP</span>. Edit or delete from here.
          </p>
        </div>
        <Link
          to="/add-kma-property"
          className="inline-flex items-center gap-2 rounded-full bg-blue text-white px-5 py-2 text-sm font-semibold shadow-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add KMA Property
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard title="Total" count={summary.totalProperties ?? total} icon={Building2} color="bg-light-purple text-blue" />
        <StatCard title="Active" count={summary.activeProperties} icon={CheckCircle2} color="bg-green-50 text-green-600" />
        <StatCard title="Pending" count={summary.pendingProperties} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard title="Verified" count={summary.verifiedProperties} icon={CheckCircle2} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-gray" />
            <input
              type="text"
              placeholder="Search by society, locality, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-full border border-border pl-10 pr-4 text-sm focus:border-blue focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-full border border-border px-4 text-sm bg-white cursor-pointer focus:border-blue focus:outline-none"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
              <option value="deactivated">Deactivated</option>
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-10 w-10 rounded-full border border-border bg-white hover:border-blue inline-flex items-center justify-center text-text-gray"
              title="Refresh"
            >
              <RefreshCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-text-red">{error?.message || "Failed to load properties"}</div>
        ) : isLoading ? (
          <div className="p-12 flex items-center justify-center text-sm text-text-gray gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-text-gray mb-3" />
            <div className="text-sm text-text-black font-medium mb-1">No KMA properties yet</div>
            <p className="text-xs text-text-gray mb-4">Add the first one to see it here.</p>
            <Link to="/add-kma-property" className="inline-flex items-center gap-2 rounded-full bg-blue text-white px-5 py-2 text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" /> Add KMA Property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background-gray text-text-gray text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Property</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Listing</th>
                  <th className="text-left px-4 py-3 font-medium">City</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cover = p.photos?.find((ph) => ph.isCoverImage) ?? p.photos?.[0];
                  const coverUrl = cover?.fileKey
                    ? `${import.meta.env.VITE_AWS_URL}${cover.fileKey}`
                    : null;
                  const title = p.society?.name || p.propertyType?.name || `Property ${p.id?.slice(0, 8)}`;
                  const subtitle = [p.locality?.name, p.bhkType?.name].filter(Boolean).join(" • ");
                  const statusKey = p.status || "draft";
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-background-gray/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {coverUrl ? (
                            <img src={coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-background-gray"
                              onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-background-gray flex items-center justify-center text-text-gray">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-text-black truncate max-w-[220px]" title={title}>{title}</div>
                            {subtitle && <div className="text-xs text-text-gray truncate max-w-[220px]">{subtitle}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-black">{p.propertyType?.name || "—"}</td>
                      <td className="px-4 py-3 text-text-black">{p.listingType?.name || "—"}</td>
                      <td className="px-4 py-3 text-text-black">{p.city?.name || "—"}</td>
                      <td className="px-4 py-3 text-text-black font-medium">{formatPrice(p)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_STYLES[statusKey] || STATUS_STYLES.draft}`}>
                          {statusKey.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/properties/view/${p.id}`}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-border bg-white text-text-gray hover:text-blue hover:border-blue"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/add-kma-property/${p.id}`}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-border bg-white text-text-gray hover:text-blue hover:border-blue"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => onDelete(p.id, p.society?.name)}
                            disabled={deleteMutation.isPending}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-border bg-white text-text-gray hover:text-text-red hover:border-text-red disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deleteMutation.isPending && deleteMutation.variables === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-text-gray">
              Page {page} of {totalPages} • {total} total
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border bg-white text-text-black disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border bg-white text-text-black disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
