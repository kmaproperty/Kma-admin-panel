import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Autocomplete, TextField, Switch, Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import { propertyListApiPayload, markTopPropertiesApiHandler, removeTopPropertiesApiHandler } from "../../services/postProperty";
import { fetchCities } from "../../services/cities";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";
import reviewsData from './dummyData.json';
import { format, parseISO } from "date-fns";
import { CheckCheck, Flag, OctagonMinusIcon, X } from "lucide-react";

export default function ReviewsList() {
  const [tableData, setTableData] = useState(reviewsData);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 0,
  });

  // Fetch properties for selected city
  // const { mutate: fetchProperties, isLoading } = useMutation({
  //   mutationFn: propertyListApiPayload,
  //   onSuccess: (data) => {
  //     if (data) {
  //       setPagination((pre) => ({
  //         ...pre,
  //         totalPage: data.total,
  //       }));
  //     }
  //     setTableData(data?.data ?? data?.properties ?? []);
  //   },
  //   onError: () => {
  //     toast.error("Failed to load properties");
  //   },
  // });

  // // Mark as top property
  // const { mutate: markTop } = useMutation({
  //   mutationFn: markTopPropertiesApiHandler,
  //   onSuccess: () => {
  //     toast.success("Property marked as top");
  //     if (selectedCity) {
  //       fetchProperties({
  //         page: pagination.page,
  //         limit: pagination.limit,
  //         cityId: selectedCity.id,
  //       });
  //     }
  //   },
  //   onError: () => {
  //     toast.error("Failed to mark property as top");
  //   },
  // });

  // // Remove from top properties
  // const { mutate: removeTop } = useMutation({
  //   mutationFn: removeTopPropertiesApiHandler,
  //   onSuccess: () => {
  //     toast.success("Property removed from top");
  //     if (selectedCity) {
  //       fetchProperties({
  //         page: pagination.page,
  //         limit: pagination.limit,
  //         cityId: selectedCity.id,
  //       });
  //     }
  //   },
  //   onError: () => {
  //     toast.error("Failed to remove property from top");
  //   },
  // });

  const handleToggleTop = useCallback((id, isTop) => {
    // if (isTop) {
    //   removeTop({ id });
    // } else {
    //   markTop({ id });
    // }
  }, []);

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

  const columns = [
    {
      field: "username",
      headerName: "Username",
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
      field: "review",
      headerName: "Review",
      flex: 1,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "isTop",
      headerName: "Top Review",
      flex: 0.5,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <Switch
            checked={!!params.value}
            onChange={() => handleToggleTop(params.row.id, params.value)}
            size="small"
          />
        </div>
      ),
    },
    {
        field: "actions",
        headerName: "Actions",
        width: 80,
        renderCell: (params) => (
            <div className="w-full flex justify-end items-center">
                <Tooltip title={params.row.isApprove ? "Reject" : "Approve" }>
                    <button className={`mr-2 mt-3 py-2 px-3 bg-gray-50 rounded-sm cursor-pointer ${params.row.isApprove ? "bg-red-50" : "bg-green-50" }`} onClick={() => setConfirmationDialog({ id: String(params.id), isApprove: params.row.isApprove })}>
                        {
                            params.row.isApprove ? <X className="text-red-800 w-4.5 h-4.5" /> : <CheckCheck className="text-green-800 w-4.5 h-4.5" />  
                        }
                    </button>
                </Tooltip>
            </div>
        ),
    },
  ];

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      username: item.username || "-",
      createdAt: format(parseISO(item.createdAt), "dd/MM/yyyy"),
      rating: item.rating,
      review: item.review,
      isTop: item.isTop,
      isApprove: item.isApprove,
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title="Ratings and Reviews" />

      <CustomDataGrid
        columns={columns}
        rows={rows}
        // loading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={pagination.totalPage}
        style={{ height: "calc(100vh - 150px)" }}
      />
    </MainWrapper>
  );
}
