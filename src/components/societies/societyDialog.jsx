import {
  Dialog,
  DialogContent,
  Switch,
  InputBase,
  Button
} from "@mui/material";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createSociety, fetchSocietyById, updateSociety } from "../../services/socities";

export default function SocietyDialog({ open, onClose, societyId }) {
  const [form, setForm] = useState({
    name: "",
    locality: "",
    address: '',
    pincode: '',
    latitude: '',
    longitude: '',
    isVerified: true
  });

  const isEdit = Boolean(societyId);

  const {data: societyData} = useQuery({
    queryKey: ["society-details", societyId],
    queryFn: () => fetchSocietyById(societyId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitSociety, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updateSociety({ id: societyId, payload })
      : createSociety,
    onSuccess: () => {
      if(isEdit){
        toast.success('Society updated successfully')
      }else{
        toast.success('Society created successfully')
      }
      onClose(true)
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
        locality: form.locality,
        address: form.address,
        pincode:form.pincode,
        longitude: form.longitude,
        latitude: form.latitude,
        isVerified: form.isFeatured
      }
      submitSociety(payload)
  };

  useEffect(() => {
    if(societyData){
      console.log('societyData', societyData)
      setForm((pre) => ({...pre, locality: societyData.data.locality, name: societyData.data.name, address: societyData.data.address,pincode: societyData.data.pincode, latitude: societyData.data.latitude, longitude: societyData.data.longitude, isVerified: societyData.data.isVerified}))
    }
  },[societyData])

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
          {isEdit ? "Edit Society" : "Create Society"}
        </h2>

        <div className="space-y-4">
          <InputBase
            placeholder="Name"
            className="border p-2 rounded w-full"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <InputBase
            placeholder="Locality Name"
            className="border p-2 rounded w-full"
            value={form.locality}
            onChange={(e) => handleChange("locality", e.target.value)}
          />

          <InputBase
            placeholder="Address"
            className="border p-2 rounded w-full"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <InputBase
            placeholder="Pincode"
            className="border p-2 rounded w-full"
            value={form.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
          />

          <InputBase
            placeholder="Latitude"
            className="border p-2 rounded w-full"
            value={form.latitude}
            onChange={(e) => handleChange("latitude", e.target.value)}
          />
          <InputBase
            placeholder="Longitude"
            className="border p-2 rounded w-full"
            value={form.longitude}
            onChange={(e) => handleChange("longitude", e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span>Is Featured</span>
            <Switch
              checked={form.isVerified}
              onChange={(e) =>
                handleChange("isVerified", e.target.checked)
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

