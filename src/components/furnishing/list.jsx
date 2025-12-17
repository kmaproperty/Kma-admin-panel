import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import FurnishingDialog from "./furnishingDialog";
import { deleteFurnishing, fetchFurnishing } from "../../services/furnishing";

export default function FurnishingList() {
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1
  });
  const [openPopup, setOpenPopup] =  useState(false)
  const [editId, setEditId] = useState(null);

  const { data, refetch: fetchLatestFurnisher } = useQuery({
    queryKey: ["amenities", pagination.page],
    queryFn: () => fetchFurnishing({ page: pagination.page, limit: pagination.limit}),
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: handleDeleteFurnishing, isPending: deleteLoader} = useMutation({
    mutationFn: deleteFurnishing,
    onSuccess: () => {
      toast.success('Furnisher deleted successfully')
      fetchLatestFurnisher()
    },
    onError: (error) => {
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    }
  });

  const handlePagination = (value) => {
    setPagination((pre) => ({...pre, page: value}))
  }

  const handleOpenPopup = (id) => {
    setOpenPopup(true)
    setEditId(id)
  }

  useEffect(() => {
    if(data){
      setPagination((pre) => ({...pre, totalPage: Math.ceil(data.total / pagination.limit)}))
    }
  },[data])

  return (
    <div className="px-6 pb-6 bg-white rounded">
      <div className="flex justify-center mb-2">
        <p className="text-2xl font-bold">Furnishing</p>
      </div>
      <div className="flex justify-end w-full">
      <button className="border border-blue p-2 cursor-pointer" onClick={() => handleOpenPopup('')}>
        Add Furnisher
      </button>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Sort Order</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data?.data?.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.code}</TableCell>
              <TableCell>{row.sortOrder}</TableCell>
              <TableCell>
                {row.isActive ? "Active" : "Inactive"}
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleOpenPopup(row.id)}>
                  <Pencil size={18} />
                </IconButton>
                <IconButton disabled={deleteLoader} onClick={() => handleDeleteFurnishing(row.id)}>
                  <Trash2 size={18} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <CustomPagination page={pagination.page} totalPages={pagination.totalPage} onChange={(value) => handlePagination(value)}/>
      </div>

      {openPopup && (
        <FurnishingDialog
          open={openPopup}
          furnishingId={editId}
          onClose={(isUpdate) => {
            setEditId(null)
            setOpenPopup(false)
            if(isUpdate){
              fetchLatestFurnisher()
            }
          }}
        />
      )}
    </div>
  );
}
