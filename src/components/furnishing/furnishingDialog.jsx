import {
  Dialog,
  DialogContent,
  Switch,
  InputBase,
  Button
} from "@mui/material";
import { UploadCloud, X  } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getFileUploadUrlApiHandler, uploadFileToS3ApiHandler } from "../../services/masterService";
import { toast } from "react-toastify";
import { createFurnishing, fetchFurnishingById, updateFurnishing } from "../../services/furnishing";

export default function FurnishingDialog({ open, onClose, furnishingId }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    icon: null,
    sortOrder: 1,
    isActive: true
  });

  const [preview, setPreview] = useState(null);

  const isEdit = Boolean(furnishingId);

  const {data: furnishingData} = useQuery({
    queryKey: ["furnishing-details", furnishingId],
    queryFn: () => fetchFurnishingById(furnishingId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitFurnishing, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updateFurnishing({ id: furnishingId, payload })
      : createFurnishing,
    onSuccess: () => {
      onClose(true)
      if(isEdit){
        toast.success('Furnisher updated successfully')
      }else{
        toast.success('Furnisher created successfully')
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
    }
  });

  const handleChange = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

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
    mutationFn: async (
      payload
    ) => {
      return await uploadFileToS3ApiHandler(payload);
    },
    onSuccess: (response) => {
    },
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
    mutationFn: async (
      payload
    ) => {
      return await getFileUploadUrlApiHandler(payload);
    },
    onSuccess: (response) => {
      if (response.success) {
        handleFileUpload({ url: response.data.url, file: form.icon })
      }

      let payload = {
        name: form.name,
        code: form.code,
        icon: response.data.key,
        sortOrder: form.sortOrder,
        isActive: form.isActive
      }
      submitFurnishing(payload)
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
    if(form.icon && form.icon instanceof File){
      handleGetFileUrl(
          {
            contentType: form.icon.type,
            filename: form.icon.name,
            expiresIn: 3600,
            folder: import.meta.env.VITE_AWS_FOLDER,
          })
    }else{
      let payload = {
        name: form.name,
        code: form.code,
        icon: form.icon,
        sortOrder: form.sortOrder,
        isActive: form.isActive
      }
      submitFurnishing(payload)
    }
  };

  useEffect(() => {
    if(furnishingData){
      console.log('furnishingData', furnishingData)
      setForm((pre) => ({...pre, code: furnishingData.data.code, name: furnishingData.data.name, sortOrder: furnishingData.data.sortOrder, isActive: furnishingData.data.isActive, icon: furnishingData.data.icon}))
      if(furnishingData?.data?.icon){
        setPreview(`${import.meta.env.VITE_AWS_URL}${furnishingData.data.icon}`)
      }
    }
  },[furnishingData])

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        <div className="flex justify-end w-full">
          <img
            onClick={() => {
                onClose(false)
            }}
            src="/assets/close-icon.svg"
            alt="close"
            width={24}
            height={24}
            className="cursor-pointer"
          />
        </div>
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isEdit ? "Edit Furnisher" : "Create Furnisher"}
        </h2>

        <div className="space-y-4">
          <InputBase
            placeholder="Name"
            className="border p-2 rounded w-full"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <InputBase
            placeholder="Code"
            className="border p-2 rounded w-full"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />

          {/* Upload */}
          
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-dashed border-2 rounded p-4 flex flex-col items-center cursor-pointer text-center"
            >
              <UploadCloud />
              <span className="text-sm mt-1">
                Drag & Drop or Click to Upload
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </label>
          
            {preview && <div className="relative w-24 h-24 mx-auto">
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover rounded"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>}

          <InputBase
            type="number"
            placeholder="Sort Order"
            className="border p-2 rounded w-full"
            value={form.sortOrder}
            onChange={(e) =>
              handleChange("sortOrder", Number(e.target.value))
            }
          />

          <div className="flex items-center justify-between">
            <span>Is Active</span>
            <Switch
              checked={form.isActive}
              onChange={(e) =>
                handleChange("isActive", e.target.checked)
              }
            />
          </div>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loader}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

