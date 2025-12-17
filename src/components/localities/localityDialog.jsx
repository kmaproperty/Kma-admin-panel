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
import { createLocality, fetchLocalityById, updateLocality } from "../../services/localities";
import { useCitySearch } from "../../hooks/useCitySearch";
import DynamicAsyncAutocomplete from "../common/dynamicAsyncSelectMui";

export default function LocalityDialog({ open, onClose, localityId }) {
  const { loadCities  } = useCitySearch();
  const [form, setForm] = useState({
    name: "",
    city: '',
    sector: "",
    latitude: '',
    longitude: '',
  });

  const isEdit = Boolean(localityId);

  const {data: localityData} = useQuery({
    queryKey: ["locality-details", localityId],
    queryFn: () => fetchLocalityById(localityId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitLocality, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updateLocality({ id: localityId, payload })
      : createLocality,
    onSuccess: () => {
      if(isEdit){
        toast.success('Locality updated successfully')
      }else{
        toast.success('Locality created successfully')
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
        city: form.city?.id ?? '',
        sector: form.sector,
        longitude: form.longitude,
        latitude: form.latitude,
      }
      submitLocality(payload)
  };

  useEffect(() => {
    if(localityData){
      console.log('localityData', localityData)
      setForm((pre) => ({...pre, sector: localityData.data.sector, name: localityData.data.name, latitude: localityData.data.latitude, longitude: localityData.data.longitude, city: localityData.data.city}))
    }
  },[localityData])

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
          {isEdit ? "Edit Locality" : "Create Locality"}
        </h2>

        <div className="space-y-4">
          <InputBase
            placeholder="Name"
            className="border p-2 rounded w-full"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <DynamicAsyncAutocomplete
            isMulti={false}
            isError={false}
            placeholder={'Search city'}
            onChange={(value) => {
              handleChange("city",value)
            }}
            loadOptions={loadCities}
            value={form.city}
            minHeight={"40px"}
          />

          <InputBase
            placeholder="Sector Name"
            className="border p-2 rounded w-full"
            value={form.sector}
            onChange={(e) => handleChange("sector", e.target.value)}
          />

          <InputBase
            placeholder="Latitude"
            type="number"
            className="border p-2 rounded w-full"
            value={form.latitude}
            onChange={(e) => handleChange("latitude", e.target.value)}
          />
          <InputBase
            placeholder="Longitude"
            type="number"
            className="border p-2 rounded w-full"
            value={form.longitude}
            onChange={(e) => handleChange("longitude", e.target.value)}
          />

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

