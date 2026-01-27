import {
  Dialog,
  DialogContent,
  Switch,
  InputBase,
  Button
} from "@mui/material";
import { X  } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPropertyPhotoType, fetchPropertyPhotoTypeById, updatePropertyPhotoType } from "../../services/amenities";
import { toast } from "react-toastify";

export default function PropertyPhotoDialog({ open, onClose, typeId }) {
  const [form, setForm] = useState({
    name: "",
    sortOrder: 1,
    isActive: true
  });

  const isEdit = Boolean(typeId);

  const {data: phtoTypeData} = useQuery({
    queryKey: ["amenity-details", typeId],
    queryFn: () => fetchPropertyPhotoTypeById(typeId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitPropertyPhotoType, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updatePropertyPhotoType({ id: typeId, payload })
      : createPropertyPhotoType,
    onSuccess: () => {
      onClose(true)
      if(isEdit){
        toast.success('Property Photo Type updated successfully')
      }else{
        toast.success('Property Photo Type created successfully')
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

  
  const handleSubmit = () => {
    let payload = {
        name: form.name,
        displayOrder: form.sortOrder,
        isActive: form.isActive
      }
      submitPropertyPhotoType(payload)
  };

  useEffect(() => {
    if(phtoTypeData){
      setForm((pre) => ({...pre, name: phtoTypeData.data.name, displayOrder: phtoTypeData.data.displayOrder, isActive: phtoTypeData.data.isActive}))
    }
  },[phtoTypeData])

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
  <DialogContent className="p-0">
    <div className="">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit Property Photo Type" : "Create Property Photo Type"}
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
        <label className="text-sm font-semibold text-gray-700">
          Property Photo Type Name
        </label>
        <InputBase
          placeholder="Name"
          label='Name'
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
        />

        

        {/* Sort Order */}
        <label className="text-sm font-semibold text-gray-700">
          Display Order
        </label>
        <InputBase
          type="number"
          placeholder="Display Order"
          value={form.sortOrder}
          onChange={(e) =>
            handleChange("sortOrder", Number(e.target.value))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
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
          {isEdit ? "Update Property Photo Type" : "Create Property Photo Type"}
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>

  );
}

