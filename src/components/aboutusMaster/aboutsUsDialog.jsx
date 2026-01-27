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
import { createAboutusmasterConfiguration, fetchAboutus, updateAboutusmasterConfiguration } from "../../services/aboutUsMaster";

export default function AboutsusDialog({ open, onClose, aboutusId }) {
  const [form, setForm] = useState({
    mobileAppAvailable: false,
    description: '',
    phoneNumber: "",
    email: '',
    address: '',
    latitude: "",
    longitude: "",
    instagramLink: '',
    fbLink: '',
    youtubeLink: '',
    twitterLink: '',
  });

  const isEdit = Boolean(aboutusId);

  const { data: aboutsUdData } = useQuery({
    queryKey: ["locality-details",],
    queryFn: () => fetchAboutus(),
    select: (response) => {
      return response.data
    },
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: submitAboutus, isPending: loader } = useMutation({
    mutationFn: isEdit
      ? (payload) => updateAboutusmasterConfiguration(payload)
      : createAboutusmasterConfiguration,
    onSuccess: () => {
      if (isEdit) {
        toast.success("About us updated successfully");
      } else {
        toast.success("About us created successfully");
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
       mobileAppAvailable: form.mobileAppAvailable,
      description: form.description,
      phoneNumber: form.phoneNumber,
      email: form.email,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      instagramLink: form.instagramLink,
      fbLink: form.fbLink,
      youtubeLink: form.youtubeLink,
      twitterLink: form.twitterLink,
    };
    submitAboutus({id:aboutusId, payload});
  };

  useEffect(() => {
    if (aboutsUdData) {
      console.log("aboutsUdData", aboutsUdData);
      setForm((pre) => ({
        ...pre,
        mobileAppAvailable: aboutsUdData.mobileAppAvailable,
        description: aboutsUdData.description,
        phoneNumber: aboutsUdData.phoneNumber,
        email: aboutsUdData.email,
        address: aboutsUdData.address,
        latitude: aboutsUdData.latitude,
        longitude: aboutsUdData.longitude,
        instagramLink: aboutsUdData.instagramLink,
        fbLink: aboutsUdData.fbLink,
        youtubeLink: aboutsUdData.youtubeLink,
        twitterLink: aboutsUdData.twitterLink,
      }));
    }
  }, [aboutsUdData]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit" : "Create"}
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
            Phone Number
          </label>
          <InputBase
            placeholder="Phone Number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Email
          </label>
          <InputBase
            placeholder="Email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

            <label className="text-sm font-semibold text-gray-700">
            Description
          </label>
          <InputBase
            placeholder="Description"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
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

          <label className="text-sm font-semibold text-gray-700">
            Instagram Link
          </label>
          <InputBase
            placeholder="Instagram Link"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.instagramLink}
            onChange={(e) => handleChange("instagramLink", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Facebook Link
          </label>
          <InputBase
            placeholder="Facebook Link"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.fbLink}
            onChange={(e) => handleChange("fbLink", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Youtube Link
          </label>
          <InputBase
            placeholder="Youtube Link"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.youtubeLink}
            onChange={(e) => handleChange("youtubeLink", e.target.value)}
          />

          <label className="text-sm font-semibold text-gray-700">
            Twitter Link
          </label>
          <InputBase
            placeholder="Twitter Link"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mt-1
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.twitterLink}
            onChange={(e) => handleChange("twitterLink", e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Is Mobile Application
            </span>
            <Switch
              checked={form.mobileAppAvailable}
              onChange={(e) => handleChange("mobileAppAvailable", e.target.checked)}
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
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
