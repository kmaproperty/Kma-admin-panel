import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fetchContactUs } from "../../services/contactUs";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";

export default function ContactUsList() {
  const [search, setSearch] = useState("");
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 0,
  });

  const columns = [
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phoneNumber", headerName: "Phone", flex: 1 },
    {
      field: "message",
      headerName: "Query",
      flex: 2,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    { field: "createdAt", headerName: "Date", flex: 1 },
  ];

  const { mutate: fetchData, isLoading } = useMutation({
    mutationFn: fetchContactUs,
    onSuccess: (data) => {
      if (data) {
        setPagination((pre) => ({
          ...pre,
          totalPage: data.total,
        }));
      }
      setTableData(data?.data ?? []);
    },
  });

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
    const delay = setTimeout(() => {
      fetchData({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
    }, 500);
    return () => clearTimeout(delay);
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData({ page: pagination.page, limit: pagination.limit, search: "" });
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName || "-",
      email: item.email || "-",
      phoneNumber: item.phoneNumber,
      message: item.message,
      createdAt: item.createdAt
        ? format(parseISO(item.createdAt), "dd/MM/yyyy hh:mm a")
        : "-",
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle
        title="Contact Us Queries"
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
        rowCount={pagination.totalPage}
        style={{ height: "calc(100vh - 180px)" }}
      />
    </MainWrapper>
  );
}
