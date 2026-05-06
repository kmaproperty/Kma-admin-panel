import { useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper";
import PageTitle from "../../components/common/layout/PageTitle";
import { fetchLeads, deleteLead } from "../../services/leadAdmin";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Tooltip } from "@mui/material";
import { Eye, Trash2 } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import { toast } from "react-toastify";
import ViewLeadDialog from "./viewLeadDialog";

const LeadsListingPage = () => {
  const [pagination, setPagination] = useState({ limit: 10, page: 1, totalPage: 1 });
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewLeadId, setViewLeadId] = useState(null);

  const columns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 180 },
    { field: "buildingType", headerName: "Building", width: 130 },
    { field: "propertiesContactedCount", headerName: "Properties", width: 110 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "lastContactedAt", headerName: "Last Contact", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: (params) => (
        <div className="w-full flex justify-end items-center gap-2">
          <Tooltip title="View">
            <button
              className="py-2 px-3 bg-gray-50 cursor-pointer rounded-sm"
              onClick={() => setViewLeadId(params.row.id)}
            >
              <Eye className="text-gray-700 w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              className="py-2 px-3 bg-red-50 cursor-pointer rounded-sm"
              onClick={() => setConfirmDelete(params.row.id)}
            >
              <Trash2 className="text-red-700 w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const {
    data: leadsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-leads", pagination.page, pagination.limit, search],
    queryFn: () =>
      fetchLeads({
        page: pagination.page,
        limit: pagination.limit,
        search,
      }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const onPageChange = useCallback((uiPage) => {
    const newPage = uiPage + 1;
    setPagination((prev) => (prev.page === newPage ? prev : { ...prev, page: newPage }));
  }, []);

  const onPageSizeChange = useCallback((newSize) => {
    setPagination((prev) => (prev.limit === newSize ? prev : { ...prev, limit: newSize, page: 1 }));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => refetch(), 400);
    return () => clearTimeout(t);
  }, [search, pagination.page, pagination.limit]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatBudget = (min, max) => {
    const fmt = (n) => {
      if (n == null) return "";
      if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
      if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return String(n);
    };
    if (min == null && max == null) return "";
    if (min != null && max != null) return `₹${fmt(min)} – ₹${fmt(max)}`;
    if (min != null) return `₹${fmt(min)}+`;
    return `Up to ₹${fmt(max)}`;
  };

  const safeFormat = (iso) => {
    if (!iso) return "";
    try {
      return format(parseISO(iso), "dd/MM/yyyy");
    } catch {
      return "";
    }
  };

  const rows = useMemo(() => {
    if (!leadsData?.data) return [];
    return leadsData.data.map((lead) => ({
      id: lead.id,
      name: lead.name || "-",
      phone: lead.phone || "-",
      email: lead.email || "-",
      buildingType: lead.buildingType || "-",
      budgetRange: formatBudget(lead.budgetMin, lead.budgetMax),
      propertyTypes: Array.isArray(lead.propertyTypes) ? lead.propertyTypes.join(", ") : "",
      locations: Array.isArray(lead.locations) ? lead.locations.join(", ") : "",
      propertiesContactedCount: lead.propertiesContactedCount ?? 0,
      status: lead.status || "-",
      lastContactedAt: safeFormat(lead.lastContactedAt),
      createdAt: safeFormat(lead.createdAt),
    }));
  }, [leadsData]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteLead(confirmDelete);
      toast.success("Lead deleted");
      setConfirmDelete(null);
      refetch();
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const dialogActions = [
    { label: "Cancel", onClick: () => setConfirmDelete(null), variant: "outline" },
    { label: "Delete", onClick: handleDelete, loading: deleting, variant: "primary" },
  ];

  return (
    <MainWrapper>
      <PageTitle
        title="Leads"
        isSearch
        searchValue={search}
        onSearchChange={handleSearch}
      />
      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={leadsData?.total}
        style={{ height: "calc(100vh - 180px)" }}
      />
      <CustomDialog
        open={confirmDelete !== null}
        handleClose={() => setConfirmDelete(null)}
        heading="Delete this lead?"
        actions={dialogActions}
        size="md"
      >
        <p>This will permanently remove the lead and any notes attached to it.</p>
      </CustomDialog>
      <ViewLeadDialog
        open={viewLeadId !== null}
        leadId={viewLeadId}
        onClose={() => setViewLeadId(null)}
      />
    </MainWrapper>
  );
};

export default LeadsListingPage;
