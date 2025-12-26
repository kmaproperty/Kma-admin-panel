import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { format, parseISO } from 'date-fns';
import PageTitle from '../../components/common/layout/PageTitle';
import TextField from '../../components/common/TextField';
import MainWrapper from '../../components/common/layout/mainWrapper';
import { addPartnerCodeApiHandler, editPartnerApiHandler, editPartnerCodeApiHandler, getPartnerCodeApiHandler } from '../../services/channelPartnerService';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getPartnerApiHandler } from '../../services/channelPartnerService';
import DynamicSelectController from '../../components/common/select/controlledSelect';
import ControlledDatePicker from '../../components/common/datePicker/ControlledDatePicker';
import { getCityApiHandler } from '../../services/masterService';

const AddEditOwner = () => {
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const navigate = useNavigate();

    const messageSchema = yup.object({
        name: yup.string().required('Please enter name'),
        email: yup.string().email('Invalid email format').required('Please enter email'),
        firmName: yup.string().required('Please enter First name'),
        cities: yup.array().min(1, 'Please select at least one city').required(),
        aboutYourSelf: yup.string(),
        phoneVerified: yup.object().shape({
            label: yup.string().required(),
            value: yup.boolean().required()
        }).required(),
        isActive: yup.object().shape({
            label: yup.string().required(),
            value: yup.boolean().required()
        }).required(),
    });

    const {
        handleSubmit,
        control,
        setValue,
        reset,
        watch
    } = useForm({
        resolver: yupResolver(messageSchema),
        defaultValues: {
            phoneVerified: {
                label: "Yes",
                value: true
            },
            isActive: {
                label: "Yes",
                value: true
            }
        }
    });

    const {
        data: channelPartnerData,
    } = useQuery({
        queryKey: ["partner-details", params.id, "CHANNEL_PARTNER"],
        queryFn: () => {
            return getPartnerApiHandler(params.id);
        },
        Loadingd: isLoading,
        staleTime: 0,
        refetchOnMount: true
    });
    const {
        data: citiesData,
    } = useQuery({
        queryKey: ["cities", params.id, "CITIES"],
        queryFn: () => {
            return getCityApiHandler(params.id);
        },
        Loadingd: isLoading,
        staleTime: 0,
        refetchOnMount: true
    });

    const { mutate: editPartner } = useMutation({
        mutationFn: editPartnerApiHandler,
        onSuccess: (res) => {
            toast.success("Channel Partner Updated Successfully");
            navigate("/owners");
        },
        onError: (error) => {
            if (Array.isArray(error.message)) {
                error.message.map((item) => {
                    toast.error(item)
                })
            } else {
                toast.error(error.message)
            }
        }
    })

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const payload = {
            ...data,
            isActive: data.isActive.value,
            phoneVerified: data.phoneVerified.value,
            cities: data.cities.map((city) => city.value).join(","),
            businessSince: data.businessSince ? format(data.businessSince, "yyyy-MM-dd") : null,
            // ...(params?.id && { id: params.id })
        };
        try {
            editPartner({ payload, id: params?.id });
        } catch (err) {
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (channelPartnerData) {
            const cities = channelPartnerData?.data?.cities?.split(",").map((city) => {
                return { value: city, label: city }
            })
            setValue("cities", cities || [])
            setValue("name", channelPartnerData.data.name || "")
            setValue("email", channelPartnerData.data.email || "")
            setValue("firmName", channelPartnerData.data.firmName || "")
            setValue("businessSince", channelPartnerData.data.businessSince ? new Date(channelPartnerData.data.businessSince) : null)
            setValue("aboutYourSelf", channelPartnerData.data.aboutYourSelf || "")
            setValue("isActive", channelPartnerData.data.isActive ? {label: "Yes",value: true} : {label: "No",value: false} || true)
            setValue("phoneVerified", channelPartnerData.data.phoneVerified ? {label: "Yes",value: true} : {label: "No",value: false} || true)
        }
    }, [channelPartnerData])

    useEffect(() => {
        console.log(citiesData)
        if (citiesData?.data.length) {
            setCities(citiesData.data.map((city) => {
                return { value: city, label: city }
            }))
        }
    }, [citiesData])

    useEffect(() => {
        console.log(watch("cities"))
    }, [watch("cities")])

    return (
        <MainWrapper>
            {
                isLoading
                    ? (
                        <div className='w-100 h-100 d-flex align-items-center justify-content-center' style={{ background: "rgba(255,255,255,0.1)" }}>
                            <CircularProgress />
                        </div>
                    )
                    : (
                        <>
                            <PageTitle title={`Edit Owner`} />
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='bg-gray-50 w-[70%] px-5 py-4 rounded-lg space-y-3'>
                                    <div className='flex items-center gap-6'>
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
                                    <div className='flex items-center gap-6'>
                                        <div className="mb-3 w-[48%]">
                                            <TextField
                                                control={control}
                                                name="firmName"
                                                label="First Name"
                                                placeHolder="Enter firm name"
                                            />
                                        </div>
                                        <div className="mb-3 w-[48%]">
                                            <DynamicSelectController
                                                name="cities"
                                                control={control}
                                                options={cities}
                                                label="Cities"
                                                isMulti
                                                placeholder="Select cities"
                                                rules={{ required: "City is required" }}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-6'>
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
                                    <div className='flex items-center gap-6'>
                                        <div className="mb-3 w-[48%]">
                                            <DynamicSelectController
                                                name="isActive"
                                                control={control}
                                                options={[{
                                                    label: "Yes",
                                                    value: true
                                                }, {
                                                    label: "No",
                                                    value: false
                                                }
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
                                                options={[{
                                                    label: "Yes",
                                                    value: true
                                                }, {
                                                    label: "No",
                                                    value: false
                                                }
                                                ]}
                                                label="Is Phone Verified"
                                                placeholder="Is Phone Verified"
                                                rules={{ required: "This field is required" }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 rounded flex gap-2 justify-end">
                                        <button type="submit" className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-white rounded-md bg-gray-800" disabled={isSubmitting}>
                                            Submit
                                        </button>
                                        <Link to="/owners/">
                                            <button className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-gray-700 rounded-md bg-gray-300">
                                                Cancel
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </form>

                        </>)
            }
        </MainWrapper>
    )
}

export default AddEditOwner