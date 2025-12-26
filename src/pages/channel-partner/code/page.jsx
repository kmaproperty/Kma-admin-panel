import { useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../../components/common/layout/mainWrapper"
import PageTitle from "../../../components/common/layout/PageTitle"
import { decodeFilters } from "../../../lib/helper";
import { channelPartnerCodesListApiPayload, deletePartnerCodeApiHandler } from "../../../services/channelPartnerService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO, set } from 'date-fns';
import { Tooltip } from "@mui/material";
import { EditIcon, Pencil, PlusIcon, Trash } from "lucide-react";
import CustomDataGrid from "../../../components/common/CustomDataGrid";
import CustomDialog from "../../../components/common/CustomDialog";
import { toast } from "react-toastify";

const ChannelPartnerCode = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState();
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
        totalPage: 1
    });
    const [search, setSearch] = useState("");


    const {
        data: channelPartnerCodes,
        isLoading,
        refetch: fetchChannelPartnerCodes
    } = useQuery({
        // queryKey: ["partner-codes", pagination, "CHANNEL_PARTNER_CODE", search],
        queryFn: () => {
            const payload = {
                page: pagination.page,
                limit: pagination.limit,
            };

            return channelPartnerCodesListApiPayload(payload);
        },
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

    useEffect(() => {
        fetchChannelPartnerCodes()
    }, [pagination])

    const columns = [
        { field: "code", headerName: "Code", flex: 1 },
        { field: "createdAt", headerName: "Created At", flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <>
                <div className="w-full flex justify-end items-center">
                    <Tooltip title={params.row.isBlocked ? "Unblock" : "Block"}>
                        <button className={`mr-3 py-2 px-3 bg-red-50 rounded-sm cursor-pointer `} onClick={() => setConfirmationDialog(params.id)}>
                            <Trash className="text-red-800 w-4 h-4" />
                        </button>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link to={`/channel-partners/code/edit/${params.id}`} className="h-fit inline-block max-h-[50px]">
                            <button className=" py-2 px-3 bg-blue-50 cursor-pointer rounded-sm">
                                <Pencil className="text-blue-800 w-4.5 h-4.5" />
                            </button>
                        </Link>
                    </Tooltip>
                </div>
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

    const onPageChange = useCallback((uiPage) => {
        const newPage = uiPage + 1;
        setPagination((prev) => {
            // Only update if it's genuinely different to prevent loops
            if (prev.page === newPage) return prev;
            console.log("Setting State to Page:", newPage);
            return { ...prev, page: newPage };
        });
    }, []);

    const onPageSizeChange = useCallback((newSize) => {
        setPagination((prev) => {
            if (prev.limit === newSize) return prev;
            return { ...prev, limit: newSize, page: 1 };
        });
    }, []);

    useEffect(() => {
        const query = searchParams.get("filters");
        if (query) {
            const parsed = decodeFilters(query);
            if (parsed) setFilters(parsed);
        }
        // setLoading(true);
    }, [searchParams]);

    const rows = useMemo(() => {
        if (!channelPartnerCodes?.data) return [];
        return channelPartnerCodes.data.map((item) => ({
            id: item.id,
            code: item.code,
            createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy')
        }));
    }, [channelPartnerCodes]);

    return (
        <MainWrapper>
            <PageTitle title={"Channel Partner Codes"} actions={buttons} />
            <CustomDataGrid
                columns={columns}
                rows={rows}
                loading={isLoading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={channelPartnerCodes?.total}
                style={{ height: "calc(100vh - 170px)" }}
            />
            <CustomDialog
                open={confirmationDialog ? true : false}
                handleClose={handleClose}
                heading={`Confirm delete code`}
                actions={confirmationDialogActions}
                size='md'
            >
                <div className="mb-3">
                    <p>Are you sure you want to delete this code?</p>
                </div>
            </CustomDialog>
        </MainWrapper>
    )
}

export default ChannelPartnerCode