import {
  Tooltip,
} from "@mui/material";
import { Eye} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageTitle from "../common/layout/PageTitle";
import CustomDataGrid from "../common/CustomDataGrid";
import { format, parseISO } from "date-fns";
import MainWrapper from "../common/layout/mainWrapper";
import { fetchVerifyPropertyList } from "../../services/verify-property";
import { Link } from "react-router-dom";

export default function VerifyPropertyListComponent() {
  const [search, setSearch] = useState("");
  const [tableData, setTableData] = useState([])
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "requestedByName", headerName: "Request By", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <> 
          <div className="w-full flex justify-end items-center h-full">
            <Tooltip title="View">
              <Link to={`/verify-property/${params.id}`} className="h-fit inline-block max-h-[50px]">
                <button disabled={params?.row?.status == 'pending'} className="h-fit mr-2 p-2 bg-gray-50 rounded-sm" style={{cursor: params?.row?.status == 'pending' ? 'no-drop' : 'pointer'}}>
                  <Eye className="text-gray-700 w-4.5 h-4.5" />
                </button>
              </Link>
            </Tooltip>
          </div>
        </>
      ),
    }
  ];

  const { mutate: fetchLatestVerifyPropertyList, isLoading } = useMutation({
    mutationFn: fetchVerifyPropertyList,
    onSuccess: (data) => {

      if (data) {
        setPagination((pre) => ({
          ...pre,
          totalPage: data.total,
        }));
      }
      setTableData(data?.data ?? [])

    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const onPageChange = useCallback((uiPage) => {
    const newPage = uiPage + 1;
    setPagination((prev) => {
      // Only update if it's genuinely different to prevent loops
      if (prev.page === newPage) return prev;
      console.log("Setting State to Page:", newPage);
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
      fetchLatestVerifyPropertyList({
        page: pagination.page,
        limit: pagination.limit,
      });
    }, 500);

    return () => clearTimeout(delay);
  }, [search, pagination.page, pagination.limit]);


  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  useEffect(() => {
    fetchLatestVerifyPropertyList({ page: pagination.page, limit: pagination.limit })
  }, []);

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      name: item.propertyTitle,
      requestedByName: item.requestedByName,
      status: item.status,
      createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy')
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title={"Property Photo Type"} isSearch searchValue={search} onSearchChange={handleSearch} />
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
