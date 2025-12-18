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
import { createAmenity, fetchAmenityById, updateAmenity } from "../../services/amenities";
import { getFileUploadUrlApiHandler, uploadFileToS3ApiHandler } from "../../services/masterService";
import { toast } from "react-toastify";

export default function AmenityDialog({ open, onClose, amenityId }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    icon: null,
    sortOrder: 1,
    isActive: true
  });

  const [preview, setPreview] = useState(null);

  const isEdit = Boolean(amenityId);

  const {data: amenityData} = useQuery({
    queryKey: ["amenity-details", amenityId],
    queryFn: () => fetchAmenityById(amenityId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitAmenity, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updateAmenity({ id: amenityId, payload })
      : createAmenity,
    onSuccess: () => {
      onClose(true)
      if(isEdit){
        toast.success('Amenity updated successfully')
      }else{
        toast.success('Amenity created successfully')
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
      submitAmenity(payload)
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
    // submitAmenity()
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
      submitAmenity(payload)
    }
  };

  useEffect(() => {
    if(amenityData){
      console.log('amenityData', amenityData)
      setForm((pre) => ({...pre, code: amenityData.data.code, name: amenityData.data.name, sortOrder: amenityData.data.sortOrder, isActive: amenityData.data.isActive, icon: amenityData.data.icon}))
      if(amenityData?.data?.icon){
        setPreview(`${import.meta.env.VITE_AWS_URL}${amenityData.data.icon}`)
      }
    }
  },[amenityData])

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
  <DialogContent className="p-0">
    <div className="">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit Amenity" : "Create Amenity"}
        </h2>
        <button
          onClick={() => onClose(false)}
          className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <InputBase
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
        />

        {/* Code */}
        <InputBase
          placeholder="Code"
          value={form.code}
          onChange={(e) => handleChange("code", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
        />

        {/* Upload Area */}
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

        {/* Preview */}
        {preview && (
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500
                         text-white rounded-full p-1 shadow"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Sort Order */}
        <InputBase
          type="number"
          placeholder="Sort Order"
          value={form.sortOrder}
          onChange={(e) =>
            handleChange("sortOrder", Number(e.target.value))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Is Active
          </span>
          <Switch
            checked={form.isActive}
            onChange={(e) =>
              handleChange("isActive", e.target.checked)
            }
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
          {isEdit ? "Update Amenity" : "Create Amenity"}
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>

  );
}

