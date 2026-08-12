import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InputBase, Switch } from "@mui/material";
import { Pencil, PlusIcon, Trash } from "lucide-react";
import MainWrapper from "../../components/common/layout/mainWrapper";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import { toast } from "react-toastify";
import {
  createJobCategory,
  deleteJobCategory,
  fetchJobCategories,
  updateJobCategory,
} from "../../services/jobs";

const initialForm = { name: "", description: "", isActive: true };

export default function JobCategoriesPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleteId, setDeleteId] = useState(null);

  const categoriesQuery = useQuery({
    queryKey: ["job-categories"],
    queryFn: fetchJobCategories,
  });

  const submitMutation = useMutation({
    mutationFn: (payload) =>
      editId
        ? updateJobCategory({ id: editId, payload })
        : createJobCategory(payload),
    onSuccess: () => {
      toast.success(editId ? "Category updated" : "Category created");
      categoriesQuery.refetch();
      setOpenDialog(false);
      setEditId(null);
      setForm(initialForm);
    },
    onError: (e) => toast.error(e?.message || "Could not save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobCategory,
    onSuccess: () => {
      toast.success("Category deleted");
      categoriesQuery.refetch();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e?.message || "Could not delete category"),
  });

  const rows = useMemo(
    () =>
      (categoriesQuery.data?.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || "—",
        isActive: item.isActive ? "Yes" : "No",
      })),
    [categoriesQuery.data],
  );

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setOpenDialog(true);
  };

  const openEdit = (id) => {
    const current = (categoriesQuery.data?.data ?? []).find((x) => x.id === id);
    if (!current) return;
    setEditId(id);
    setForm({
      name: current.name || "",
      description: current.description || "",
      isActive: !!current.isActive,
    });
    setOpenDialog(true);
  };

  const columns = [
    { field: "name", headerName: "Category", flex: 1 },
    { field: "slug", headerName: "Slugs", flex: 1 },
    { field: "description", headerName: "Description", flex: 1.5 },
    { field: "isActive", headerName: "Is Active", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            className="py-2 px-3 bg-blue-50 rounded-sm cursor-pointer"
            onClick={() => openEdit(params.id)}
          >
            <Pencil className="w-4 h-4 text-blue-700" />
          </button>
          <button
            className="py-2 px-3 bg-red-50 rounded-sm cursor-pointer"
            onClick={() => setDeleteId(params.id)}
          >
            <Trash className="w-4 h-4 text-red-700" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainWrapper>
      <PageTitle
        title="Job Categories"
        actions={[
          {
            label: "Add",
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: openCreate,
          },
        ]}
      />

      <CustomDataGrid
        columns={columns}
        rows={rows}
        loading={categoriesQuery.isLoading}
        page={0}
        pageSize={rows.length || 10}
        rowCount={rows.length}
        style={{ height: "calc(100vh - 180px)" }}
      />

      <CustomDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        heading={editId ? "Edit category" : "Create category"}
        actions={[
          { label: "Cancel", variant: "outline", onClick: () => setOpenDialog(false) },
          {
            label: submitMutation.isPending ? "Saving..." : "Save",
            variant: "primary",
            onClick: () => submitMutation.mutate(form),
          },
        ]}
        size="sm"
      >
        <div className="space-y-3">
          <InputBase
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Category name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <InputBase
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Active</span>
            <Switch
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
          </div>
        </div>
      </CustomDialog>

      <CustomDialog
        open={Boolean(deleteId)}
        handleClose={() => setDeleteId(null)}
        heading="Delete category"
        actions={[
          { label: "Cancel", variant: "outline", onClick: () => setDeleteId(null) },
          {
            label: deleteMutation.isPending ? "Deleting..." : "Delete",
            variant: "danger",
            onClick: () => deleteMutation.mutate(deleteId),
          },
        ]}
        size="sm"
      >
        <p>Are you sure you want to delete this category?</p>
      </CustomDialog>
    </MainWrapper>
  );
}
