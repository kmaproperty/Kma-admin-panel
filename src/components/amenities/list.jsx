import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AmenityDialog from "./amenityDialog";
import { deleteAmenity, fetchAmenities } from "../../services/amenities";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import AddButton from "../common/addButton";

export default function AmenityList() {
  const [tableData, setTableData] = useState([])
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);

  const { mutate: fetchLatestAmenity } = useMutation({
    mutationFn: fetchAmenities,
    onSuccess: (data) => {
      console.log('data', data)
      if (data) {
      setPagination((pre) => ({
        ...pre,
        totalPage: Math.ceil(data.total / pagination.limit),
        }));
      }
      setTableData(data?.data ?? [])

    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: deleteAmenities, isPending: deleteLoader } = useMutation({
    mutationFn: deleteAmenity,
    onSuccess: () => {
      toast.success("Amenity deleted successfully");
      fetchLatestAmenity({page: pagination.page, limit: pagination.limit, search: ''})
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
    fetchLatestAmenity({page: value, limit: pagination.limit, search: ''})
  };

  const handleOpenPopup = (id) => {
    setOpenPopup(true);
    setEditId(id);
  };

  useEffect(() => {
    fetchLatestAmenity({page: pagination.page, limit: pagination.limit, search: ''})
  }, []);

  return (
    <div className="px-6 pb-6 bg-white rounded">
      <div className="flex items-center justify-between my-4 border-b pb-3">
        <h1 className="text-xl font-semibold text-gray-800">Amenities</h1>

        <AddButton
          handleClick={() => handleOpenPopup("")}
          title="Add Amenity"
        />
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              {["Name", "Code", "Sort Order", "Status", "Action"].map(
                (head) => (
                  <TableCell
                    key={head}
                    className="font-semibold text-gray-700 whitespace-nowrap"
                    {...{ align: head == "Action" ? "right" : "left" }}
                  >
                    {head}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {tableData?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.sortOrder}</TableCell>
                <TableCell>{row.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenPopup(row.id)}>
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton
                    disabled={deleteLoader}
                    onClick={() => deleteAmenities(row.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center mt-4">
        <CustomPagination
          page={pagination.page}
          totalPages={pagination.totalPage}
          onChange={(value) => handlePagination(value)}
        />
      </div>

      {openPopup && (
        <AmenityDialog
          open={openPopup}
          amenityId={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestAmenity({page: pagination.page, limit: pagination.limit, search: ''});
            }
          }}
        />
      )}
    </div>
  );
}
