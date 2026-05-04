import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FormControl,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from "@mui/material";
import { Pencil, PlusIcon, Trash } from "lucide-react";
import { toast } from "react-toastify";
import MainWrapper from "../../components/common/layout/mainWrapper";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import {
  createJob,
  deleteJob,
  fetchJobById,
  fetchJobCategories,
  fetchJobs,
  updateJob,
} from "../../services/jobs";

const initialForm = {
  title: "",
  companyName: "",
  location: "",
  jobType: "",
  description: "",
  requirements: "",
  benefits: "",
  status: "DRAFT",
  categoryIds: [],
  isActive: true,
};

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleteId, setDeleteId] = useState(null);

  const categoriesQuery = useQuery({
    queryKey: ["job-categories"],
    queryFn: fetchJobCategories,
  });

  const jobsQuery = useQuery({
    queryKey: ["jobs", pagination.page, pagination.limit, search],
    queryFn: () => fetchJobs({ page: pagination.page, limit: pagination.limit, search }),
  });

  useEffect(() => {
    if (jobsQuery.data) {
      setPagination((p) => ({ ...p, total: jobsQuery.data.total || 0 }));
    }
  }, [jobsQuery.data]);

  const submitMutation = useMutation({
    mutationFn: (payload) => (editId ? updateJob({ id: editId, payload }) : createJob(payload)),
    onSuccess: () => {
      toast.success(editId ? "Job updated" : "Job created");
      jobsQuery.refetch();
      setOpenDialog(false);
      setEditId(null);
      setForm(initialForm);
    },
    onError: (e) => toast.error(e?.message || "Could not save job"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success("Job deleted");
      jobsQuery.refetch();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e?.message || "Could not delete job"),
  });

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setOpenDialog(true);
  };

  const openEdit = async (id) => {
    try {
      const response = await fetchJobById(id);
      const j = response?.data;
      setEditId(id);
      setForm({
        title: j.title || "",
        companyName: j.companyName || "",
        location: j.location || "",
        jobType: j.jobType || "",
        description: j.description || "",
        requirements: j.requirements || "",
        benefits: j.benefits || "",
        status: j.status || "DRAFT",
        categoryIds: (j.categories || []).map((c) => c.id),
        isActive: j.isActive ?? true,
      });
      setOpenDialog(true);
    } catch (e) {
      toast.error(e?.message || "Could not load job details");
    }
  };

  const rows = useMemo(
    () =>
      (jobsQuery.data?.data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        companyName: item.companyName,
        location: item.location,
        categories: (item.categories || []).map((c) => c.name).join(", "),
        status: item.status,
        isActive: item.isActive ? "Yes" : "No",
      })),
    [jobsQuery.data],
  );

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "companyName", headerName: "Company", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "categories", headerName: "Categories", flex: 1.5 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "isActive", headerName: "Active", width: 100 },
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
        title="Jobs"
        isSearch
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
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
        loading={jobsQuery.isLoading}
        onPageChange={(uiPage) => setPagination((p) => ({ ...p, page: uiPage + 1 }))}
        onPageSizeChange={(newSize) =>
          setPagination((p) => ({ ...p, limit: newSize, page: 1 }))
        }
        page={pagination.page - 1}
        pageSize={pagination.limit}
        rowCount={pagination.total}
        style={{ height: "calc(100vh - 180px)" }}
      />

      <CustomDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        heading={editId ? "Edit job" : "Create job"}
        size="md"
        actions={[
          { label: "Cancel", variant: "outline", onClick: () => setOpenDialog(false) },
          {
            label: submitMutation.isPending ? "Saving..." : "Save",
            variant: "primary",
            onClick: () => submitMutation.mutate(form),
          },
        ]}
      >
        <div className="space-y-3">
          <InputBase value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Job title" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Company name" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.jobType} onChange={(e) => setForm((p) => ({ ...p, jobType: e.target.value }))} placeholder="Job type (Full-time, Contract...)" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Job description" multiline minRows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} placeholder="Requirements" multiline minRows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.benefits} onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))} placeholder="Benefits" multiline minRows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />

          <FormControl fullWidth size="small">
            <InputLabel id="job-status">Status</InputLabel>
            <Select
              labelId="job-status"
              value={form.status}
              label="Status"
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="job-categories">Categories</InputLabel>
            <Select
              labelId="job-categories"
              multiple
              value={form.categoryIds}
              label="Categories"
              onChange={(e) => setForm((p) => ({ ...p, categoryIds: e.target.value }))}
              renderValue={(selected) =>
                selected
                  .map(
                    (id) =>
                      (categoriesQuery.data?.data ?? []).find((c) => c.id === id)?.name || id,
                  )
                  .join(", ")
              }
            >
              {(categoriesQuery.data?.data ?? []).map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
        heading="Delete job"
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
        <p>Are you sure you want to delete this job?</p>
      </CustomDialog>
    </MainWrapper>
  );
}
