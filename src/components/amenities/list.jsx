import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Pencil, PlusIcon, Trash, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import AmenityDialog from "./amenityDialog";
import { deleteAmenity, fetchAmenities } from "../../services/amenities";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import AddButton from "../common/addButton";
import PageTitle from "../common/layout/PageTitle";
import CustomDataGrid from "../common/CustomDataGrid";
import CustomDialog from "../common/CustomDialog";
import { format, parseISO, set } from "date-fns";
import { useNavigate } from "react-router-dom";
import MainWrapper from "../common/layout/mainWrapper";

export default function AmenityList() {
  const [tableData, setTableData] = useState([])
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "sortOrder", headerName: "Sort Order", flex: 1 },
    { field: "isActive", headerName: "Is Active", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <div className="w-full flex justify-end items-center h-full">
            <Tooltip title="Edit">
                <button className="mr-3 py-2 px-3 bg-blue-50 cursor-pointer rounded-sm" onClick={() => handleOpenPopup(params.id)}>
                  <Pencil className="text-blue-800 w-4.5 h-4.5" />
                </button>
            </Tooltip>
            <Tooltip title={"Delelte"}>
              <button disabled={deleteLoader} className={` py-2 px-3 bg-red-50 rounded-sm cursor-pointer `} onClick={() => setConfirmationDialog(params.id)}>
                <Trash className="text-red-800 w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </>
      ),
    }
  ];

  const handleDelete = async () => {
    deleteAmenities(confirmationDialog)
  }
  const handleClose = () => {
    setConfirmationDialog(null);
  }

  const buttons = [
    {
      label: 'Add',
      icon: <PlusIcon className="w-4 h-4" />,
      onClick: () => {
        handleOpenPopup("")
      }
    },
  ];

  const confirmationDialogActions = [
    {
      label: 'Delete',
      variant: 'danger',
      onClick: () => {
        handleDelete()
      }
    },
    {
      label: 'Close',
      variant: 'outline-secondary',
      onClick: handleClose
    },
  ];

  const { mutate: fetchLatestAmenity, isLoading } = useMutation({
    mutationFn: fetchAmenities,
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
    fetchLatestAmenity({ page: pagination.page, limit: pagination.limit, search: '' })
  }, [pagination.page, pagination.limit])

  const { mutate: deleteAmenities, isPending: deleteLoader } = useMutation({
    mutationFn: deleteAmenity,
    onSuccess: () => {
      toast.success("Amenity deleted successfully");
      setConfirmationDialog(null);
      fetchLatestAmenity({ page: pagination.page, limit: pagination.limit, search: '' })
    },
    onError: (error) => {
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handlePagination = (value) => {
    setPagination((pre) => ({ ...pre, page: value }));
    fetchLatestAmenity({ page: value, limit: pagination.limit, search: '' })
  };

  const handleOpenPopup = (id) => {
    setOpenPopup(true);
    setEditId(id);
  };

  useEffect(() => {
    fetchLatestAmenity({ page: pagination.page, limit: pagination.limit, search: '' })
  }, []);

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      name: item.name,
      sortOrder: item.sortOrder,
      isActive: item.isActive ? "Yes" : "No",
      createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy')
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title={"Aminities"} actions={buttons} />
      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={isLoading || deleteLoader}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={pagination.totalPage}
        style={{ height: "calc(100vh - 170px)" }}
      />
      <CustomDialog
        open={confirmationDialog ? true : false}
        handleClose={handleClose}
        heading={`Confirm delete amenity`}
        actions={confirmationDialogActions}
        size='sm'
      >
        <div className="mb-3">
          <p>Are you sure you want to delete this amenity?</p>
        </div>
      </CustomDialog>
      {openPopup && (
        <AmenityDialog
          open={openPopup}
          amenityId={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestAmenity({ page: pagination.page, limit: pagination.limit, search: '' });
            }
          }}
        />
      )}
    </MainWrapper>

  );
}
