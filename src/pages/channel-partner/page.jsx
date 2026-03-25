import { use, useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper"
import PageTitle from "../../components/common/layout/PageTitle"
import { decodeFilters } from "../../lib/helper";
import { blockUserApi, channelPartnersListApiPayload, unblockUserApi } from "../../services/channelPartnerService";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import { Tooltip } from "@mui/material";
import { Building2, CircleUserRound, EditIcon, Eye, Flag, MonitorCheck, OctagonMinus, OctagonMinusIcon, Pencil, ShieldCheck, ShieldQuestionMark } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import CustomDialog from "../../components/common/CustomDialog";
import { toast } from "react-toastify";

const ChannelPartnerListing = () => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState();
    const [loading, setLoading] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [partnerStats, setPartnerStats] = useState([
        {
            title: "Total Partners",
            count: 2000,
            icon: <CircleUserRound className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
        {
            title: "Active Partners",
            count: 1800,
            icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
        {
            title: "Verified Partners",
            count: 200,
            icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
        {
            title: "Partners with KYC verification",
            count: 1500,
            icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
    ]);

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
        queryKey: ["partner-list", pagination.page, pagination.limit, search],
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
        {
            field: "img", headerName: "Image",
            renderCell: (params) => {
                return (

                    <img
                        className="object-cover rounded-lg"
                        style={{ height: "44px", width: "50px" }}
                        src={params.row.img}
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
        { field: "channelPartnerCode", headerName: "Ch. code", flex: 1 },
        { field: "phone", headerName: "Phone", flex: 1 },
        { field: "experience", headerName: "Experience", flex: 1 },
        { field: "rentedProperties", headerName: "Rented Properties", flex: 1 },
        { field: "soldProperties", headerName: "Sold Properties", flex: 1 },
        { field: "isActive", headerName: "Is Active", flex: 1 },
        { field: "createdAt", headerName: "Created At", flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 164,
            renderCell: (params) => (

                <div className="w-full flex justify-end items-center">
                    <Tooltip title="View">
                        <Link to={`/channel-partners/view/${params.id}`} className="h-fit inline-block max-h-[50px]">
                            <button className="h-fit mr-2 py-2 px-3 bg-gray-50 cursor-pointer rounded-sm">
                                <Eye className="text-gray-700 w-4.5 h-4.5" />
                            </button>
                        </Link>
                    </Tooltip>
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
            channelPartnerCode: item.channelPartnerCode,
            phone: item.phone,
            experience: item.experience,
            soldProperties: item.soldProperties,
            rentedProperties: item.rentedProperties,
            img: item?.profileImage?.length
                ? `${import.meta.env.VITE_AWS_URL}${item.profileImage}`
                : '',
        }));
    }, [channelPartnerList]);

    const summary = useMemo(() => {
        if (!channelPartnerList?.summary) return [];
        return channelPartnerList.summary
    }, [channelPartnerList]);

    useEffect(() => {
        if (channelPartnerList?.summary) {
            const stats = [
                {
                    title: "Total Partners",
                    count: channelPartnerList.summary.totalPartners,
                    icon: <CircleUserRound className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
                },
                {
                    title: "Active Partners",
                    count: channelPartnerList.summary.activePartners,
                    icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
                },
                {
                    title: "Verified Partners",
                    count: channelPartnerList.summary.verifiedPartners,
                    icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
                },
                {
                    title: "Partners with KYC verification",
                    count: channelPartnerList.summary.kycCompletedPartners,
                    icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
                },
            ]
            setPartnerStats(stats)
        }
    }, [channelPartnerList])

    return (
        <MainWrapper>
            <div className="flex gap-5">
                {
                    partnerStats.map((stat) => (
                        <div className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
                            <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50 mb-2">
                                {stat.icon}
                            </div>
                            <div className="text-right w-full">
                                <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
                                <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="bg-white rounded-xl shadow-md pt-1 pb-3 px-6 mt-3">
                <PageTitle title={"Channel Partners"} isSearch searchValue={search} onSearchChange={handleSearch} />
                <CustomDataGrid
                    columns={columns}
                    rows={rows}
                    loading={isLoading || loading}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    page={pagination.page - 1}
                    pageSize={pagination.limit}
                    rowCount={channelPartnerList?.total || 0}
                    style={{ height: "calc(100vh - 304px)" }}
                />
            </div>
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