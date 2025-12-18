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
import { getPropertyCategoryApiHandler, getPropertyListApiHandler, getPropertyTypeApiHandler } from "../../services/postProperty";
import DynamicSelect from "../common/select";
import { createBhk, fetchBhkById, updateBhk } from "../../services/bhk";
import { X } from "lucide-react";

export default function BhkDialog({ open, onClose, bhdId }) {
  const [form, setForm] = useState({
    propertyType: '',
    propertyCategory: '',
    propertyList: '',
    name: "",
    code: '',
    locality: "",
    sortOrder: 1,
    address: '',
    pincode: '',
    latitude: '',
    longitude: '',
    isVerified: true
  });

  const isEdit = Boolean(bhdId);

   const { data: propertyTypeList } = useQuery({
    queryKey: ["propertyList"],
    queryFn: getPropertyListApiHandler,
    select: (data) => {
      return data.map(item => ({...item, label: item.name, value: item.id}))
    },
    staleTime: 1000 * 60 * 20,
  });

  const { data: propertyCategoryList } = useQuery({
    queryKey: ["propertyCategory"],
    queryFn: getPropertyCategoryApiHandler,
    select: (data) => {
      return data.map(item => ({...item, label: item.name, value: item.id}))
    },
    staleTime: 1000 * 60 * 20,
  });

  const { data: propertyList } = useQuery({
    queryKey: ["propertyList", form.propertyCategory?.code, form.propertyType?.code],
    queryFn: () => getPropertyTypeApiHandler({propertyListType: form.propertyType?.code, propertyCategory: form.propertyCategory?.code}),
    select: (data) => {
      return data.propertyTypes.map(item => ({...item, label: item.name, value: item.id}))
    },
    enabled: form.propertyCategory?.code && form.propertyType?.code ? true : false,
    staleTime: 1000 * 60 * 20,
  });

  const {data: bhkData} = useQuery({
    queryKey: ["bhk-details", bhdId],
    queryFn: () => fetchBhkById(bhdId),
    enabled: isEdit,
    staleTime: 0,
    refetchOnMount: true
  });

  const {mutate: submitBhk, isPending: loader} = useMutation({
    mutationFn: isEdit
      ? (payload) => updateBhk({ id: bhdId, payload })
      : createBhk,
    onSuccess: () => {
      if(isEdit){
        toast.success('Bhk updated successfully')
      }else{
        toast.success('Bhk created successfully')
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
        propertyTypeId: form.propertyList?.id ?? '',
        sortOrder: form.sortOrder,
      }
      submitBhk(payload)
  };

  useEffect(() => {
    if(bhkData){
      console.log('bhkData', bhkData)
      setForm((pre) => ({...pre, name: bhkData.data.name, code: bhkData.data.code, sortOrder: bhkData.data.sortOrder}))
    }
  },[bhkData])

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogContent className="p-6">
        

            <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
           {isEdit ? "Edit Bhk" : "Create Bhk"}
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

          <InputBase
            placeholder="Code"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />

          <DynamicSelect
              isMulti={false}
              isError={false}
              placeholder={'Select property list type'}
              onChange={(value) => {
                handleChange("propertyType", value)
                handleChange("propertyList", '')
              }}
              options={propertyTypeList ?? []}
              value={form.propertyType}
              minHeight={"50px"}
              fontwidth={'16px'}
              changeStyle={true}
            />

            <DynamicSelect
              isMulti={false}
              isError={false}
              placeholder={'Select property category'}
              onChange={(value) => {
                handleChange("propertyCategory", value)
                handleChange("propertyList", '')
              }}
              options={propertyCategoryList ?? []}
              value={form.propertyCategory}
              minHeight={"50px"}
              fontwidth={'16px'}
              changeStyle={true}
            />

            <DynamicSelect
              isMulti={false}
              isError={false}
              placeholder={'Select property type'}
              onChange={(value) => {
                handleChange("propertyList", value)
              }}
              options={propertyList ?? []}
              value={form.propertyList}
              minHeight={"50px"}
              fontwidth={'16px'}
              changeStyle={true}
            />

            <InputBase
            type="number"
            placeholder="Sort Order"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                     transition"
            value={form.sortOrder}
            onChange={(e) =>
              handleChange("sortOrder", Number(e.target.value))
            }
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
          {isEdit ? "Update Bhk" : "Create Bhk"}
        </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

