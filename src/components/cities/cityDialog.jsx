import {
  Dialog,
  DialogContent,
  Switch,
  InputBase,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCities,
  fetchCitiesById,
  updateCities,
} from "../../services/cities";
import { X } from "lucide-react";

export default function CityDialog({ open, onClose, cityID }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    state: "",
    latitude: "",
    longitude: "",
    isFeatured: true,
  });

  const isEdit = Boolean(cityID);

  const { data: citiesData } = useQuery({
    queryKey: ["city-details", cityID],
    queryFn: () => fetchCitiesById(cityID),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: submitFurnishing, isPending: loader } = useMutation({
    mutationFn: isEdit
      ? (payload) => updateCities({ id: cityID, payload })
      : createCities,
    onSuccess: () => {
      if (isEdit) {
        toast.success("City updated successfully");
      } else {
        toast.success("City created successfully");
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
      code: form.code,
      state: form.state,
      longitude: form.longitude,
      latitude: form.latitude,
      isFeatured: form.isFeatured,
    };
    submitFurnishing(payload);
  };

  useEffect(() => {
    if (citiesData) {
      console.log("citiesData", citiesData);
      setForm((pre) => ({
        ...pre,
        code: citiesData.data.code,
        name: citiesData.data.name,
        state: citiesData.data.state,
        latitude: citiesData.data.latitude,
        longitude: citiesData.data.longitude,
        isFeatured: citiesData.data.isFeatured,
      }));
    }
  }, [citiesData]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit City" : "Create City"}
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
            City
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            State
          </label>
          <InputBase
            placeholder="State"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.state}
            onChange={(e) => handleChange("state", e.target.value)}
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
            Longitue
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
              checked={form.isFeatured}
              onChange={(e) => handleChange("isFeatured", e.target.checked)}
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
            {isEdit ? "Update City" : "Create City"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
