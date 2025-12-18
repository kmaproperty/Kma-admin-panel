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
  createLocality,
  fetchLocalityById,
  updateLocality,
} from "../../services/localities";
import { useCitySearch } from "../../hooks/useCitySearch";
import DynamicAsyncAutocomplete from "../common/dynamicAsyncSelectMui";
import { X } from "lucide-react";

export default function LocalityDialog({ open, onClose, localityId }) {
  const { loadCities } = useCitySearch();
  const [form, setForm] = useState({
    name: "",
    city: "",
    sector: "",
    latitude: "",
    longitude: "",
  });

  const isEdit = Boolean(localityId);

  const { data: localityData } = useQuery({
    queryKey: ["locality-details", localityId],
    queryFn: () => fetchLocalityById(localityId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: submitLocality, isPending: loader } = useMutation({
    mutationFn: isEdit
      ? (payload) => updateLocality({ id: localityId, payload })
      : createLocality,
    onSuccess: () => {
      if (isEdit) {
        toast.success("Locality updated successfully");
      } else {
        toast.success("Locality created successfully");
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
      city: form.city?.id ?? "",
      sector: form.sector,
      longitude: form.longitude,
      latitude: form.latitude,
    };
    submitLocality(payload);
  };

  useEffect(() => {
    if (localityData) {
      console.log("localityData", localityData);
      setForm((pre) => ({
        ...pre,
        sector: localityData.data.sector,
        name: localityData.data.name,
        latitude: localityData.data.latitude,
        longitude: localityData.data.longitude,
        city: localityData.data.city,
      }));
    }
  }, [localityData]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit Locality" : "Create Locality"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <InputBase
            placeholder="Name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <DynamicAsyncAutocomplete
            isMulti={false}
            isError={false}
            placeholder={"Search city"}
            onChange={(value) => {
              handleChange("city", value);
            }}
            loadOptions={loadCities}
            value={form.city}
            minHeight={"38px"}
            changeStyle={true}
          />

          <InputBase
            placeholder="Sector Name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.sector}
            onChange={(e) => handleChange("sector", e.target.value)}
          />

          <InputBase
            placeholder="Latitude"
            type="number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.latitude}
            onChange={(e) => handleChange("latitude", e.target.value)}
          />
          <InputBase
            placeholder="Longitude"
            type="number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.longitude}
            onChange={(e) => handleChange("longitude", e.target.value)}
          />

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
            {isEdit ? "Update Locality" : "Create Locality"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
