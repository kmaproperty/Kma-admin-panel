import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CustomPagination from "../common/pagination";
import { toast } from "react-toastify";
import LocalityDialog from "./localityDialog";
import { deleteLocality, fetchLocality } from "../../services/localities";
import AddButton from "../common/addButton";

export default function LocalityList() {
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1,
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data, refetch: fetchLatestLocality } = useQuery({
    queryKey: ["locality", pagination.page],
    queryFn: () =>
      fetchLocality({ page: pagination.page, limit: pagination.limit }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: handleDeleteLocality, isPending: deleteLoader } = useMutation(
    {
      mutationFn: deleteLocality,
      onSuccess: () => {
        toast.success("Locality deleted successfully");
        fetchLatestLocality();
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
        <h1 className="text-xl font-semibold text-gray-800">Localities</h1>

        <AddButton
          handleClick={() => handleOpenPopup("")}
          title="Add Locality"
        />
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              {[
                "Name",
                "Sector",
                "City",
                "Latitude",
                "Longitude",
                "Action",
              ].map((head) => (
                <TableCell
                  key={head}
                  className="font-semibold text-gray-700 whitespace-nowrap"
                  {...{ align: head == "Action" ? "right" : "left" }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.sector}</TableCell>
                <TableCell>{row.city?.name ?? ""}</TableCell>
                <TableCell>{row.latitude}</TableCell>
                <TableCell>{row.longitude}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenPopup(row.id)}>
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton
                    disabled={deleteLoader}
                    onClick={() => handleDeleteLocality(row.id)}
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
        <LocalityDialog
          open={openPopup}
          localityId={editId}
          onClose={(isUpdate) => {
            setEditId(null);
            setOpenPopup(false);
            if (isUpdate) {
              fetchLatestLocality();
            }
          }}
        />
      )}
    </div>
  );
}
