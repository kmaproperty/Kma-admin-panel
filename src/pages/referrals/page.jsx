import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Download, IndianRupee, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import MainWrapper from "../../components/common/layout/mainWrapper";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import {
  coinsToInr,
  DEFAULT_COINS_ON_DEAL_CLOSED,
} from "../../lib/referralCoins";
import {
  initialMockReferrals,
  initialMockRedeemRequests,
  initialMockPayoutAudit,
  REFERRAL_STATUS,
  REDEEM_STATUS,
  PROPERTY_TYPES,
} from "../../data/referralAdminMock";
import {
  fetchAdminReferrals,
  patchAdminReferral,
  fetchRedeemRequests,
  patchRedeemRequest,
  fetchPayoutAuditLog,
} from "../../services/referralAdmin";
import { channelPartnersListApiPayload } from "../../services/channelPartnerService";

const USE_MOCK = import.meta.env.VITE_REFERRAL_ADMIN_MOCK === "true";

const STATUS_OPTIONS = Object.values(REFERRAL_STATUS);

function getCurrentAdminLabel() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.username || u.name || "Admin";
  } catch {
    return "Admin";
  }
}

function statusChipColor(status) {
  if (status === REFERRAL_STATUS.DEAL_CLOSED) return "success";
  if (status === REFERRAL_STATUS.IN_PROCESS) return "info";
  return "default";
}

function redeemChipColor(status) {
  if (status === REDEEM_STATUS.PAID) return "success";
  if (status === REDEEM_STATUS.PROCESSING) return "warning";
  return "default";
}

function filterReferralsLocal(rows, f) {
  return rows.filter((r) => {
    if (f.channelPartnerId && r.channelPartnerId !== f.channelPartnerId)
      return false;
    if (f.referrerSearch.trim()) {
      const q = f.referrerSearch.toLowerCase();
      if (
        !String(r.referrerName || "")
          .toLowerCase()
          .includes(q) &&
        !String(r.referrerUniqueId || "")
          .toLowerCase()
          .includes(q)
      )
        return false;
    }
    if (f.propertyType && r.propertyType !== f.propertyType) return false;
    if (f.statuses.length && !f.statuses.includes(r.status)) return false;
    if (f.keyword.trim()) {
      const k = f.keyword.toLowerCase();
      const blob = `${r.clientName} ${r.clientMobile} ${r.location || ""}`.toLowerCase();
      if (!blob.includes(k)) return false;
    }
    if (f.dateFrom || f.dateTo) {
      const d = parseISO(r.submittedAt);
      const from = f.dateFrom ? startOfDay(f.dateFrom) : new Date(0);
      const to = f.dateTo ? endOfDay(f.dateTo) : new Date(8640000000000000);
      if (!isWithinInterval(d, { start: from, end: to })) return false;
    }
    return true;
  });
}

function buildApiReferralParams(pagination, filters) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    search: filters.keyword.trim() || undefined,
    channelPartnerId: filters.channelPartnerId || undefined,
    referrerSearch: filters.referrerSearch.trim() || undefined,
    dateFrom: filters.dateFrom
      ? format(filters.dateFrom, "yyyy-MM-dd")
      : undefined,
    dateTo: filters.dateTo
      ? format(filters.dateTo, "yyyy-MM-dd")
      : undefined,
    statuses:
      filters.statuses.length > 0 ? filters.statuses.join(",") : undefined,
    propertyType: filters.propertyType || undefined,
  };
}

function ReferralEditDialog({ open, row, onClose, onSave, saving }) {
  const [status, setStatus] = useState(REFERRAL_STATUS.PENDING);
  const [coins, setCoins] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!row) return;
    setStatus(row.status);
    setCoins(Number(row.coinsCredited) || 0);
    setReason("");
  }, [row]);

  useEffect(() => {
    if (status === REFERRAL_STATUS.DEAL_CLOSED && coins === 0) {
      setCoins(DEFAULT_COINS_ON_DEAL_CLOSED);
    }
  }, [status, coins]);

  if (!row) return null;

  const handleSave = () => {
    onSave({
      id: row.id,
      status,
      coinsCredited: Number(coins) || 0,
      coinsOverrideReason: reason.trim() || undefined,
    });
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      heading="Update referral"
      size="sm"
      actions={[
        { label: "Cancel", variant: "outline", onClick: onClose },
        { label: saving ? "Saving…" : "Save", variant: "primary", onClick: handleSave },
      ]}
    >
      <div className="space-y-3 text-sm text-[#5d7186]">
        <p>
          <span className="font-medium text-gray-700">Referrer:</span>{" "}
          {row.referrerName} ({row.referrerUniqueId})
        </p>
        <p>
          <span className="font-medium text-gray-700">Client:</span>{" "}
          {row.clientName} — {row.clientMobile}
        </p>
        <FormControl fullWidth size="small">
          <InputLabel id="ref-status-label">Status</InputLabel>
          <Select
            labelId="ref-status-label"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Coins credited"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
          helperText={
            status === REFERRAL_STATUS.DEAL_CLOSED
              ? "Coins are credited when deal is closed (adjust if needed)."
              : "No coins until status is Deal Closed."
          }
        />
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          label="Manual override reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Required for audit if coins differ from default rule"
        />
      </div>
    </CustomDialog>
  );
}

