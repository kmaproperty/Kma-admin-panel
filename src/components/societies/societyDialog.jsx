import {
  Dialog,
  DialogContent,
  Switch,
  InputBase,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createSociety,
  fetchSocietyById,
  updateSociety,
} from "../../services/socities";
import { X } from "lucide-react";

export default function SocietyDialog({ open, onClose, societyId }) {
  const [form, setForm] = useState({
    name: "",
    locality: "",
    address: "",
    pincode: "",
    latitude: "",
    longitude: "",
    isVerified: true,
  });

  const isEdit = Boolean(societyId);

  const { data: societyData } = useQuery({
    queryKey: ["society-details", societyId],
    queryFn: () => fetchSocietyById(societyId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: submitSociety, isPending: loader } = useMutation({
    mutationFn: isEdit
      ? (payload) => updateSociety({ id: societyId, payload })
      : createSociety,
    onSuccess: () => {
      if (isEdit) {
        toast.success("Society updated successfully");
      } else {
        toast.success("Society created successfully");
      }
      onClose(true);
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

  const handleSubmit = () => {
    let payload = {
      name: form.name,
      locality: form.locality,
      address: form.address,
      pincode: form.pincode,
      longitude: form.longitude,
      latitude: form.latitude,
      isVerified: form.isFeatured,
    };
    submitSociety(payload);
  };

  useEffect(() => {
    if (societyData) {
      console.log("societyData", societyData);
      setForm((pre) => ({
        ...pre,
        locality: societyData.data.locality,
        name: societyData.data.name,
        address: societyData.data.address,
        pincode: societyData.data.pincode,
        latitude: societyData.data.latitude,
        longitude: societyData.data.longitude,
        isVerified: societyData.data.isVerified,
      }));
    }
  }, [societyData]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit Society" : "Create Society"}
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
            Society Name
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
            Locality Name
          </label>
          <InputBase
            placeholder="Locality Name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.locality}
            onChange={(e) => handleChange("locality", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Address
          </label>
          <InputBase
            placeholder="Address"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Pincode
          </label>
          <InputBase
            placeholder="Pincode"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Latitude
          </label>
          <InputBase
            placeholder="Latitude"
            type="number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.latitude}
            onChange={(e) => handleChange("latitude", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Longitude
          </label>
          <InputBase
            placeholder="Longitude"
            type="number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.longitude}
            onChange={(e) => handleChange("longitude", e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Is Featured
            </span>
            <Switch
              checked={form.isVerified}
              onChange={(e) => handleChange("isVerified", e.target.checked)}
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
            {isEdit ? "Update Society" : "Create Society"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
