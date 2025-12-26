import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { Pencil, PlusIcon, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import { deleteCities, fetchCities } from "../../services/cities";
import CityDialog from "./cityDialog";
import AddButton from "../common/addButton";
import MainWrapper from "../common/layout/mainWrapper";
import PageTitle from "../common/layout/PageTitle";
import CustomDataGrid from "../common/CustomDataGrid";
import CustomDialog from "../common/CustomDialog";

export default function CityList() {
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
    { field: "code", headerName: "Code", flex: 1 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "latitude", headerName: "Latitude", flex: 1 },
    { field: "longitude", headerName: "Longitude", flex: 1 },
    { field: "isFeatured", headerName: "Is Featured", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenPopup(params.id)}>
            <Pencil className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={() => setConfirmationDialog(params.id)}>
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </>
      ),
    },
  ];

  const { mutate: fetchLatestCities, isPending } = useMutation({
    mutationFn: fetchCities,
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

  const handleDelete = async () => {
    handleDeleteCities(confirmationDialog)
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

  const { mutate: handleDeleteCities, isPending: deleteLoader } = useMutation({
    mutationFn: deleteCities,
    onSuccess: () => {
      toast.success("City deleted successfully");
      fetchLatestCities({ page: pagination.page, limit: pagination.limit, search: '' })
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
  });

  const handlePagination = (value) => {
    setPagination((pre) => ({ ...pre, page: value }));
    fetchLatestCities({ page: value, limit: pagination.limit, search: '' })
  };

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
    fetchLatestCities({ page: pagination.page, limit: pagination.limit, search: '' })
  }, [pagination.page, pagination.limit]);

  const rows = useMemo(() => {
      if (!tableData) return [];
      return tableData.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        latitude: item.latitude,
        longitude: item.longitude,
        latitude: item.latitude,
        isFeatured: item.isFeatured ? "Yes" : "No",
      }));
    }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title={"Aminities"} actions={buttons} />
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
        heading={`Confirm delete City`}
        actions={confirmationDialogActions}
        size='sm'
      >
        <div className="mb-3">
          <p>Are you sure you want to delete this City?</p>
        </div>
      </CustomDialog>
      {openPopup && (
        <CityDialog
          open={openPopup}
          cityID={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestCities({page: pagination.page, limit: pagination.limit, search: ''});
            }
          }}
        />
      )}
    </MainWrapper>
    // <div className="px-6 pb-6 bg-white rounded">
    //   <div className="flex items-center justify-between my-4 border-b pb-3">
    //     <h1 className="text-xl font-semibold text-gray-800">Cities</h1>

    //     <AddButton handleClick={() => handleOpenPopup("")} title="Add City" />
    //   </div>
    //   <div className="overflow-x-auto border border-gray-200 rounded-lg">
    //     <Table>
    //       <TableHead>
    //         <TableRow className="bg-gray-100">
    //           {[
    //             "Name",
    //             "Code",
    //             "State",
    //             "Latitude",
    //             "Longitude",
    //             "Is Featured",
    //             "Action",
    //           ].map((head) => (
    //             <TableCell
    //               key={head}
    //               className="font-semibold text-gray-700 whitespace-nowrap"
    //               {...{ align: head == "Action" ? "right" : "left" }}
    //             >
    //               {head}
    //             </TableCell>
    //           ))}
    //         </TableRow>
    //       </TableHead>

    //       <TableBody>
    //         {tableData?.map((row) => (
    //           <TableRow key={row.id}>
    //             <TableCell>{row.name}</TableCell>
    //             <TableCell>{row.code}</TableCell>
    //             <TableCell>{row.state}</TableCell>
    //             <TableCell>{row.latitude}</TableCell>
    //             <TableCell>{row.longitude}</TableCell>
    //             <TableCell>{row.isFeatured ? "Active" : "Inactive"}</TableCell>
    //             <TableCell align="right">
    //               <IconButton onClick={() => handleOpenPopup(row.id)}>
    //                 <Pencil size={18} />
    //               </IconButton>
    //               <IconButton
    //                 disabled={deleteLoader}
    //                 onClick={() => handleDeleteCities(row.id)}
    //               >
    //                 <Trash2 size={18} />
    //               </IconButton>
    //             </TableCell>
    //           </TableRow>
    //         ))}
    //       </TableBody>
    //     </Table>
    //   </div>

    //   <div className="flex justify-center mt-4">
    //     <CustomPagination
    //       page={pagination.page}
    //       totalPages={pagination.totalPage}
    //       onChange={(value) => handlePagination(value)}
    //     />
    //   </div>

    //   {openPopup && (
    //     <CityDialog
    //       open={openPopup}
    //       cityID={editId}
    //       onClose={(isUpdate) => {
    //         setEditId(null);
    //         setOpenPopup(false);
    //         if (isUpdate) {
    //           fetchLatestCities({page: pagination.page, limit: pagination.limit, search: ''});
    //         }
    //       }}
    //     />
    //   )}
    // </div>
  );
}
