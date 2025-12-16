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
      toast.success('Amenity added successfully')
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
      toast.dismiss(toastRef.current);
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
      toast.dismiss(toastRef.current);
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
    if(form.icon && typeof form.icon == File){
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
          {isEdit ? "Edit Amenity" : "Create Amenity"}
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

