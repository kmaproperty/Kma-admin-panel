import {
  Dialog,
  DialogContent,
  Switch,
  InputBase,
  Button,
} from "@mui/material";
import { UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getFileUploadUrlApiHandler,
  uploadFileToS3ApiHandler,
} from "../../services/masterService";
import { toast } from "react-toastify";
import {
  createFurnishing,
  fetchFurnishingById,
  updateFurnishing,
} from "../../services/furnishing";

export default function FurnishingDialog({ open, onClose, furnishingId }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    icon: null,
    sortOrder: 1,
    isActive: true,
  });

  const [preview, setPreview] = useState(null);

  const isEdit = Boolean(furnishingId);

  const { data: furnishingData } = useQuery({
    queryKey: ["furnishing-details", furnishingId],
    queryFn: () => fetchFurnishingById(furnishingId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: submitFurnishing, isPending: loader } = useMutation({
    mutationFn: isEdit
      ? (payload) => updateFurnishing({ id: furnishingId, payload })
      : createFurnishing,
    onSuccess: () => {
      onClose(true);
      if (isEdit) {
        toast.success("Furnisher updated successfully");
      } else {
        toast.success("Furnisher created successfully");
      }
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

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleFile = (file) => {
    if (!file) return;
    setForm((p) => ({ ...p, icon: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    setForm((p) => ({ ...p, icon: null }));
    setPreview(null);
  };

  const { mutate: handleFileUpload } = useMutation({
    mutationFn: async (payload) => {
      return await uploadFileToS3ApiHandler(payload);
    },
    onSuccess: (response) => {},
    onError: (error) => {
      console.log("file upload s3 api", error);
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { mutate: handleGetFileUrl, isPending: ownerLoader } = useMutation({
    mutationFn: async (payload) => {
      return await getFileUploadUrlApiHandler(payload);
    },
    onSuccess: (response) => {
      if (response.success) {
        handleFileUpload({ url: response.data.url, file: form.icon });
      }

      let payload = {
        name: form.name,
        code: form.code,
        icon: response.data.key,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      submitFurnishing(payload);
    },
    onError: (error) => {
      console.log("get file url api", error);
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleSubmit = () => {
    if (form.icon && form.icon instanceof File) {
      handleGetFileUrl({
        contentType: form.icon.type,
        filename: form.icon.name,
        expiresIn: 3600,
        folder: import.meta.env.VITE_AWS_FOLDER,
      });
    } else {
      let payload = {
        name: form.name,
        code: form.code,
        icon: form.icon,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      submitFurnishing(payload);
    }
  };

  useEffect(() => {
    if (furnishingData) {
      console.log("furnishingData", furnishingData);
      setForm((pre) => ({
        ...pre,
        code: furnishingData.data.code,
        name: furnishingData.data.name,
        sortOrder: furnishingData.data.sortOrder,
        isActive: furnishingData.data.isActive,
        icon: furnishingData.data.icon,
      }));
      if (furnishingData?.data?.icon) {
        setPreview(
          `${import.meta.env.VITE_AWS_URL}${furnishingData.data.icon}`
        );
      }
    }
  }, [furnishingData]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit Furnisher" : "Create Furnisher"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">
            Furnisher Name
          </label>
          <InputBase
            placeholder="Name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Code
          </label>
          <InputBase
            placeholder="Code"
            className="w-full rounded-lg border border-gray-300 px-3 py-2m mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="group border-2 border-dashed border-gray-300
                     rounded-xl p-6 flex flex-col items-center
                     cursor-pointer text-center
                     hover:border-indigo-500 hover:bg-indigo-50
                     transition"
          >
            <UploadCloud className="text-gray-400 group-hover:text-indigo-600" />
            <span className="text-sm text-gray-600 mt-2">
              Drag & drop or click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>

          {preview && (
            <div className="relative w-24 h-24 mx-auto">
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover rounded-lg rounded"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

<label className="text-sm font-semibold text-gray-700">
            Sort Order
          </label>
          <InputBase
            type="number"
            placeholder="Sort Order"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            value={form.sortOrder}
            onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Is Active</span>
            <Switch
              checked={form.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loader}
            type="button"
            className="w-full bg-indigo-600 text-white py-2.5
                     rounded-lg font-medium cursor-pointer
                     hover:bg-indigo-700
                     disabled:opacity-60
                     transition"
          >
            {isEdit ? "Update Furnisher" : "Create Furnisher"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
