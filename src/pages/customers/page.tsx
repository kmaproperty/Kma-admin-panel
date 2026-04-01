import { useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper";
import PageTitle from "../../components/common/layout/PageTitle";
import { decodeFilters } from "../../lib/helper";
import { blockUserApi, channelPartnersListApiPayload, unblockUserApi } from "../../services/channelPartnerService";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Tooltip } from "@mui/material";
import { Eye, Flag, OctagonMinusIcon, Pencil } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import { toast } from "react-toastify";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ViewOwnerDialoge from "../owners/viewOwnerDialogue";

interface Pagination {
    limit: number;
    page: number;
    totalPage: number;
}

interface ConfirmationDialog {
    id: string;
    isBlocked: boolean;
}

interface CustomerRow {
    id: string;
    name: string;
    intent: string;
    isActive: string;
    isBlocked: boolean;
    createdAt: string;
    email: string;
    businessSince: string;
    phone: string;
}

const CustomersListingPage = () => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState<Record<string, unknown> | undefined>();
    const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialog | false>(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const [showDetailsPopup, setShowDetailsPopup] = useState<string | number | null>(null);

    const [pagination, setPagination] = useState<Pagination>({
        limit: 10,
        page: 1,
        totalPage: 1,
    });

    const [search, setSearch] = useState("");


    const columns: GridColDef[] = [
        {
            field: "img", headerName: "Image",
            renderCell: (params) => {
                return (
                    <img
                        className="object-cover rounded-lg"
                        style={{ height: "44px", width: "50px" }}
                        src={params.row.img || "https://www.rootinc.com/wp-content/uploads/2022/11/placeholder-1.png"}
                        alt=""
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://www.rootinc.com/wp-content/uploads/2022/11/placeholder-1.png";
                        }}
                    />
                )
            }
        },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "phone", headerName: "Phone", flex: 1 },
        { field: "isActive", headerName: "Is Active", flex: 1 },
        { field: "createdAt", headerName: "Created At", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            width: 160,
            renderCell: (params: GridRenderCellParams) => (
                <div className="w-full flex justify-end items-center">
                    <Tooltip title={"View"}>
                        <button className="h-fit mr-2 py-2 px-3 bg-gray-50 cursor-pointer rounded-sm" onClick={() => setShowDetailsPopup(params.id)}>
                            <Eye className="text-gray-700 w-4.5 h-4.5" />
                        </button>
                    </Tooltip>
                    <Tooltip title={params.row.isBlocked ? "Unblock" : "Block"}>
                        <button className={`mr-2 py-2 px-3 bg-gray-50 rounded-sm cursor-pointer ${params.row.isBlocked ? "bg-green-50" : "bg-yellow-100"}`} onClick={() => setConfirmationDialog({ id: String(params.id), isBlocked: params.row.isBlocked })}>
                            {
                                params.row.isBlocked ? <Flag className="text-green-800 w-4.5 h-4.5" /> : <OctagonMinusIcon className="text-yellow-800 w-4.5 h-4.5" />
                            }
                        </button>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Link
                            to={`/customers/edit/${params.id}`}
                            className="h-fit inline-block max-h-13 mr-2"
                        >
                            <button className="py-2 px-3 bg-blue-50 cursor-pointer rounded-sm">
                                <Pencil className="text-blue-800 w-4 h-4" />
                            </button>
                        </Link>
                    </Tooltip>
                </div>
            ),
        },
    ];


    const {
        data: customerData,
        isLoading,
        refetch: fetchCustomers,
    } = useQuery({
        queryKey: ["customer-list", pagination.page, pagination.limit, search],
        queryFn: () =>
            channelPartnersListApiPayload({
                page: pagination.page,
                limit: pagination.limit,
                role: "END_USER",
                search,
            }),
        staleTime: 0,
        refetchOnMount: true,
    });


    const onPageChange = useCallback((uiPage: number) => {
        const newPage = uiPage + 1;
        setPagination((prev) => {
            if (prev.page === newPage) return prev;
            return { ...prev, page: newPage };
        });
    }, []);

    const onPageSizeChange = useCallback((newSize: number) => {
        setPagination((prev) => {
            if (prev.limit === newSize) return prev;
            return { ...prev, limit: newSize, page: 1 };
        });
    }, []);

    // NOTE: queryKey already includes search + pagination so useQuery will
    // automatically refetch. The manual refetch below is kept for compatibility
    // but queryKey-based refetch is the primary trigger.

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchCustomers();
        }, 500);
        return () => clearTimeout(delay);
    }, [search, pagination.page, pagination.limit]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };


    useEffect(() => {
        const query = searchParams.get("filters");
        if (query) {
            const parsed = decodeFilters(query);
            if (parsed) setFilters(parsed);
        }
    }, [searchParams]);


    const handleClose = () => setConfirmationDialog(false);

    const handleBlockUnblock = async () => {
        if (!confirmationDialog) return;
        try {
            setBlockLoading(true);
            if (confirmationDialog.isBlocked) {
                await unblockUserApi(confirmationDialog.id);
                toast.success("User unblocked successfully");
            } else {
                await blockUserApi(confirmationDialog.id);
                toast.success("User blocked successfully");
            }
            fetchCustomers();
            handleClose();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setBlockLoading(false);
        }
    };

    const confirmationDialogActions = [
        {
            label: "Cancel",
            onClick: handleClose,
            variant: "outline" as const,
        },
        {
            label: confirmationDialog && confirmationDialog.isBlocked ? "Unblock" : "Block",
            onClick: handleBlockUnblock,
            loading: blockLoading,
            variant: "primary" as const,
        },
    ];


    const rows: CustomerRow[] = useMemo(() => {
        if (!customerData?.data) return [];
        return customerData.data.map((item: any) => ({
            id: item.id,
            name: item.name || "-",
            intent: item.intent,
            isActive: item.isActive ? "Yes" : "No",
            isBlocked: item.isBlocked,
            createdAt: format(parseISO(item.createdAt), "dd/MM/yyyy"),
            email: item.email,
            businessSince: item.businessSince,
            phone: item.phone,
            img: item?.profileImage?.length
                ? `${import.meta.env.VITE_AWS_URL}${item.profileImage}`
                : '',
        }));
    }, [customerData]);


    return (
        <MainWrapper>
            <PageTitle
                title="Customers List"
                isSearch
                searchValue={search}
                onSearchChange={handleSearch}
            />
            <CustomDataGrid
                columns={columns}
                rows={rows}
                loading={isLoading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={customerData?.total}
                style={{ height: "calc(100vh - 180px)" }}
            />
            <CustomDialog
                open={confirmationDialog !== false}
                handleClose={handleClose}
                heading={`Confirm ${confirmationDialog && confirmationDialog.isBlocked ? "unblock" : "block"} User`}
                actions={confirmationDialogActions}
                size="md"
            >
                <div className="mb-3">
                    <p>
                        Are you sure you want to{" "}
                        {confirmationDialog && confirmationDialog.isBlocked ? "unblock" : "block"} this User?
                    </p>
                </div>
            </CustomDialog>
            <ViewOwnerDialoge
                open={showDetailsPopup}
                type="customer"
                onClose={() => setShowDetailsPopup(null)}
            />
        </MainWrapper>
    );
};

export default CustomersListingPage;
