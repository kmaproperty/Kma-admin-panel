import { use, useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper"
import PageTitle from "../../components/common/layout/PageTitle"
import { decodeFilters } from "../../lib/helper";
import { blockUserApi, channelPartnersListApiPayload, unblockUserApi } from "../../services/channelPartnerService";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import { Tooltip } from "@mui/material";
import { EditIcon, Flag, OctagonMinus, OctagonMinusIcon, Pencil } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import { toast } from "react-toastify";

const ChannelPartnerListing = () => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState();
    const [loading, setLoading] = useState(false);
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

    const { data: channelPartnerList, isLoading, refetch: fetchChannelPartners } = useQuery({
        // queryKey: ["partner-list", pagination.page, pagination.limit],
        queryFn: () => channelPartnersListApiPayload({
            page: pagination.page,
            limit: pagination.limit,
            role: "CHANNEL_PARTNER",
            search: search
        }),
        staleTime: 0,
    });

    const blockUnblockUser = async () => {
    setLoading(true);
    try {
        const res = confirmationDialog.isBlocked 
            ? await unblockUserApi(confirmationDialog.id) 
            : await blockUserApi(confirmationDialog.id);

        // Check if the API response actually uses the key "success"
        if (res && res.success) {
            console.log(1);
            fetchChannelPartners();
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
        { field: "businessSince", headerName: "Sort Order", flex: 1 },
        { field: "isActive", headerName: "Is Active", flex: 1 },
        { field: "createdAt", headerName: "Created At", flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 140,
            renderCell: (params) => (
                
                <div className="w-full flex justify-end items-center">
                    <Tooltip title={params.row.isBlocked ? "Unblock" : "Block"}>
                        <button className={`mr-3 py-2 px-3 bg-gray-50 rounded-sm cursor-pointer ${params.row.isBlocked ? "bg-green-50" : "bg-yellow-100"}`} onClick={() => setConfirmationDialog({ id: params.id, isBlocked: params.row.isBlocked })}>
                            {
                                params.row.isBlocked ? <Flag className="text-green-800 w-4.5 h-4.5" /> : <OctagonMinusIcon className="text-yellow-800 w-4.5 h-4.5" />
                            }
                        </button>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link to={`/channel-partners/edit/${params.id}`} className="h-fit inline-block max-h-[50px]">
                            <button className=" py-2 px-3 bg-blue-50 cursor-pointer rounded-sm">
                                <Pencil className="text-blue-800 w-4.5 h-4.5" />
                            </button>
                        </Link>
                    </Tooltip>
                </div>
            ),
        }
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

    useEffect(() => {
    const delay = setTimeout(() => {
      fetchChannelPartners({ page: pagination.page, limit: pagination.limit, search: search, role: "CHANNEL_PARTNER", })
    }, 500);

    return () => clearTimeout(delay);
  }, [search, pagination.page, pagination.limit]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

    const rows = useMemo(() => {
        if (!channelPartnerList?.data) return [];
        return channelPartnerList.data.map((item) => ({
            id: item.id,
            name: item.name || "-",
            intent: item.intent,
            isActive: item.isActive ? "Yes" : "No",
            isBlocked: item.isBlocked,
            createdAt: item.createdAt ? format(parseISO(item.createdAt), 'dd/MM/yyyy') : "-",
            email: item.email,
            businessSince: item.businessSince,
            phone: item.phone
        }));
    }, [channelPartnerList]);

    return (
        <MainWrapper>
            <PageTitle title={"Channel Partners"} isSearch searchValue={search} onSearchChange={handleSearch}/>
            <CustomDataGrid
                columns={columns}
                rows={rows}
                loading={isLoading || loading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={channelPartnerList?.total || 0}
                style={{ height: "calc(100vh - 170px)" }}
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

export default ChannelPartnerListing