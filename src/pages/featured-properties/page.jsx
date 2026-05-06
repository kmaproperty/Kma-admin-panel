import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Autocomplete, TextField, Switch } from "@mui/material";
import { toast } from "react-toastify";
import { propertyListApiPayload, markFeaturedPropertiesApiHandler, removeFeaturedPropertiesApiHandler } from "../../services/postProperty";
import { fetchCities } from "../../services/cities";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";

export default function FeaturedProperties() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 0,
  });

  const { mutate: loadCities } = useMutation({
    mutationFn: fetchCities,
    onSuccess: (data) => {
      setCities(data?.data ?? []);
    },
    onError: () => {
      toast.error("Failed to load cities");
    },
  });

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

  const { mutate: markFeatured } = useMutation({
    mutationFn: markFeaturedPropertiesApiHandler,
    onSuccess: () => {
      toast.success("Property marked as featured");
      if (selectedCity) {
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          cityId: selectedCity.id,
        });
      }
    },
    onError: () => {
      toast.error("Failed to mark property as featured");
    },
  });

  const { mutate: removeFeatured } = useMutation({
    mutationFn: removeFeaturedPropertiesApiHandler,
    onSuccess: () => {
      toast.success("Property removed from featured");
      if (selectedCity) {
        fetchProperties({
          page: pagination.page,
          limit: pagination.limit,
          cityId: selectedCity.id,
        });
      }
    },
    onError: () => {
      toast.error("Failed to remove property from featured");
    },
  });

  // Backend caps `limit` at 100, so a single page can't return every city
  // (Pune, Gurugram and others sit beyond the alphabetical first 100).
  // Debounce the search input and let the server filter.
  useEffect(() => {
    const t = setTimeout(() => {
      loadCities({ page: 1, limit: 100, search: citySearch || "" });
    }, citySearch ? 250 : 0);
    return () => clearTimeout(t);
  }, [citySearch]);

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

  const handleToggleFeatured = useCallback((id, isFeatured) => {
    if (isFeatured) {
      removeFeatured({ id });
    } else {
      markFeatured({ id });
    }
  }, [markFeatured, removeFeatured]);

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
      field: "imageUrl",
      headerName: "Photo",
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          {params.value ? (
            <img
              src={params.value}
              alt="property"
              style={{ width: 48, height: 40, objectFit: "cover", borderRadius: 4 }}
            />
          ) : (
            <div style={{ width: 48, height: 40, background: "#e5e7eb", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9ca3af" }}>No img</div>
          )}
        </div>
      ),
    },
    {
      field: "propertyName",
      headerName: "Property Name",
      flex: 1.5,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>{params.value}</p>
        </div>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>{params.value}</p>
        </div>
      ),
    },
    {
      field: "listingType",
      headerName: "Type",
      flex: 0.7,
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
      field: "isFeatured",
      headerName: "Featured",
      flex: 0.8,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <Switch
            checked={!!params.value}
            onChange={() => handleToggleFeatured(params.row.id, params.value)}
            size="small"
          />
        </div>
      ),
    },
  ];

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => {
      const society = item.society?.name || "";
      const locality = item.locality?.name || "";
      const city = item.city?.name || "";
      const propertyType = item.propertyType?.name || "";
      const bhk = item.bhkType?.name || "";
      const name = [bhk, propertyType, society].filter(Boolean).join(" - ") || item.propertyName || "-";
      const address = [society, locality, city].filter(Boolean).join(", ") || "-";
      const price = item.price || item.monthlyRent;

      const coverPhoto = Array.isArray(item.photos)
        ? item.photos.find((p) => p.isCoverImage) || item.photos[0]
        : null;
      const imageUrl = coverPhoto?.fileKey
        ? `${import.meta.env.VITE_AWS_URL || ""}${coverPhoto.fileKey}`
        : null;

      return {
        id: item.id,
        propertyName: name,
        address,
        listingType: item.listingType?.name || "-",
        price: price ? formatPrice(price) + (item.monthlyRent && !item.price ? "/mo" : "") : "-",
        status: item.status || "-",
        isFeatured: item.isFeatured,
        imageUrl,
      };
    });
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title="Featured Properties" />

      <div className="mb-4" style={{ maxWidth: 400 }}>
        <Autocomplete
          options={cities}
          getOptionLabel={(option) => option.name || ""}
          value={selectedCity}
          onChange={(_, newValue) => {
            setSelectedCity(newValue);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          inputValue={citySearch}
          onInputChange={(_, value, reason) => {
            if (reason !== "reset") setCitySearch(value);
          }}
          filterOptions={(opts) => opts /* server already filtered */}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText={citySearch ? `No matches for "${citySearch}"` : "Type to search…"}
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
