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
            placeholder="Code"
            className="border p-2 rounded w-full"
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
              minHeight={"40px"}
              fontwidth={'16px'}
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
              minHeight={"40px"}
              fontwidth={'16px'}
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
              minHeight={"40px"}
              fontwidth={'16px'}
            />

            <InputBase
            type="number"
            placeholder="Sort Order"
            className="border p-2 rounded w-full"
            value={form.sortOrder}
            onChange={(e) =>
              handleChange("sortOrder", Number(e.target.value))
            }
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

