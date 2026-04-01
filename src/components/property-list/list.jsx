import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  Box
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomPagination from "../common/pagination";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Eye,
  OctagonMinusIcon,
  ListFilter
} from "lucide-react";
import ApproveRejectProperty from "../common/approveReject/approveRejectProperty";
import { PROPERTY_STATUS } from "../../lib/enums";
import { deletePropertyApiHandler } from "../../services/postProperty";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import CustomDataGrid from "../common/CustomDataGrid";
import PageTitle from "../common/layout/PageTitle";


export default function PropertiesTable({ propertyList, propertyData, openFilterPopup, fetchPropertyList, pagination, setPagination, isLoading }) {

  const columns = [
    {
      field: "img", headerName: "Image",
      renderCell: (params) => {
        return (

          <img
            className="object-cover rounded-lg"
            style={{ height: "44px", width: "50px" }}
            src={params.row.img}
            alt=""
            onError={(e) => {
              e.currentTarget.src =
                "https://www.rootinc.com/wp-content/uploads/2022/11/placeholder-1.png";
            }}
          />
        )
      }
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "carpetArea", headerName: "Carpet Area", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "owner", headerName: "Owner", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      renderCell: (params) => (
        <>
          <div className="w-full flex justify-end items-center h-full">
            <Tooltip title="View">
              <Link to={`/properties/view/${params.id}`} className="h-fit inline-block max-h-[50px]">
                <button className="h-fit mr-2 py-2 px-3 bg-gray-50 cursor-pointer rounded-sm">
                  <Eye className="text-gray-700 w-4.5 h-4.5" />
                </button>
              </Link>
            </Tooltip>
            <Tooltip title="Edit">
              <Link to={`/properties/${params.id}`} className="h-fit inline-block max-h-[50px]">
                <button className="h-fit mr-2 py-2 px-3 bg-blue-50 cursor-pointer rounded-sm">
                  <Pencil className="text-blue-800 w-4.5 h-4.5" />
                </button>
              </Link>
            </Tooltip>
            <Tooltip title="Delete">
              <button onClick={() => deleteProperty(params.id)} className="h-fit mr-2 py-2 px-3 bg-red-50 cursor-pointer rounded-sm">
                <Trash2 className="text-red-800 w-4.5 h-4.5" />
              </button>
            </Tooltip>

          </div>
        </>
      ),
    }
  ];

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


  const { mutate: deleteProperty, isPending: deleteLoader } = useMutation({
    mutationFn: deletePropertyApiHandler,
    onSuccess: (res) => {
      toast.success(res.message)
      fetchPropertyList()
    },
    onError: (error) => {
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item)
        })
      } else {
        toast.error(error.message)
      }
    }
  })

  useEffect(() => {
    fetchPropertyList()
  }, [pagination])

  const rows = useMemo(() => {
    if (!propertyList) return [];
    return propertyList.map((item) => ({
      id: item.id,
      name: item.society?.name ?? '',
      img: item?.photos?.length
        ? `${import.meta.env.VITE_AWS_URL}${item.photos[0]?.fileKey}`
        : '',
      category: item?.category?.name ?? '',
      price: item?.price ?? '',
      carpetArea: item?.carpetArea ?? '',
      city: item?.city?.name ?? '',
      listingType: item?.listingType?.name ?? '',
      owner: item?.owner?.name ?? '',
      status: item?.status ?? '',
    }));
  }, [propertyList]);

  return (
    <Paper sx={{ padding: 2, paddingTop: 0 }}>
      <Box className="flex justify-between items-center">
        <PageTitle
          title="Property List"
        />
        <button className={`px-5 flex gap-2 items-center cursor-pointer py-2 border border-gray-300  rounded-md bg-gray-100 text-sm font-medium`} onClick={openFilterPopup}>
          <ListFilter className="w-3.5 h-3.5"/>
          Filter
        </button>
      </Box>

      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={propertyData?.total || 0}
        style={{ height: "calc(100vh - 280px)" }}
      />
    </Paper>
  );
}
