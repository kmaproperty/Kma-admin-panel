import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "@mui/material";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  fetchKmaReviews,
  approveKmaReview,
  disapproveKmaReview,
} from "../../services/reviews";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";

export default function ReviewsList() {
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 0,
  });
  const [pendingToggleId, setPendingToggleId] = useState(null);

  const { mutate: fetchData, isPending: isLoading } = useMutation({
    mutationFn: fetchKmaReviews,
    onSuccess: (data) => {
      setTableData(data?.data ?? []);
      setPagination((pre) => ({
        ...pre,
        totalPage: data?.total ?? 0,
      }));
    },
    onError: () => {
      toast.error("Failed to load reviews");
    },
  });

  const refetch = useCallback(() => {
    fetchData({ page: pagination.page, limit: pagination.limit });
  }, [fetchData, pagination.page, pagination.limit]);

  const { mutate: approveMutate } = useMutation({
    mutationFn: approveKmaReview,
    onSuccess: () => {
      toast.success("Review marked as top");
      refetch();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to approve review");
    },
    onSettled: () => setPendingToggleId(null),
  });

  const { mutate: disapproveMutate } = useMutation({
    mutationFn: disapproveKmaReview,
    onSuccess: () => {
      toast.success("Review removed from top");
      refetch();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to disapprove review");
    },
    onSettled: () => setPendingToggleId(null),
  });

  const handleToggleTop = useCallback(
    (id, currentlyApproved) => {
      if (!id) return;
      setPendingToggleId(id);
      if (currentlyApproved) {
        disapproveMutate({ id });
      } else {
        approveMutate({ id });
      }
    },
    [approveMutate, disapproveMutate],
  );

  const onPageChange = useCallback((uiPage) => {
    const newPage = uiPage + 1;
    setPagination((prev) => {
      if (prev.page === newPage) return prev;
      return { ...prev, page: newPage };
    });
  }, []);

  const onPageSizeChange = useCallback((newSize) => {
    setPagination((prev) => {
      if (prev.limit === newSize) return prev;
      return { ...prev, limit: newSize, page: 1 };
    });
  }, []);

  useEffect(() => {
    fetchData({ page: pagination.page, limit: pagination.limit });
  }, [pagination.page, pagination.limit]);

  const columns = [
    {
      field: "username",
      headerName: "Username",
      flex: 0.6,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 0.5,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "rating",
      headerName: "Ratings",
      flex: 0.4,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "review",
      headerName: "Review",
      flex: 1.2,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 0.6,
    },
    {
      field: "isApproved",
      headerName: "Top Review",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <Switch
            checked={!!params.value}
            disabled={pendingToggleId === params.row.id}
            onChange={() => handleToggleTop(params.row.id, params.value)}
            size="small"
          />
        </div>
      ),
    },
  ];

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      username: item.endUser?.name || item.name || "-",
      phoneNumber: item.phoneNumber || item.endUser?.phone || "-",
      rating: item.rating ?? "-",
      review: item.review || "-",
      isApproved: !!item.isApproved,
      createdAt: item.createdAt
        ? format(parseISO(item.createdAt), "dd/MM/yyyy")
        : "-",
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title="Ratings and Reviews" />

      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={pagination.totalPage}
        style={{ height: "calc(100vh - 240px)" }}
      />
    </MainWrapper>
  );
}
