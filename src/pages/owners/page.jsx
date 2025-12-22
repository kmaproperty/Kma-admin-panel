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
        const res = confirmationDialog.isBlocked 
            ? await unblockUserApi(confirmationDialog.id) 
            : await blockUserApi(confirmationDialog.id);

        // Check if the API response actually uses the key "success"
        if (res && res.success) {
            console.log(1);
            fetchOwners();
            setConfirmationDialog(null);
            toast.success(res.message);
        } else {
            // This runs if the request worked but success was false
            toast.error(res?.message || "Operation failed");
        }
    } catch (error) {
        // This runs if the API returned a 400/500 error
        console.error("API Error:", error);
        toast.error(error?.message || "An unexpected error occurred");
    } finally {
        setLoading(false);
    }
};

    const confirmationDialogActions = [
        {
            label: confirmationDialog?.isBlocked ? "unblock" : "block",
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
                    <Tooltip title={params.row.isBlocked ? "Unblock" : "Block"}>
                        <button className="mr-2 p-2 bg-gray-100 cursor-pointer" onClick={() => setConfirmationDialog({ id: params.id, isBlocked: params.row.isBlocked })}>
                            {
                                params.row.isBlocked ? <Flag className="text-gray-800 w-5 h-5" /> : <OctagonMinusIcon className="text-gray-800 w-5 h-5" />
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
        data: ownersData,
        isLoading,
        refetch: fetchOwners
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
        fetchOwners()
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
        if (!ownersData?.data) return [];
        return ownersData.data.map((item) => ({
            id: item.id,
            name: item.name || "-",
            intent: item.intent,
            isActive: item.isActive ? "Yes" : "No",
            isBlocked: item.isBlocked ,
            createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy'),
            email: item.email,
            businessSince: item.businessSince,
            phone: item.phone
        }));
    }, [ownersData]);

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
                rowCount={ownersData?.total}
                style={{ height: "calc(100vh - 180px)" }}
            />
            <CustomDialog
                open={confirmationDialog?.id ? true : false}
                handleClose={handleClose}
                heading={`Confirm ${confirmationDialog?.isBlocked ? "unblock" : "block"} Channel Partner`}
                actions={confirmationDialogActions}
                size='md'
            >
                <div className="mb-3">
                    <p>Are you sure you want to {confirmationDialog?.isBlocked ? "unblock" : "block"} this Channel Partner?</p>
                </div>
            </CustomDialog>
        </MainWrapper>
    )
}

export default OwnersListingPage