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
import BhkDialog from "./bhkDialog";
import { deleteBhk, fetchBhk } from "../../services/bhk";
import AddButton from "../common/addButton";
import CustomDialog from "../common/CustomDialog";
import CustomDataGrid from "../common/CustomDataGrid";
import PageTitle from "../common/layout/PageTitle";
import MainWrapper from "../common/layout/mainWrapper";

export default function BHKList() {
  const [tableData, setTableData] = useState([])
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);
const [search, setSearch] = useState("");

  const handleDelete = async () => {
    handleDeleteBhk(confirmationDialog)
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
    { field: "sortOrder", headerName: "Sort Order", flex: 1 },
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

  const { mutate: fetchLatestBhk, isPending } = useMutation({
    mutationFn: fetchBhk,
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
  });

  const { mutate: handleDeleteBhk, isPending: deleteLoader } = useMutation({
    mutationFn: deleteBhk,
    onSuccess: () => {
      toast.success("Bhk deleted successfully");
      fetchLatestBhk({ page: pagination.page, limit: pagination.limit, search: '' })
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

  const onPageChange = useCallback((uiPage) => {
    const newPage = uiPage + 1;
    setPagination((prev) => {
      // Only update if it's genuinely different to prevent loops
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

  const handleOpenPopup = (id) => {
    setOpenPopup(true);
    setEditId(id);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchLatestBhk({ page: pagination.page, limit: pagination.limit, search: search })
    }, 500);

    return () => clearTimeout(delay);
  }, [search, pagination.page, pagination.limit]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      name: item.name,
      sortOrder: item?.sortOrder,
    }));
  }, [tableData]);

  return (
    <MainWrapper>
      <PageTitle title={"BHK"} actions={buttons} isSearch searchValue={search} onSearchChange={handleSearch} />
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
        <BhkDialog
          open={openPopup}
          bhdId={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestBhk({ page: pagination.page, limit: pagination.limit, search: '' });
            }
          }}
        />
      )}
    </MainWrapper>
    // <div className="px-6 pb-6 bg-white rounded">
    //   <div className="flex items-center justify-between my-4 border-b pb-3">
    //     <h1 className="text-xl font-semibold text-gray-800">Bhk</h1>

    //     <AddButton handleClick={() => handleOpenPopup("")} title="Add Bhk" />
    //   </div>
    //   <div className="overflow-x-auto border border-gray-200 rounded-lg">
    //     <Table>
    //       <TableHead className="bg-gray-100">
    //         <TableRow>
    //           {["Name", "Code", "Sort Order", "Action"].map((head) => (
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
    //             <TableCell>{row.sortOrder}</TableCell>
    //             <TableCell align="right">
    //               <IconButton onClick={() => handleOpenPopup(row.id)}>
    //                 <Pencil size={18} />
    //               </IconButton>
    //               <IconButton
    //                 disabled={deleteLoader}
    //                 onClick={() => handleDeleteBhk(row.id)}
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
    //     <BhkDialog
    //       open={openPopup}
    //       bhdId={editId}
    //       onClose={(isUpdate) => {
    //         setEditId(null);
    //         setOpenPopup(false);
    //         if (isUpdate) {
    //           fetchLatestBhk({page: pagination.page, limit: pagination.limit, search: ''});
    //         }
    //       }}
    //     />
    //   )}
    // </div>
  );
}
