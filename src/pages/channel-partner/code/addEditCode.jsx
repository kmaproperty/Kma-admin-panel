import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// import { useCreateAmenityMutation, useGetAmenitiesByIdQuery } from '../../../../../redux/api/property/amenitiesApi';
// import { useNotificationContext } from '@/context/useNotificationContext';
import CircularProgress from '@mui/material/CircularProgress';
import { skipToken } from '@reduxjs/toolkit/query';
import PageTitle from '../../../components/common/layout/PageTitle';
import TextField from '../../../components/common/TextField';
import MainWrapper from '../../../components/common/layout/mainWrapper';
import { addPartnerCodeApiHandler, editPartnerCodeApiHandler, getPartnerCodeApiHandler } from '../../../services/channelPartnerService';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
// import { useAddChannelPartnerCodeMutation, useGetChannelPartnerCodeByIdQuery, useUpdateChannelPartnerCodeMutation } from '../../../../../redux/api/users/chanelPartnerApi';

const AddEditChannelPartnerCodes = () => {
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    // const [addChannelPartnerCode] = useAddChannelPartnerCodeMutation();
    // const [UpdateChannelPartnerCode] = useUpdateChannelPartnerCodeMutation();
    // const { data: codeDetails, error, isLoading } = useGetChannelPartnerCodeByIdQuery(params?.id ? params.id : skipToken);

    const messageSchema = yup.object({
        code: yup.string().required('Please enter code'),
    });

    const {
        handleSubmit,
        control,
        setValue,
        reset
    } = useForm({
        resolver: yupResolver(messageSchema),
        defaultValues: {
            code: "",
        }
    });

    const {
        data: channelPartnerCode,
    } = useQuery({
        queryKey: ["partner-code-details", params.id, "CHANNEL_PARTNER_CODE"],
        queryFn: () => {
            return getPartnerCodeApiHandler(params.id);
        },
        Loadingd: isLoading,
        staleTime: 0,
        refetchOnMount: true
    });

    const { mutate: addCode } = useMutation({
        mutationFn: addPartnerCodeApiHandler,
        onSuccess: (res) => {
            toast.success("Channel Partner Code Created Successfully");
            reset();
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

    const { mutate: editCode } = useMutation({
        mutationFn: editPartnerCodeApiHandler,
        onSuccess: (res) => {
            toast.success("Channel Partner Code Updated Successfully");
            navigate("/channel-partners/code");
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
        // const payload = {
        //     ...data,
        //     // ...(params?.id && { id: params.id })
        // };

        console.log(params?.id)
        try {
            params?.id ? editCode({payload: data, id: params?.id}) : addCode(data).unwrap();
        } catch (err) {
            console.log(err);
            showNotification({
                message: err?.message || "Something went wrong",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (channelPartnerCode) {
            setValue("code", channelPartnerCode.data.code)
        }
    }, [channelPartnerCode])

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
                            <PageTitle title={`${params?.id ? "Edit" : "Add"} Channel Partner Code`} />
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='bg-gray-50 w-[33%] px-5 py-4 rounded-lg'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-full'>
                                            <div className="mb-3">
                                                <TextField
                                                    control={control}
                                                    name="code"
                                                    label="Code"
                                                    placeHolder="Enter Code"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className="mt-4 rounded flex gap-2 justify-end">
                                            <button type="submit" className="px-4 flex gap-1 font-semibold items-center cursor-pointer py-2 text-white rounded-md bg-gray-800" disabled={isSubmitting}>
                                                Submit
                                            </button>
                                            <Link to="/channel-partners/code">
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

export default AddEditChannelPartnerCodes