export default function ReferralsAdminPage() {
  const [tab, setTab] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [referrerSearch, setReferrerSearch] = useState("");
  const [channelPartnerId, setChannelPartnerId] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalCount: 0,
  });

  const [mockReferrals, setMockReferrals] = useState(() =>
    structuredClone(initialMockReferrals)
  );
  const [mockRedeem, setMockRedeem] = useState(() =>
    structuredClone(initialMockRedeemRequests)
  );
  const [mockAudit, setMockAudit] = useState(() =>
    structuredClone(initialMockPayoutAudit)
  );

  const [editRow, setEditRow] = useState(null);
  const [markPaidRow, setMarkPaidRow] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const filters = useMemo(
    () => ({
      keyword,
      referrerSearch,
      channelPartnerId,
      propertyType,
      statuses,
      dateFrom,
      dateTo,
    }),
    [
      keyword,
      referrerSearch,
      channelPartnerId,
      propertyType,
      statuses,
      dateFrom,
      dateTo,
    ]
  );

  const filteredMockReferrals = useMemo(
    () => filterReferralsLocal(mockReferrals, filters),
    [mockReferrals, filters]
  );

  const pagedMockRows = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredMockReferrals.slice(start, start + pagination.limit);
  }, [filteredMockReferrals, pagination.page, pagination.limit]);

  useEffect(() => {
    if (USE_MOCK) {
      setPagination((p) => ({ ...p, totalCount: filteredMockReferrals.length }));
    }
  }, [filteredMockReferrals.length, USE_MOCK]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [tab]);

  const referralsQuery = useQuery({
    queryKey: [
      "admin-referrals",
      pagination.page,
      pagination.limit,
      filters,
    ],
    queryFn: () => fetchAdminReferrals(buildApiReferralParams(pagination, filters)),
    enabled: !USE_MOCK,
  });

  const redeemQuery = useQuery({
    queryKey: ["admin-referral-redeem", pagination.page, pagination.limit],
    queryFn: () =>
      fetchRedeemRequests({
        page: pagination.page,
        limit: pagination.limit,
      }),
    enabled: !USE_MOCK && tab === 1,
  });

  const auditQuery = useQuery({
    queryKey: ["admin-referral-audit", pagination.page, pagination.limit],
    queryFn: () =>
      fetchPayoutAuditLog({
        page: pagination.page,
        limit: pagination.limit,
      }),
    enabled: !USE_MOCK && tab === 1,
  });

  const partnersQuery = useQuery({
    queryKey: ["referral-admin-partners"],
    queryFn: () =>
      channelPartnersListApiPayload({
        page: 1,
        limit: 500,
        role: "CHANNEL_PARTNER",
        search: "",
      }),
    staleTime: 5 * 60 * 1000,
    enabled: !USE_MOCK,
  });

  useEffect(() => {
    if (!USE_MOCK && referralsQuery.isError) {
      toast.error(
        referralsQuery.error?.message ||
          "Could not load referrals. Set VITE_REFERRAL_ADMIN_MOCK=true for demo data or connect the API."
      );
    }
  }, [USE_MOCK, referralsQuery.isError, referralsQuery.error]);

  const patchMutation = useMutation({
    mutationFn: ({ id, payload }) => patchAdminReferral(id, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Referral updated");
      referralsQuery.refetch();
      setEditRow(null);
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to update referral"),
  });

  const patchRedeemMutation = useMutation({
    mutationFn: ({ id, payload }) => patchRedeemRequest(id, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Payout updated");
      redeemQuery.refetch();
      auditQuery.refetch();
      setMarkPaidRow(null);
    },
    onError: (err) => toast.error(err?.message || "Failed to update payout"),
  });

  const referralRows = useMemo(() => {
    const raw = USE_MOCK
      ? pagedMockRows
      : referralsQuery.data?.data ?? [];
    return raw.map((item) => ({
      id: item.id,
      referrerName: item.referrerName,
      referrerUniqueId: item.referrerUniqueId,
      clientName: item.clientName,
      clientMobile: item.clientMobile,
      channelPartnerName: item.channelPartnerName,
      propertyType: item.propertyType,
      location: item.location || "—",
      status: item.status,
      coinsCredited: item.coinsCredited ?? 0,
      submittedAt: item.submittedAt
        ? format(parseISO(item.submittedAt), "dd MMM yyyy")
        : "—",
      _raw: item,
    }));
  }, [USE_MOCK, pagedMockRows, referralsQuery.data]);

  useEffect(() => {
    if (!USE_MOCK && referralsQuery.data) {
      setPagination((p) => ({
        ...p,
        totalCount: referralsQuery.data.total ?? 0,
      }));
    }
  }, [USE_MOCK, referralsQuery.data]);

  const onPageChange = useCallback((uiPage) => {
    setPagination((prev) => ({ ...prev, page: uiPage + 1 }));
  }, []);

  const partnerOptions = useMemo(() => {
    if (USE_MOCK) {
      return [
        { value: "cp-1", label: "Partner ABC" },
        { value: "cp-2", label: "Partner XYZ" },
      ];
    }
    const list = partnersQuery.data?.data ?? [];
    return list.map((p) => ({ value: String(p.id), label: p.name || p.id }));
  }, [partnersQuery.data]);

  const handleSaveReferral = (payload) => {
    const body = {
      status: payload.status,
      coinsCredited: payload.coinsCredited,
      coinsOverrideReason: payload.coinsOverrideReason,
    };
    if (USE_MOCK) {
      setMockReferrals((prev) =>
        prev.map((r) =>
          r.id === payload.id
            ? {
                ...r,
                status: payload.status,
                coinsCredited:
                  payload.status === REFERRAL_STATUS.DEAL_CLOSED
                    ? payload.coinsCredited
                    : 0,
              }
            : r
        )
      );
      toast.success("Referral updated (mock)");
      setEditRow(null);
      return;
    }
    patchMutation.mutate({ id: payload.id, payload: body });
  };

  const handleMarkPaid = () => {
    if (!markPaidRow) return;
    if (USE_MOCK) {
      const adminName = getCurrentAdminLabel();
      const coins = Number(markPaidRow.coins) || 0;
      setMockRedeem((prev) =>
        prev.map((r) =>
          r.id === markPaidRow.id ? { ...r, status: REDEEM_STATUS.PAID } : r
        )
      );
      setMockAudit((prev) => [
        {
          id: `aud-${Date.now()}`,
          paidToName: markPaidRow.userName,
          uniqueId: markPaidRow.uniqueId,
          coins,
          amountInr: coinsToInr(coins),
          method: markPaidRow.method,
          processedAt: new Date().toISOString(),
          adminName,
        },
        ...prev,
      ]);
      toast.success("Marked as paid (mock)");
      setMarkPaidRow(null);
      return;
    }
    patchRedeemMutation.mutate({
      id: markPaidRow.id,
      payload: { status: "Paid" },
    });
  };

  const runExport = async () => {
    setExportLoading(true);
    try {
      let exportRows;
      let meta = { ...filters, exportedAt: new Date().toISOString() };
      if (USE_MOCK) {
        exportRows = filterReferralsLocal(mockReferrals, filters);
      } else {
        const res = await fetchAdminReferrals(
          buildApiReferralParams({ page: 1, limit: 10000 }, filters)
        );
        exportRows = res?.data ?? [];
      }
      const headers = [
        "Referrer Name",
        "Referrer ID",
        "Client Name",
        "Client Mobile",
        "Channel Partner",
        "Property Type",
        "Location",
        "Status",
        "Coins Credited",
        "Date Submitted",
      ];
      const lines = exportRows.map((r) =>
        [
          r.referrerName,
          r.referrerUniqueId,
          r.clientName,
          r.clientMobile,
          r.channelPartnerName,
          r.propertyType,
          (r.location || "").replaceAll(",", " "),
          r.status,
          r.coinsCredited ?? 0,
          r.submittedAt
            ? format(parseISO(r.submittedAt), "dd/MM/yyyy")
            : "",
        ]
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(",")
      );
      const headerBlock = `# Referral export\n# ${JSON.stringify(meta)}\n`;
      const csv = "\uFEFF" + headerBlock + headers.join(",") + "\n" + lines.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referrals-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${exportRows.length} row(s)`);
    } catch (e) {
      toast.error(e?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const referralColumns = [
    {
      field: "referrerName",
      headerName: "Referrer / ID",
      flex: 1.2,
      minWidth: 160,
      renderCell: (params) => (
        <div>
          <div className="font-medium text-gray-800">{params.row.referrerName}</div>
          <div className="text-xs text-gray-500">{params.row.referrerUniqueId}</div>
        </div>
      ),
    },
    { field: "clientName", headerName: "Client Name", flex: 1, minWidth: 120 },
    { field: "clientMobile", headerName: "Client Mobile", flex: 1, minWidth: 120 },
    {
      field: "channelPartnerName",
      headerName: "Channel Partner",
      flex: 1,
      minWidth: 120,
    },
    { field: "propertyType", headerName: "Property Type", width: 110 },
    { field: "location", headerName: "Location", flex: 1, minWidth: 100 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={statusChipColor(params.value)}
          variant={params.value === REFERRAL_STATUS.PENDING ? "outlined" : "filled"}
        />
      ),
    },
    {
      field: "coinsCredited",
      headerName: "Coins",
      width: 90,
    },
    { field: "submittedAt", headerName: "Date Submitted", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Update status / coins">
          <button
            type="button"
            className="py-2 px-3 bg-blue-50 cursor-pointer rounded-sm"
            onClick={() => setEditRow(params.row._raw)}
          >
            <Pencil className="text-blue-800 w-4 h-4" />
          </button>
        </Tooltip>
      ),
    },
  ];

  const redeemRowsApi = redeemQuery.data?.data ?? [];
  const redeemGridRows = useMemo(() => {
    if (USE_MOCK) {
      return mockRedeem.map((r) => ({
        id: r.id,
        userName: r.userName,
        uniqueId: r.uniqueId,
        coins: r.coins,
        inr: coinsToInr(r.coins),
        method: r.method,
        payoutDetail: r.payoutDetail,
        status: r.status,
        requestedAt: r.requestedAt
          ? format(parseISO(r.requestedAt), "dd MMM yyyy HH:mm")
          : "—",
        _raw: r,
      }));
    }
    return redeemRowsApi.map((item) => ({
      id: item.id,
      userName: item.userName,
      uniqueId: item.uniqueId,
      coins: item.coins,
      inr: coinsToInr(item.coins),
      method: item.method,
      payoutDetail: item.payoutDetail,
      status: item.status,
      requestedAt: item.requestedAt
        ? format(parseISO(item.requestedAt), "dd MMM yyyy HH:mm")
        : "—",
      _raw: item,
    }));
  }, [USE_MOCK, mockRedeem, redeemRowsApi]);

  const redeemColumns = [
    { field: "userName", headerName: "User", flex: 1, minWidth: 100 },
    { field: "uniqueId", headerName: "Unique ID", flex: 1, minWidth: 130 },
    { field: "coins", headerName: "Coins", width: 90 },
    {
      field: "inr",
      headerName: "INR (≈)",
      width: 100,
      renderCell: (p) => (
        <span className="inline-flex items-center gap-0.5">
          <IndianRupee className="w-3.5 h-3.5" />
          {p.value}
        </span>
      ),
    },
    { field: "method", headerName: "Method", width: 130 },
    { field: "payoutDetail", headerName: "Payout details", flex: 1, minWidth: 140 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={redeemChipColor(params.value)} />
      ),
    },
    { field: "requestedAt", headerName: "Requested", flex: 1, minWidth: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      renderCell: (params) => {
        const paid = params.row.status === REDEEM_STATUS.PAID;
        return (
          <button
            type="button"
            disabled={paid}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-gray-800 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => setMarkPaidRow(params.row._raw)}
          >
            Mark paid
          </button>
        );
      },
    },
  ];

  const auditRows = USE_MOCK
    ? mockAudit
    : auditQuery.data?.data ?? [];
  const auditColumns = [
    { field: "paidToName", headerName: "Paid to", flex: 1, minWidth: 100 },
    { field: "uniqueId", headerName: "Unique ID", flex: 1, minWidth: 130 },
    { field: "coins", headerName: "Coins", width: 80 },
    { field: "amountInr", headerName: "INR", width: 80 },
    { field: "method", headerName: "Method", width: 120 },
    {
      field: "processedAtDisplay",
      headerName: "Processed",
      flex: 1,
      minWidth: 140,
    },
    { field: "adminName", headerName: "Admin", flex: 1, minWidth: 100 },
  ];

  const auditRowsForGrid = auditRows.map((r) => ({
    ...r,
    id: r.id,
    processedAtDisplay: r.processedAt
      ? format(parseISO(r.processedAt), "dd MMM yyyy HH:mm")
      : "—",
  }));

  const referralsLoading = USE_MOCK ? false : referralsQuery.isLoading;
  const redeemLoading = USE_MOCK ? false : redeemQuery.isLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MainWrapper>
        <PageTitle
          title="Referrals — Admin"
          actions={[
            {
              label: exportLoading ? "Exporting…" : "Export CSV",
              icon: <Download className="w-4 h-4" />,
              onClick: runExport,
            },
          ]}
        />

        {USE_MOCK && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Demo mode: <code className="text-xs">VITE_REFERRAL_ADMIN_MOCK=true</code>.
            Data is local only. Remove the flag to use the API (
            <code className="text-xs">admin/referrals</code>).
          </p>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="All referrals" />
            <Tab label="Payouts & audit" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
              <TextField
                size="small"
                label="Keyword (client / mobile / location)"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                sx={{ minWidth: 260 }}
              />
              <TextField
                size="small"
                label="Referrer name or ID"
                value={referrerSearch}
                onChange={(e) => {
                  setReferrerSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="cp-filter">Channel partner</InputLabel>
                <Select
                  labelId="cp-filter"
                  label="Channel partner"
                  value={channelPartnerId}
                  onChange={(e) => {
                    setChannelPartnerId(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                >
                  <MenuItem value="">All partners</MenuItem>
                  {partnerOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="pt-filter">Property type</InputLabel>
                <Select
                  labelId="pt-filter"
                  label="Property type"
                  value={propertyType}
                  onChange={(e) => {
                    setPropertyType(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {PROPERTY_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="st-filter">Status</InputLabel>
                <Select
                  labelId="st-filter"
                  label="Status"
                  multiple
                  value={statuses}
                  onChange={(e) => {
                    setStatuses(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  renderValue={(selected) =>
                    selected.length === 0 ? "All statuses" : selected.join(", ")
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="From"
                value={dateFrom}
                onChange={(d) => {
                  setDateFrom(d);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                slotProps={{ textField: { size: "small" } }}
              />
              <DatePicker
                label="To"
                value={dateTo}
                onChange={(d) => {
                  setDateTo(d);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                slotProps={{ textField: { size: "small" } }}
              />
            </div>

            <CustomDataGrid
              columns={referralColumns}
              rows={referralRows}
              loading={referralsLoading}
              onPageChange={onPageChange}
              page={pagination.page - 1}
              pageSize={pagination.limit}
              rowCount={pagination.totalCount}
              style={{ height: "calc(100vh - 320px)" }}
            />
          </>
        )}

        {tab === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Redeem requests
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Mark payouts as paid after UPI / bank / wallet transfer (48h TAT).
              </p>
              <CustomDataGrid
                columns={redeemColumns}
                rows={redeemGridRows}
                loading={redeemLoading}
                onPageChange={onPageChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={
                  USE_MOCK
                    ? mockRedeem.length
                    : redeemQuery.data?.total ?? 0
                }
                style={{ height: 380 }}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Payout audit log
              </h3>
              <CustomDataGrid
                columns={auditColumns}
                rows={auditRowsForGrid}
                loading={USE_MOCK ? false : auditQuery.isLoading}
                onPageChange={onPageChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={USE_MOCK ? mockAudit.length : auditQuery.data?.total ?? 0}
                style={{ height: 320 }}
              />
            </div>
          </div>
        )}

        <ReferralEditDialog
          open={Boolean(editRow)}
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleSaveReferral}
          saving={patchMutation.isPending}
        />

        <CustomDialog
          open={Boolean(markPaidRow)}
          handleClose={() => setMarkPaidRow(null)}
          heading="Confirm payout"
          actions={[
            { label: "Cancel", variant: "outline", onClick: () => setMarkPaidRow(null) },
            {
              label: patchRedeemMutation.isPending ? "Saving…" : "Confirm paid",
              variant: "primary",
              onClick: handleMarkPaid,
            },
          ]}
        >
          {markPaidRow && (
            <div className="text-sm text-[#5d7186] space-y-2">
              <p>
                Record that <strong>{markPaidRow.userName}</strong> (
                {markPaidRow.uniqueId}) was paid{" "}
                <strong>{markPaidRow.coins} coins</strong> (≈ ₹
                {coinsToInr(markPaidRow.coins)}) via {markPaidRow.method}.
              </p>
              <p className="text-xs text-gray-500">
                Logged under admin: {getCurrentAdminLabel()}
              </p>
            </div>
          )}
        </CustomDialog>
      </MainWrapper>
    </LocalizationProvider>
  );
}
