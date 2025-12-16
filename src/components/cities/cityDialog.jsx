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
import { createCities, fetchCitiesById, updateCities } from "../../services/cities";

export default function CityDialog({ open, onClose, cityID }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    state: '',
    latitude: '',
    longitude: '',
    isFeatured: true
  });

  const isEdit = Boolean(cityID);

  const {data: citiesData} = useQuery({
    queryKey: ["city-details", cityID],
    queryFn: () => fetchCitiesById(cityID),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitFurnishing, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updateCities({ id: cityID, payload })
      : createCities,
    onSuccess: () => {
      if(isEdit){
        toast.success('City updated successfully')
      }else{
        toast.success('City created successfully')
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
        code: form.code,
        state: form.state,
        longitude: form.longitude,
        latitude: form.latitude,
        isFeatured: form.isFeatured
      }
      submitFurnishing(payload)
  };

  useEffect(() => {
    if(citiesData){
      console.log('citiesData', citiesData)
      setForm((pre) => ({...pre, code: citiesData.data.code, name: citiesData.data.name, state: citiesData.data.state, latitude: citiesData.data.latitude, longitude: citiesData.data.longitude, isFeatured: citiesData.data.isFeatured}))
    }
  },[citiesData])

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

          <InputBase
            placeholder="State"
            className="border p-2 rounded w-full"
            value={form.state}
            onChange={(e) => handleChange("state", e.target.value)}
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
              checked={form.isFeatured}
              onChange={(e) =>
                handleChange("isFeatured", e.target.checked)
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

