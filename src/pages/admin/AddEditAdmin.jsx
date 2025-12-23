import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { use, useEffect, useState } from 'react';
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
import { permissionsListApiPayload } from '../../services/permissions';
import { adminCreateApiPayload } from '../../services/admin';

const AddEditAdmin = () => {
    const params = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const navigate = useNavigate();

    const messageSchema = yup.object({
        username: yup.string().required('Please enter username'),
        password: yup.string().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character').required('Please enter password'),
        role: yup.string().required('Please enter role'),
        permissions: yup.array().min(1, 'Please select at least one permission').required(),
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
        }
    });

    const {
        data: permissionData,
        isLoading: isPermissionLoading,
        refetch: fetchPermissions
    } = useQuery({
        queryKey: ["permissions"],
        queryFn: () => permissionsListApiPayload({
            page: 1,
            limit: 1000, // Increase limit to get "whole data"
            search: ""
        }),
        staleTime: 0,
        refetchOnMount: true
    });

    const { mutate: addAdmin } = useMutation({
        mutationFn: adminCreateApiPayload,
        onSuccess: (res) => {
            toast.success("Admin created Successfully");
            navigate("/admins");
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
        console.log(data)
        setIsSubmitting(true);
        const payload = {
            ...data,
            permissions: data.permissions.map((item) => item.value),
        };
        try {
            addAdmin(payload);
        } catch (err) {
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        console.log(permissionData)
        if (permissionData?.permissions.length) {
            setPermissions(permissionData.permissions.map((city) => {
                return { value: city, label: city }
            }))
        }
    }, [permissionData])

    useEffect(() => {
        console.log(watch("permissions"))
    }, [watch("permissions")])

    useEffect(() => {
        fetchPermissions()
    }, [fetchPermissions])

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
                            <PageTitle title={`Add Admin`} />
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='bg-gray-50 w-[70%] px-5 py-4 rounded-lg space-y-3'>
                                    <div className='flex items-center gap-6'>
                                        <div className="mb-3 w-[48%]">
                                            <TextField
                                                control={control}
                                                name="username"
                                                label="Username"
                                                placeHolder="Enter username"
                                            />
                                        </div>
                                        <div className="mb-3 w-[48%]">
                                            <TextField
                                                control={control}
                                                name="password"
                                                label="Password"
                                                placeHolder="Enter Password"
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-6'>
                                        <div className="mb-3 w-[48%]">
                                            <TextField
                                                control={control}
                                                name="role"
                                                label="Role"
                                                placeHolder="Enter role"
                                            />
                                        </div>
                                        <div className="mb-3 w-[48%]">
                                            <DynamicSelectController
                                                name="permissions"
                                                control={control}
                                                options={permissions}
                                                label="Permissions"
                                                isMulti
                                                placeholder="Select permissions"
                                                rules={{ required: "Permission is required" }}
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

export default AddEditAdmin