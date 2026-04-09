import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Autocomplete, TextField, Switch, Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import { propertyListApiPayload, markTopPropertiesApiHandler, removeTopPropertiesApiHandler } from "../../services/postProperty";
import { fetchCities } from "../../services/cities";
import PageTitle from "../../components/common/layout/PageTitle";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import MainWrapper from "../../components/common/layout/mainWrapper";
import referralsData from './dummyData.json';
import { format, parseISO } from "date-fns";
import { Check, CheckCheck, Flag, OctagonMinusIcon, X } from "lucide-react";

export default function ReferralsList() {
    const [tableData, setTableData] = useState(referralsData);
    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
        totalPage: 0,
    });

    const handleToggleTop = useCallback((id, isTop) => {
        // if (isTop) {
        //   removeTop({ id });
        // } else {
        //   markTop({ id });
        // }
    }, []);

    const onPageChange = useCallback((uiPage) => {
        const newPage = uiPage + 1;
        setPagination((prev) => {
            if (prev.page === newPage) return prev;
            return { ...prev, page: newPage };
        });
    }, []);

    const onPageSizeChange = useCallback((newSize) => {
        setPagination((prev) => {
            if (prev.limit === newSize) return prev;
            return { ...prev, limit: newSize, page: 1 };
        });
    }, []);

    const columns = [
        {
            field: "referrerName",
            headerName: "Referrer",
            flex: 0.7,
            renderCell: (params) => (
                <div className="h-full flex items-center">
                    <p className="truncate" title={params.value}>
                        {params.value}
                    </p>
                </div>
            ),
        },
        {
            field: "clientName",
            headerName: "Client Name",
            flex: 0.8,
            renderCell: (params) => (
                <div className="h-full flex items-center">
                    <p className="truncate" title={params.value}>
                        {params.value}
                    </p>
                </div>
            ),
        },
        {
            field: "clientMobile",
            headerName: "Mobile",
            flex: 0.7,
            renderCell: (params) => (
                <div className="h-full flex items-center">
                    <p>{params.value}</p>
                </div>
            ),
        },
        {
            field: "propertyType",
            headerName: "Type",
            flex: 0.5,
        },
        {
            field: "location",
            headerName: "Location",
            flex: 1,
            renderCell: (params) => (
                <p className="truncate" title={params.value}>
                    {params.value}
                </p>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            flex: 0.7,
            renderCell: (params) => {
                const statusColor =
                    params.value === "Deal Closed"
                        ? "text-green-700 bg-green-50"
                        : params.value === "In Process"
                            ? "text-yellow-700 bg-yellow-50"
                            : "text-gray-700 bg-gray-100";

                return (
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}
                    >
                        {params.value}
                    </span>
                );
            },
        },
        {
            field: "coinsCredited",
            headerName: "Coins",
            flex: 0.5,
        },
        {
            field: "createdAt",
            headerName: "Date",
            flex: 0.8,
            renderCell: (params) => (
                <p>
                    {new Date(params.value).toLocaleDateString()}
                </p>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 100,
            renderCell: (params) => (
                <div className="w-full flex justify-end items-center gap-2">

                    {/* Approve / Reject Button */}
                    <Tooltip title={params.row.isApproved ? "Reject" : "Approve"}>
                        <button
                            className={`p-2 mt-3 rounded cursor-pointer ${params.row.isApproved
                                    ? "bg-red-50"
                                    : "bg-green-50"
                                }`}
                            onClick={() =>
                                setConfirmationDialog({
                                    id: String(params.id),
                                    isApproved: params.row.isApproved,
                                })
                            }
                        >
                            {params.row.isApproved ? (
                                <X className="text-red-700 w-4 h-4" />
                            ) : (
                                <CheckCheck className="text-green-700 w-4 h-4" />
                            )}
                        </button>
                    </Tooltip>

                    {/* Mark as Closed */}
                    <Tooltip title="Mark as Closed">
                        <button
                            className="p-2 mt-3 rounded bg-blue-50 cursor-pointer"
                            onClick={() =>
                                handleStatusChange(params.row.id, "Deal Closed")
                            }
                        >
                            <Check className="text-blue-700 w-4 h-4" />
                        </button>
                    </Tooltip>

                </div>
            ),
        },
    ];

    const rows = useMemo(() => {
        if (!tableData) return [];
        return tableData.map((item) => ({
            id: item.id,
            referrerId: item.referrerId,
            referrerName: item.referrerName || "-",
            clientName: item.clientName || "-",
            clientMobile: item.clientMobile || "-",
            channelPartner: item.channelPartner || "-",
            propertyType: item.propertyType || "-",
            createdAt: format(parseISO(item.createdAt), "dd/MM/yyyy"),
            location: item.location,
            status: item.status,
            coinsCredited: item.coinsCredited,
        }));
    }, [tableData]);

    return (
        <MainWrapper>
            <PageTitle title="Referrals" />

            <CustomDataGrid
                columns={columns}
                rows={rows}
                // loading={isLoading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={pagination.totalPage}
                style={{ height: "calc(100vh - 150px)" }}
            />
        </MainWrapper>
    );
}
