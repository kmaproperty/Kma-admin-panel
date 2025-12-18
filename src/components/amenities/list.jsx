import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  IconButton,
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AmenityDialog from "./amenityDialog";
import { deleteAmenity, fetchAmenities } from "../../services/amenities";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import AddButton from "../common/addButton";

export default function AmenityList() {
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data, refetch: fetchLatestAmenity } = useQuery({
    queryKey: ["amenities", pagination.page],
    queryFn: () =>
      fetchAmenities({ page: pagination.page, limit: pagination.limit }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: deleteAmenities, isPending: deleteLoader } = useMutation({
    mutationFn: deleteAmenity,
    onSuccess: () => {
      toast.success("Amenity deleted successfully");
      fetchLatestAmenity();
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
  };

  const handleOpenPopup = (id) => {
    setOpenPopup(true);
    setEditId(id);
  };

  useEffect(() => {
    if (data) {
      setPagination((pre) => ({
        ...pre,
        totalPage: Math.ceil(data.total / pagination.limit),
      }));
    }
  }, [data]);

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
            {data?.data?.map((row) => (
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
              fetchLatestAmenity();
            }
          }}
        />
      )}
    </div>
  );
}
