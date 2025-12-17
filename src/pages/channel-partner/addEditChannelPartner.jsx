import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import PageTitle from '../../components/common/layout/PageTitle';
import TextField from '../../components/common/TextField';
import MainWrapper from '../../components/common/layout/mainWrapper';
import { addPartnerCodeApiHandler, editPartnerCodeApiHandler, getPartnerCodeApiHandler } from '../../services/channelPartnerService';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getPartnerApiHandler } from '../../services/channelPartnerService';

const AddEditChannelPartner = () => {
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const messageSchema = yup.object({
        name: yup.string().required('Please enter name'),
        email: yup.string().email('Invalid email format').required('Please enter email'),
        firmName: yup.string().required('Please enter First name'),
        cities: yup.array().min(1, 'Please select at least one city').required(),
        businessSince: yup.date().nullable(),
        aboutYourSelf: yup.string(),
        phoneVerified: yup.boolean().required(),
        isActive: yup.boolean().required()
    });

    const {
        handleSubmit,
        control,
        setValue,
        reset
    } = useForm({
        resolver: yupResolver(messageSchema),
        defaultValues: {
            phoneVerified: true,
            isActive: true
        }
    });

    const {
        data: channelPartnerData,
    } = useQuery({
        queryKey: ["partner-details", params.id, "CHANNEL_PARTNER_CODE"],
        queryFn: () => {
            return getPartnerApiHandler(params.id);
        },
        Loadingd: isLoading,
        staleTime: 0,
        refetchOnMount: true
    });

    const { mutate: editCode } = useMutation({
        mutationFn: editPartnerCodeApiHandler,
        onSuccess: (res) => {
            toast.success("Channel Partner Code Updated Successfully")
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
            editCode({ payload: data, id: params?.id });
        } catch (err) {
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (channelPartnerData) {
            setValue("name", channelPartnerData.data.name),
                setValue("email", channelPartnerData.data.email),
                setValue("firstName", channelPartnerData.data.firstName),
                setValue("cities", channelPartnerData.data.cities),
                setValue("businessSince", channelPartnerData.data.businessSince),
                setValue("aboutYourSelf", channelPartnerData.data.aboutYourSelf),
                setValue("isActive", channelPartnerData.data.isActive),
                setValue("phoneVerified", channelPartnerData.data.phoneVerified)
        }
    }, [channelPartnerData])

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
                            <PageTitle title={`Edit Channel Partner`} />
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='bg-gray-50 w-[70%] px-5 py-4 rounded-lg'>
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

export default AddEditChannelPartner