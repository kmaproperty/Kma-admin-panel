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
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import LocalityDialog from "./localityDialog";
import { deleteLocality, fetchLocality } from "../../services/localities";
import AddButton from "../common/addButton";
import CustomDialog from "../common/CustomDialog";
import MainWrapper from "../common/layout/mainWrapper";
import PageTitle from "../common/layout/PageTitle";
import CustomDataGrid from "../common/CustomDataGrid";

export default function LocalityList() {
  const [tableData, setTableData] = useState([])
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleDelete = async () => {
    handleDeleteLocality(confirmationDialog)
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

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "sector", headerName: "Sector", flex: 1 },
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
    },
  ];

  const { mutate: fetchLatestLocality, isPending } = useMutation({
    mutationFn: fetchLocality,
    onSuccess: (data) => {
      console.log('data', data)
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

  const { mutate: handleDeleteLocality, isPending: deleteLoader } = useMutation(
    {
      mutationFn: deleteLocality,
      onSuccess: () => {
        toast.success("Locality deleted successfully");
        fetchLatestLocality({ page: pagination.page, limit: pagination.limit, search: '' })
        setConfirmationDialog(null);
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
    }
  );

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

  const handleOpenPopup = (id) => {
    setOpenPopup(true);
    setEditId(id);
  };

  useEffect(() => {
    fetchLatestLocality({ page: pagination.page, limit: pagination.limit, search: '' })
  }, [pagination.page, pagination.limit]);

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      name: item.name,
      city: item?.city?.name,
      sector: item.sector,
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title={"Socities"} actions={buttons} />
      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={isPending || deleteLoader}
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
        heading={`Confirm delete Society`}
        actions={confirmationDialogActions}
        size='sm'
      >
        <div className="mb-3">
          <p>Are you sure you want to delete this Society?</p>
        </div>
      </CustomDialog>
      {openPopup && (
        <LocalityDialog
          open={openPopup}
          localityId={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestLocality({ page: pagination.page, limit: pagination.limit, search: '' });
            }
          }}
        />
      )}
    </MainWrapper>
  );
}
