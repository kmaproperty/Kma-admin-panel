import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { format, parseISO } from "date-fns";
import PageTitle from "../../components/common/layout/PageTitle";
import TextField from "../../components/common/TextField";
import MainWrapper from "../../components/common/layout/mainWrapper";
import {
  addPartnerCodeApiHandler,
  editPartnerApiHandler,
  editPartnerCodeApiHandler,
  getPartnerCodeApiHandler,
} from "../../services/channelPartnerService";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPartnerApiHandler } from "../../services/channelPartnerService";
import DynamicSelectController from "../../components/common/select/controlledSelect";
import ControlledDatePicker from "../../components/common/datePicker/ControlledDatePicker";
import { getCityApiHandler } from "../../services/masterService";
import DynamicAsyncAutocompleteController from "../../components/common/select/asyncControlledSelect";
import { useCitySearch } from "../../hooks/useCitySearch";
import ApproveRejectProfilePhoto from "../../components/common/approveRejectProfilePhoto";

const AddEditChannelPartner = () => {
  const { loadCities } = useCitySearch("name");
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [kycDetails, setKycDetails] = useState(null)
  const [approvePopup, setApprovePopup] = useState(false)
  const [popupType, setPopupType] = useState('')
  const navigate = useNavigate();

  const messageSchema = yup.object({
    name: yup.string().required("Please enter name"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Please enter email"),
    firmName: yup.string().required("Please enter First name"),
    cities: yup.array().min(1, "Please select at least one city").required(),
    businessSince: yup.date().nullable(),
    aboutYourSelf: yup.string(),
    phoneVerified: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.boolean().required(),
      })
      .required(),
    isActive: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.boolean().required(),
      })
      .required(),
  });

  const { handleSubmit, control, setValue, reset, watch } = useForm({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      phoneVerified: {
        label: "Yes",
        value: true,
      },
      isActive: {
        label: "Yes",
        value: true,
      },
    },
  });

  const { data: channelPartnerData } = useQuery({
    queryKey: ["partner-details", params.id, "CHANNEL_PARTNER"],
    queryFn: () => {
      return getPartnerApiHandler(params.id);
    },
    Loadingd: isLoading,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: citiesData } = useQuery({
    queryKey: ["cities", params.id, "CITIES"],
    queryFn: () => {
      return getCityApiHandler(params.id);
    },
    Loadingd: isLoading,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: editPartner } = useMutation({
    mutationFn: editPartnerApiHandler,
    onSuccess: (res) => {
      toast.success("Channel Partner Updated Successfully");
      navigate("/channel-partners");
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

  const onSubmit = async (data) => {
    console.log(data.businessSince);
    setIsSubmitting(true);
    const payload = {
      ...data,
      isActive: data.isActive.value,
      phoneVerified: data.phoneVerified.value,
      cities: data.cities.map((city) => city.value).join(","),
      businessSince: data.businessSince
        ? format(data.businessSince, "yyyy-MM-dd")
        : null,
      // ...(params?.id && { id: params.id })
    };
    try {
      editPartner({ payload, id: params?.id });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (channelPartnerData) {
      const cities = channelPartnerData?.data?.cities
        ?.split(",")
        .map((city) => {
          return { label: city.trim(), value: city.trim() };
        });
      setValue("cities", cities || []);
      setValue("name", channelPartnerData.data.name || "");
      setValue("email", channelPartnerData.data.email || "");
      setValue("firmName", channelPartnerData.data.firmName || "");
      setValue(
        "businessSince",
        channelPartnerData.data.businessSince
          ? new Date(channelPartnerData.data.businessSince)
          : null
      );
      setValue("aboutYourSelf", channelPartnerData.data.aboutYourSelf || "");
      setValue(
        "isActive",
        channelPartnerData.data.isActive
          ? { label: "Yes", value: true }
          : { label: "No", value: false } || true
      );
      setValue(
        "phoneVerified",
        channelPartnerData.data.phoneVerified
          ? { label: "Yes", value: true }
          : { label: "No", value: false } || true
      );

      setKycDetails({
        ...channelPartnerData.data.kyc_status,
        bankDetails: channelPartnerData.data.bank_details
      })
    }
  }, [channelPartnerData]);
console.log('kycDetails?.step1_live_photo?.live_photo_url', kycDetails)
  useEffect(() => {
    console.log(citiesData);
    if (citiesData?.data.length) {
      setCities(
        citiesData.data.map((city) => {
          return { value: city, label: city };
        })
      );
    }
  }, [citiesData]);

  const imageUrl = import.meta.env.VITE_AWS_URL

  const closePopup = () => {
    setApprovePopup(false)
    setPopupType('')
  }

  return (
    <MainWrapper>
      {isLoading ? (
        <div
          className="w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          <PageTitle title={`Edit Channel Partner`} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-gray-50 w-[70%] px-5 py-4 rounded-lg space-y-3">
              <div className="flex items-center gap-6">
                <div className="mb-3 w-[48%]">
                  <TextField
                    control={control}
                    name="name"
                    label="Name"
                    placeHolder="Enter name"
                  />
                </div>
                <div className="mb-3 w-[48%]">
                  <TextField
                    control={control}
                    name="email"
                    label="Email"
                    placeHolder="Enter email"
                    type="email"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="mb-3 w-[48%]">
                  <TextField
                    control={control}
                    name="firmName"
                    label="First Name"
                    placeHolder="Enter firm name"
                  />
                </div>
                <div className="mb-3 w-[48%]">
                  {/* <DynamicSelectController
                                                name="cities"
                                                control={control}
                                                options={cities}
                                                label="Cities"
                                                isMulti
                                                placeholder="Select cities"
                                                rules={{ required: "City is required" }}
                                            /> */}
                  <label className="text-sm font-semibold text-gray-700">
                    Select cities
                  </label>
                  <DynamicAsyncAutocompleteController
                    name="cities"
                    control={control}
                    isMulti={true}
                    isError={false}
                    placeholder={"Search city"}
                    loadOptions={loadCities}
                    minHeight={"34px"}
                    changeStyle={true}
                    rules={{ required: "City is required!" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="mb-3 w-[48%]">
                  <ControlledDatePicker
                    name="businessSince"
                    control={control}
                    label="Business Since"
                    rules={{ required: "Business Since is required" }}
                    disableFuture
                  />
                </div>
                <div className="mb-3 w-[48%]">
                  <TextField
                    control={control}
                    name="aboutYourSelf"
                    label="About YourSelf"
                    placeHolder="Explain about yourself"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="mb-3 w-[48%]">
                  <DynamicSelectController
                    name="isActive"
                    control={control}
                    options={[
                      {
                        label: "Yes",
                        value: true,
                      },
                      {
                        label: "No",
                        value: false,
                      },
                    ]}
                    label="Is Active"
                    placeholder="Is Active"
                    rules={{ required: "This field is required" }}
                  />
                </div>
                <div className="mb-3 w-[48%]">
                  <DynamicSelectController
                    name="phoneVerified"
                    control={control}
                    options={[
                      {
                        label: "Yes",
                        value: true,
                      },
                      {
                        label: "No",
                        value: false,
                      },
                    ]}
                    label="Is Phone Verified"
                    placeholder="Is Phone Verified"
                    rules={{ required: "This field is required" }}
                  />
                </div>
              </div>
              <div className="mt-4 rounded flex gap-2 justify-end">
                <button
                  type="submit"
                  className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-white rounded-md bg-gray-800"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
                <Link to="/channel-partners/">
                  <button className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-gray-700 rounded-md bg-gray-300">
                    Cancel
                  </button>
                </Link>
              </div>
            </div>
          </form>
          {kycDetails?.step1_live_photo?.live_photo_url && <div className="mt-3">
                <p className="text-base font-semibold">Profile Photo Approve</p>

                <div className="flex flex-col items-center gap-3">
                <img
                    src={imageUrl + kycDetails?.step1_live_photo?.live_photo_url}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-xl border"
                />
                </div>
                <div className="mt-4 rounded flex gap-2 justify-end">
                <button
                    onClick={() => {
                        setApprovePopup(true)
                        setPopupType('approve')
                    }}
                  type="button"
                  className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-white rounded-md bg-gray-800"
                  disabled={isSubmitting}
                >
                  Approve
                </button>
                
                  <button onClick={() => {
                    setApprovePopup(true)
                        setPopupType('reject')
                  }} type="button" className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-gray-700 rounded-md bg-gray-300">
                    Reject  
                  </button>
                
              </div>
          </div>}

          {kycDetails?.bankDetails &&
            <div className="mt-3">
              <p className="text-base font-semibold">Bank Details</p>

              <div className="flex  gap-3 py-2">
                <p>Account Holder Name:</p>
                <p>{kycDetails?.bankDetails?.account_holder_name}</p>
              </div>
              <div className="flex  gap-3 py-2">
                <p>Account Number:</p>
                <p>{kycDetails?.bankDetails?.account_number}</p>
              </div>
              <div className="flex  gap-3 py-2">
                <p>Bank Name:</p>
                <p>{kycDetails?.bankDetails?.bank_name}</p>
              </div>
              <div className="flex  gap-3 py-2">
                <p>IFSC Number:</p>
                <p>{kycDetails?.bankDetails?.ifsc_code}</p>
              </div>
            </div>
          }

          {kycDetails?.step2_aadhaar?.aadhaar_verified &&
            <div className="mt-3">
              <p className="text-base font-semibold">Aadhar Details</p>

              <div className="flex  gap-3 py-2">
                <p>Aadhar Card Number:</p>
                <p>{kycDetails?.step2_aadhaar?.aadhaar_number}</p>
              </div>
            </div>
          }
        </>
      )}
            <ApproveRejectProfilePhoto open={approvePopup} popupType={popupType} onClose={closePopup} userId={params.id} />
    </MainWrapper>
  );
};

export default AddEditChannelPartner;
