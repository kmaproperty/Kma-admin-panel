import { useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper"
import PageTitle from "../../components/common/layout/PageTitle"
import { decodeFilters } from "../../lib/helper";
import { blockUserApi, channelPartnersListApiPayload, unblockUserApi } from "../../services/channelPartnerService";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import { Tooltip } from "@mui/material";
import { EditIcon, Flag, OctagonMinusIcon } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import { toast } from "react-toastify";

const OwnersListingPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState();
    const [confirmationDialog, setConfirmationDialog] = useState(false);

    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
        totalPage: 1
    });
    const [search, setSearch] = useState("");

    const handleClose = () => {
        setConfirmationDialog(null);
    }

    const blockUnblockUser = async () => {
        setLoading(true);
        try {
            const res = await confirmationDialog.isBlocked ? unblockUserApi(confirmationDialog.id) : blockUserApi(confirmationDialog.id);
            if (res.status === 200) {
                refetch();
                setConfirmationDialog(null);
                toast.success(res.message)
            }
            else {
                toast.error(error.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    const confirmationDialogActions = [
        {
            label: 'Block',
            variant: 'primary',
            onClick: () => {
                blockUnblockUser()
            }
        },
        {
            label: 'Close',
            variant: 'outline-secondary',
            onClick: handleClose
        },
    ];

    const columns = [
        { field: "name", headerName: "Name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "phone", headerName: "Phone", flex: 1 },
        { field: "isActive", headerName: "Is Active", flex: 1 },
        { field: "createdAt", headerName: "Created At", flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <>
                    <Tooltip title={params.isBlocked ? "Unblock" : "Block"}>
                        <button className="mr-2 p-2 bg-gray-100 cursor-pointer" onClick={() => setConfirmationDialog({ id: params.id, isBlocked: params.isBlocked })}>
                            {
                                params.isBlocked ? <Flag className="text-gray-800 w-5 h-5" /> : <OctagonMinusIcon className="text-gray-800 w-5 h-5" />
                            }
                        </button>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link to={`/owners/edit/${params.id}`}>
                            <button className="mr-2 p-2 bg-gray-100 cursor-pointer">
                                <EditIcon className="text-gray-800 w-5 h-5" />
                            </button>
                        </Link>
                    </Tooltip>

                    {/* <Tooltip title="Delete">
            <Button variant="soft-danger" size="sm" onClick={() => setConfirmationDialog(params.id)}>
              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
            </Button>
          </Tooltip> */}
                </>
            ),
        }
    ];

    const {
        data: channelPartnerList,
        isLoading,
        refetch: fetchChannelPartnerList
    } = useQuery({
        // queryKey: ["partner-list", pagination, "OWNER", search],
        queryFn: () => {
            const payload = {
                page: pagination.page,
                limit: pagination.limit,
                role: "OWNER"
            };

            return channelPartnersListApiPayload(payload);
        },
        staleTime: 0,
        refetchOnMount: true
    });

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
        fetchChannelPartnerList()
    }, [pagination])

    useEffect(() => {
        const query = searchParams.get("filters");
        if (query) {
            const parsed = decodeFilters(query);
            if (parsed) setFilters(parsed);
        }
        // setLoading(true);
    }, [searchParams]);

    const rows = useMemo(() => {
        if (!channelPartnerList?.data) return [];
        return channelPartnerList.data.map((item) => ({
            id: item.id,
            name: item.name || "-",
            intent: item.intent,
            isActive: item.isActive ? "Yes" : "No",
            createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy'),
            email: item.email,
            businessSince: item.businessSince,
            phone: item.phone
        }));
    }, [channelPartnerList]);

    return (
        <MainWrapper>
            <PageTitle title={"Owners"} />
            <CustomDataGrid
                columns={columns}
                rows={rows}
                loading={isLoading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={channelPartnerList?.total}
                style={{ height: "calc(100vh - 180px)" }}
            />
            <CustomDialog
                open={confirmationDialog ? true : false}
                handleClose={handleClose}
                heading={`Confirm Block Owner`}
                actions={confirmationDialogActions}
                size='md'
            >
                <div className="mb-3">
                    <p>Are you sure you want to block this Owner?</p>
                </div>
            </CustomDialog>
        </MainWrapper>
    )
}

export default OwnersListingPage