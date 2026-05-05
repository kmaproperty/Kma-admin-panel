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
  openingsCount: "",
  country: "India",
  state: "",
  city: "",
  workMode: "WORK_FROM_OFFICE",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  salaryType: "MONTHLY",
  salaryMin: "",
  salaryMax: "",
  salaryVisibility: true,
  minimumQualification: "",
  experienceLabel: "",
  skillsText: "",
  hrName: "",
  hrMobileNumber: "",
  contactEmail: "",
  companyWebsite: "",
  applyType: "IN_APP",
  applyLink: "",
  featured: false,
  urgentHiring: false,
  applicationDeadline: "",
  approvalStatus: "PENDING",
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
        openingsCount: j.openingsCount ?? "",
        country: j.country || "India",
        state: j.state || "",
        city: j.city || "",
        workMode: j.workMode || "WORK_FROM_OFFICE",
        description: j.description || "",
        responsibilities: j.responsibilities || "",
        requirements: j.requirements || "",
        benefits: j.benefits || "",
        salaryType: j.salaryType || "MONTHLY",
        salaryMin: j.salaryMin || "",
        salaryMax: j.salaryMax || "",
        salaryVisibility: j.salaryVisibility ?? true,
        minimumQualification: j.minimumQualification || "",
        experienceLabel: j.experienceLabel || "",
        skillsText: j.skills || "",
        hrName: j.hrName || "",
        hrMobileNumber: j.hrMobileNumber || "",
        contactEmail: j.contactEmail || "",
        companyWebsite: j.companyWebsite || "",
        applyType: j.applyType || "IN_APP",
        applyLink: j.applyLink || "",
        featured: j.featured ?? false,
        urgentHiring: j.urgentHiring ?? false,
        applicationDeadline: j.applicationDeadline
          ? new Date(j.applicationDeadline).toISOString().slice(0, 10)
          : "",
        approvalStatus: j.approvalStatus || "PENDING",
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
            onClick: () => {
              const {
                skillsText,
                ...restForm
              } = form;
              submitMutation.mutate({
                ...restForm,
                openingsCount: form.openingsCount ? Number(form.openingsCount) : undefined,
                salaryMin: form.salaryMin || undefined,
                salaryMax: form.salaryMax || undefined,
                skills: skillsText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                applicationDeadline: form.applicationDeadline || undefined,
              });
            },
          },
        ]}
      >
        <div className="space-y-3">
          <InputBase value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Job title" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Company name" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.jobType} onChange={(e) => setForm((p) => ({ ...p, jobType: e.target.value }))} placeholder="Job type (Full-time, Contract...)" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.openingsCount} type="number" onChange={(e) => setForm((p) => ({ ...p, openingsCount: e.target.value }))} placeholder="No. of openings" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="Country" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} placeholder="State" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <FormControl fullWidth size="small">
            <InputLabel id="work-mode">Work Mode</InputLabel>
            <Select labelId="work-mode" value={form.workMode} label="Work Mode" onChange={(e) => setForm((p) => ({ ...p, workMode: e.target.value }))}>
              <MenuItem value="WORK_FROM_OFFICE">Work from Office</MenuItem>
              <MenuItem value="WORK_FROM_HOME">Work from Home</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </Select>
          </FormControl>
          <InputBase value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Job description" multiline minRows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.responsibilities} onChange={(e) => setForm((p) => ({ ...p, responsibilities: e.target.value }))} placeholder="Responsibilities" multiline minRows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} placeholder="Requirements" multiline minRows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.benefits} onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))} placeholder="Benefits" multiline minRows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <FormControl fullWidth size="small">
            <InputLabel id="salary-type">Salary Type</InputLabel>
            <Select labelId="salary-type" value={form.salaryType} label="Salary Type" onChange={(e) => setForm((p) => ({ ...p, salaryType: e.target.value }))}>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
              <MenuItem value="YEARLY">Yearly</MenuItem>
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="RANGE">Range</MenuItem>
            </Select>
          </FormControl>
          <InputBase value={form.salaryMin} type="number" onChange={(e) => setForm((p) => ({ ...p, salaryMin: e.target.value }))} placeholder="Min salary" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.salaryMax} type="number" onChange={(e) => setForm((p) => ({ ...p, salaryMax: e.target.value }))} placeholder="Max salary" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.minimumQualification} onChange={(e) => setForm((p) => ({ ...p, minimumQualification: e.target.value }))} placeholder="Minimum qualification" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.experienceLabel} onChange={(e) => setForm((p) => ({ ...p, experienceLabel: e.target.value }))} placeholder="Experience (e.g. Fresher / 1-2 yrs)" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.skillsText} onChange={(e) => setForm((p) => ({ ...p, skillsText: e.target.value }))} placeholder="Skills comma separated (Flutter, Sales, API)" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.hrName} onChange={(e) => setForm((p) => ({ ...p, hrName: e.target.value }))} placeholder="HR Name" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.hrMobileNumber} onChange={(e) => setForm((p) => ({ ...p, hrMobileNumber: e.target.value }))} placeholder="HR Mobile Number" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="Email ID" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.companyWebsite} onChange={(e) => setForm((p) => ({ ...p, companyWebsite: e.target.value }))} placeholder="Company Website (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <InputBase value={form.applicationDeadline} type="date" onChange={(e) => setForm((p) => ({ ...p, applicationDeadline: e.target.value }))} placeholder="Last Date to Apply" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <FormControl fullWidth size="small">
            <InputLabel id="apply-type">Apply Type</InputLabel>
            <Select labelId="apply-type" value={form.applyType} label="Apply Type" onChange={(e) => setForm((p) => ({ ...p, applyType: e.target.value }))}>
              <MenuItem value="IN_APP">Apply in App</MenuItem>
              <MenuItem value="EXTERNAL_LINK">External Link</MenuItem>
            </Select>
          </FormControl>
          {form.applyType === "EXTERNAL_LINK" && (
            <InputBase value={form.applyLink} onChange={(e) => setForm((p) => ({ ...p, applyLink: e.target.value }))} placeholder="Apply Link" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          )}
          <FormControl fullWidth size="small">
            <InputLabel id="approval-status">Approval Status</InputLabel>
            <Select labelId="approval-status" value={form.approvalStatus} label="Approval Status" onChange={(e) => setForm((p) => ({ ...p, approvalStatus: e.target.value }))}>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>

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
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Featured</span>
            <Switch checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Urgent Hiring</span>
            <Switch checked={form.urgentHiring} onChange={(e) => setForm((p) => ({ ...p, urgentHiring: e.target.checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Show Salary</span>
            <Switch checked={form.salaryVisibility} onChange={(e) => setForm((p) => ({ ...p, salaryVisibility: e.target.checked }))} />
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
