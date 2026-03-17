import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Autocomplete, TextField, Switch } from "@mui/material";
import { toast } from "react-toastify";
import { propertyListApiPayload, markTopPropertiesApiHandler, removeTopPropertiesApiHandler } from "../../services/postProperty";
import { fetchCities } from "../../services/cities";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";

export default function TopProperties() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 0,
  });

  // Fetch cities on mount
  const { mutate: loadCities } = useMutation({
    mutationFn: fetchCities,
    onSuccess: (data) => {
      setCities(data?.data ?? []);
    },
    onError: () => {
      toast.error("Failed to load cities");
    },
  });

  // Fetch properties for selected city
  const { mutate: fetchProperties, isLoading } = useMutation({
    mutationFn: propertyListApiPayload,
    onSuccess: (data) => {
      if (data) {
        setPagination((pre) => ({
          ...pre,
          totalPage: data.total,
        }));
      }
      setTableData(data?.data ?? data?.properties ?? []);
    },
    onError: () => {
      toast.error("Failed to load properties");
    },
  });

  // Mark as top property
  const { mutate: markTop } = useMutation({
    mutationFn: markTopPropertiesApiHandler,
    onSuccess: () => {
      toast.success("Property marked as top");
      if (selectedCity) {
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          cityId: selectedCity.id,
        });
      }
    },
    onError: () => {
      toast.error("Failed to mark property as top");
    },
  });

  // Remove from top properties
  const { mutate: removeTop } = useMutation({
    mutationFn: removeTopPropertiesApiHandler,
    onSuccess: () => {
      toast.success("Property removed from top");
      if (selectedCity) {
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          cityId: selectedCity.id,
        });
      }
    },
    onError: () => {
      toast.error("Failed to remove property from top");
    },
  });

  useEffect(() => {
    loadCities({ page: 1, limit: 100, search: "" });
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchProperties({
        page: pagination.page,
        limit: pagination.limit,
        cityId: selectedCity.id,
      });
    } else {
      setTableData([]);
      setPagination((pre) => ({ ...pre, totalPage: 0 }));
    }
  }, [selectedCity, pagination.page, pagination.limit]);

  const handleToggleTop = useCallback((id, isTop) => {
    if (isTop) {
      removeTop({ id });
    } else {
      markTop({ id });
    }
  }, [markTop, removeTop]);

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

  const formatPrice = (price) => {
    if (!price) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const columns = [
    {
      field: "propertyName",
      headerName: "Property Name",
      flex: 1.5,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
    },
    {
      field: "isTop",
      headerName: "Top Property",
      flex: 0.8,
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
  ];

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      propertyName: item.propertyName || item.title || "-",
      address: item.address || "-",
      price: formatPrice(item.price),
      status: item.status || "-",
      isTop: item.isTop,
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title="Top Properties" />

      <div className="mb-4" style={{ maxWidth: 400 }}>
        <Autocomplete
          options={cities}
          getOptionLabel={(option) => option.name || ""}
          value={selectedCity}
          onChange={(_, newValue) => {
            setSelectedCity(newValue);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select City"
              variant="outlined"
              size="small"
            />
          )}
        />
      </div>

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
