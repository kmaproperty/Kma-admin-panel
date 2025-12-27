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
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import FurnishingDialog from "./furnishingDialog";
import { deleteFurnishing, fetchFurnishing } from "../../services/furnishing";
import AddButton from "../common/addButton";
import MainWrapper from "../common/layout/mainWrapper";
import PageTitle from "../common/layout/PageTitle";
import CustomDataGrid from "../common/CustomDataGrid";
import { format, parseISO, set } from "date-fns";
import CustomDialog from "../common/CustomDialog";

export default function FurnishingList() {
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
    { field: "isActive", headerName: "Status", flex: 1 },
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
    deleteFurnishing(confirmationDialog)
  }
  const handleClose = () => {
    setConfirmationDialog(null);
  }

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


  const buttons = [
    {
      label: 'Add',
      icon: <PlusIcon className="w-4 h-4" />,
      onClick: () => {
        handleOpenPopup("")
      }
    },
  ];

  const { mutate: fetchLatestFurnisher, isLoading } = useMutation({
    mutationFn: fetchFurnishing,
    onSuccess: (data) => {
      if (data) {
        setPagination((prev) => {
          const newTotalPage = data.total;
          if (prev.totalPage === newTotalPage) return prev;
          return { ...prev, totalPage: newTotalPage };
        });
      }

      setTableData(data?.data ?? []);
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: handleDeleteFurnishing, isPending: deleteLoader } =
    useMutation({
      mutationFn: deleteFurnishing,
      onSuccess: () => {
        toast.success("Furnisher deleted successfully");
        setConfirmationDialog(null)
        fetchLatestFurnisher({ page: pagination.page, limit: pagination.limit, search: '' })
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

  const handleOpenPopup = (id) => {
    setOpenPopup(true);
    setEditId(id);
  };

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
    fetchLatestFurnisher({ page: pagination.page, limit: pagination.limit, search: '' })
  }, [pagination.page, pagination.limit]);

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      sortOrder: item.sortOrder,
      isActive: item.isActive ? "Yes" : "No",
      createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy')
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title={"Furnishing"} actions={buttons} />
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
        heading={`Confirm delete furnishing`}
        actions={confirmationDialogActions}
        size='sm'
      >
        <div className="mb-3">
          <p>Are you sure you want to delete this furnishing?</p>
        </div>
      </CustomDialog>
      {openPopup && (
        <FurnishingDialog
          open={openPopup}
          furnishingId={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestFurnisher({ page: pagination.page, limit: pagination.limit, search: '' });
            }
          }}
        />
      )}
    </MainWrapper>
  );
}
