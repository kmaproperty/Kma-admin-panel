import { useEffect, useState } from "react";
import MainWrapper from "../../../components/common/layout/mainWrapper"
import PageTitle from "../../../components/common/layout/PageTitle"
import { decodeFilters } from "../../../lib/helper";
import { channelPartnerCodesListApiPayload, deletePartnerCodeApiHandler } from "../../../services/channelPartnerService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO, set } from 'date-fns';
import { Tooltip } from "@mui/material";
import { EditIcon, PlusIcon, Trash } from "lucide-react";
import CustomDataGrid from "../../../components/common/CustomDataGrid";
import CustomDialog from "../../../components/common/CustomDialog";
import { toast } from "react-toastify";

const ChannelPartnerCode = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState();
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [partnerCodesData, setPartnerCodesData] = useState([]);
    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
        totalPage: 1
    });
    const [search, setSearch] = useState("");

    
    const {
        data: channelPartnerCodes,
        refetch: fetchChannelPartnerCodes
    } = useQuery({
        queryKey: ["partner-codes", pagination, "CHANNEL_PARTNER_CODE", search],
        queryFn: () => {
            const payload = {
                page: pagination.page,
                limit: pagination.limit,
            };

            return channelPartnerCodesListApiPayload(payload);
        },
        Loadingd: loading,
        staleTime: 0,
        refetchOnMount: true
    });

    const { mutate: deleteCode, isPending: deleteLoader } = useMutation({
        mutationFn: deletePartnerCodeApiHandler,
        onSuccess: (res) => {
            toast.success(res.message)
            fetchChannelPartnerCodes();
            setConfirmationDialog(null)
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


    const handleClose = () => {
        setConfirmationDialog(null);
    }

    const columns = [
        { field: "code", headerName: "Code", flex: 1 },
        { field: "createdAt", headerName: "Created At", flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <>
                    <Tooltip title="Edit">
                        <Link to={`/channel-partners/code/edit/${params.id}`}>
                            <button className="mr-2 p-2 bg-gray-100 cursor-pointer">
                                <EditIcon className="text-gray-800 w-4 h-4" />
                            </button>
                        </Link>
                    </Tooltip>

                    <Tooltip title="Delete">
                        <button className="mr-2 p-2 bg-gray-100 cursor-pointer" onClick={() => setConfirmationDialog(params.id)}>
                            <Trash className="text-gray-800 w-4 h-4" />
                        </button>
                    </Tooltip>
                </>
            ),
        }
    ];

    const handleDeleteChannelPartnerCode = async () => {
        deleteCode(confirmationDialog)
    }

    const buttons = [
        {
            label: 'Add',
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: () => {
                navigate(`/channel-partners/code/add`)
            }
        },
    ];

    const confirmationDialogActions = [
        {
            label: 'Delete',
            variant: 'danger',
            onClick: () => {
                handleDeleteChannelPartnerCode()
            }
        },
        {
            label: 'Close',
            variant: 'outline-secondary',
            onClick: handleClose
        },
    ];

    const onPageChange = (uiPage) => {
        setPagination((prev) => {
            const newState = {
                page: uiPage + 1,
                limit: prev.limit,
            };
            return newState;
        });
    };

    const onPageSizeChange = (newSize) => {
        setPagination((prev) => ({
            limit: newSize,
            page: prev.page,
        }));
    };

    useEffect(() => {
        const query = searchParams.get("filters");
        if (query) {
            const parsed = decodeFilters(query);
            if (parsed) setFilters(parsed);
        }
        // setLoading(true);
    }, [searchParams]);

    useEffect(() => {
        console.log(channelPartnerCodes)
        if (channelPartnerCodes?.data?.length) {
            const codes = channelPartnerCodes.data.map((item) => ({
                id: item.id,
                code: item.code,
                createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy')
            }));

            setPartnerCodesData(codes);
        }
        if (channelPartnerCodes?.pagination) {
            const { limit, page, totalPage } = channelPartnerCodes.pagination;
            setPagination((prev) => ({
                ...prev,
                limit,
                page,
                totalPage
            }));
        }
    }, [channelPartnerCodes]);

    return (
        <MainWrapper>
            <PageTitle title={"Channel Partner Codes"} actions={buttons} />
            <CustomDataGrid
                columns={columns}
                rows={partnerCodesData}
                loading={loading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={channelPartnerCodes?.total}
                style={{ height: "calc(100vh - 180px)" }}
            />
            <CustomDialog
                open={confirmationDialog ? true : false}
                handleClose={handleClose}
                heading={`Confirm delete amenity`}
                actions={confirmationDialogActions}
                size='md'
            >
                <div className="mb-3">
                    <p>Are you sure you want to delete this amenity?</p>
                </div>
            </CustomDialog>
        </MainWrapper>
    )
}

export default ChannelPartnerCode