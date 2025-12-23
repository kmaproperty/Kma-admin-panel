import { useCallback, useEffect, useMemo, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper"
import PageTitle from "../../components/common/layout/PageTitle"
import { decodeFilters } from "../../lib/helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO, set } from 'date-fns';
import { Tooltip } from "@mui/material";
import { EditIcon, PlusIcon, Trash } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";
import { adminsListApiPayload } from "../../services/admin";
import { permissionsListApiPayload } from "../../services/permissions";

const PermissionList = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState();
    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
        totalPage: 1
    });
    const [search, setSearch] = useState("");


    const {
        data: permissionData,
        isLoading,
        refetch: fetchPermission
    } = useQuery({
        // queryKey: ["partner-codes", pagination, "CHANNEL_PARTNER_CODE", search],
        queryFn: () => {
            const payload = {
                page: pagination.page,
                limit: pagination.limit,
            };

            return permissionsListApiPayload(payload);
        },
        staleTime: 0,
        refetchOnMount: true
    });

    useEffect(() => {
        fetchPermission()
    }, [pagination])

    const columns = [
        { field: "name", headerName: "Name", flex: 1 },
        // {
        //     field: 'actions',
        //     headerName: 'Actions',
        //     width: 120,
        //     renderCell: (params) => (
        //         <>
        //             <Tooltip title="Edit">
        //                 <Link to={`/channel-partners/code/edit/${params.id}`}>
        //                     <button className="mr-2 p-2 bg-gray-100 cursor-pointer">
        //                         <EditIcon className="text-gray-800 w-4 h-4" />
        //                     </button>
        //                 </Link>
        //             </Tooltip>

        //             <Tooltip title="Delete">
        //                 <button className="mr-2 p-2 bg-gray-100 cursor-pointer" onClick={() => setConfirmationDialog(params.id)}>
        //                     <Trash className="text-gray-800 w-4 h-4" />
        //                 </button>
        //             </Tooltip>
        //         </>
        //     ),
        // }
    ];

    const buttons = [
        {
            label: 'Add',
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: () => {
                navigate(`/admins/add`)
            }
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
        if (!permissionData?.permissions) return [];
        return permissionData.permissions.map((item) => ({
            id: item,
            name: item.replace(/_/g, " "),
        }));
    }, [permissionData]);

    return (
        <MainWrapper>
            <PageTitle title={"Permissions"} />
            <CustomDataGrid
                columns={columns}
                rows={rows}
                loading={isLoading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={permissionData?.total}
                style={{ height: "calc(100vh - 180px)" }}
            />
        </MainWrapper>
    )
}

export default PermissionList