import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { X } from "lucide-react";
import { fetchAboutUs, createAboutUs, updateAboutUs } from "../../services/aboutUs";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";
import AddButton from "../../components/common/addButton";

export default function AboutUsList() {
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ heading: "", description: "" });

  const columns = [
    { field: "heading", headerName: "Heading", flex: 1 },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <p className="truncate" title={params.value}>
            {params.value}
          </p>
        </div>
      ),
    },
    { field: "createdAt", headerName: "Created Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="h-full flex items-center">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              <Pencil size={16} />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const { mutate: fetchData, isPending: isLoading } = useMutation({
    mutationFn: fetchAboutUs,
    onSuccess: (data) => {
      if (data) {
        setPagination((pre) => ({
          ...pre,
          totalPage: data.total,
        }));
      }
      setTableData(data?.data ?? []);
    },
  });

  const { mutate: submitCreate, isPending: createLoader } = useMutation({
    mutationFn: createAboutUs,
    onSuccess: () => {
      toast.success("About Us created successfully");
      handleCloseDialog();
      fetchData({ page: pagination.page, limit: pagination.limit });
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

  const { mutate: submitUpdate, isPending: updateLoader } = useMutation({
    mutationFn: updateAboutUs,
    onSuccess: () => {
      toast.success("About Us updated successfully");
      handleCloseDialog();
      fetchData({ page: pagination.page, limit: pagination.limit });
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

  useEffect(() => {
    fetchData({ page: pagination.page, limit: pagination.limit });
  }, [pagination.page, pagination.limit]);

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ heading: row.heading, description: row.rawDescription });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({ heading: "", description: "" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditId(null);
    setForm({ heading: "", description: "" });
  };

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = () => {
    if (!form.heading.trim()) {
      toast.error("Heading is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (editId) {
      submitUpdate({
        id: editId,
        payload: { heading: form.heading, description: form.description },
      });
    } else {
      submitCreate({ heading: form.heading, description: form.description });
    }
  };

  const rows = useMemo(() => {
    if (!tableData) return [];
    return tableData.map((item) => ({
      id: item.id,
      heading: item.heading || "-",
      description: item.description
        ? item.description.length > 100
          ? item.description.substring(0, 100) + "..."
          : item.description
        : "-",
      rawDescription: item.description || "",
      createdAt: item.createdAt
        ? format(parseISO(item.createdAt), "dd/MM/yyyy hh:mm a")
        : "-",
    }));
  }, [tableData]);

  const isSaving = createLoader || updateLoader;

  return (
    <MainWrapper>
      <PageTitle
        title="About Us"
        actions={[
          {
            label: "Add",
            onClick: handleAdd,
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
          },
        ]}
      />
      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={pagination.totalPage}
        style={{ height: "calc(100vh - 180px)" }}
      />

      {/* Add / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editId ? "Edit About Us" : "Add About Us"}
            </h2>
            <button
              onClick={handleCloseDialog}
              className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Heading
              </label>
              <input
                type="text"
                placeholder="Enter heading"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                         transition outline-none"
                value={form.heading}
                onChange={(e) => handleChange("heading", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                         transition outline-none resize-none"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              type="button"
              className="w-full bg-indigo-600 text-white py-2.5
                       rounded-lg font-medium cursor-pointer
                       hover:bg-indigo-700
                       disabled:opacity-60
                       transition"
            >
              {isSaving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MainWrapper>
  );
}
