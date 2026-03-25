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

const EditCustomer = () => {
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const messageSchema = yup.object({
        name: yup.string().required('Please enter name'),
        email: yup.string().email('Invalid email format').required('Please enter email'),
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
        watch,
        formState: { errors }
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
        },
    });

    const {
        data: customerData,
    } = useQuery({
        queryKey: ["partner-details", params.id, "CUSTOMER"],
        queryFn: () => {
            return getPartnerApiHandler(params.id);
        },
        Loadingd: isLoading,
        staleTime: 0,
        refetchOnMount: true
    });

    const { mutate: editPartner } = useMutation({
        mutationFn: editPartnerApiHandler,
        onSuccess: (res) => {
            toast.success("Customer Updated Successfully");
            navigate("/customers");
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
        if (customerData) {
            setValue("name", customerData.data.name || "")
            setValue("email", customerData.data.email || "")
            setValue("isActive", customerData.data.isActive ? { label: "Yes", value: true } : { label: "No", value: false } || true)
            setValue("phoneVerified", customerData.data.phoneVerified ? { label: "Yes", value: true } : { label: "No", value: false } || true)
        }
    }, [customerData])

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
                            <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("Submit blocked due to:", errors))}>
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
        </MainWrapper >
    )
}

export default EditCustomer