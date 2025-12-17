import { useEffect, useState } from "react";
import MainWrapper from "../../components/common/layout/mainWrapper"
import PageTitle from "../../components/common/layout/PageTitle"
import { decodeFilters } from "../../lib/helper";
import { channelPartnersListApiPayload } from "../../services/channelPartnerService";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import { Tooltip } from "@mui/material";
import { EditIcon } from "lucide-react";
import CustomDataGrid from "../../components/common/CustomDataGrid";

const ChannelPartnerListing = () => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState();
    const [loading, setLoading] = useState(false);
    const [chanelPartnerListData, setChanelPartnerListData] = useState([]);

    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
        totalPage: 1
    });
    const [search, setSearch] = useState("");

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
            width: 120,
            renderCell: (params) => (
                <>
                    <Tooltip title="Edit">
                        <Link to={`/channel-partners/edit/${params.id}`}>
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
        refetch: fetchChannelPartnerList
    } = useQuery({
        queryKey: ["partner-list", pagination, "CHANNEL_PARTNER", search],
        queryFn: () => {
            const payload = {
                page: pagination.page,
                limit: pagination.limit,
                role: "CHANNEL_PARTNER"
            };

            return channelPartnersListApiPayload(payload);
        },
        Loadingd: loading,
        staleTime: 0,
        refetchOnMount: true
    });

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
        console.log(channelPartnerList)
        if (channelPartnerList?.data?.length) {
            const data = channelPartnerList.data.map((item) => ({
                id: item.id,
                name: item.name || "-",
                intent: item.intent,
                isActive: item.isActive ? "Yes" : "No",
                createdAt: format(parseISO(item.createdAt), 'dd/MM/yyyy'),
                email: item.email,
                businessSince: item.businessSince,
                phone: item.phone
            }));

            setChanelPartnerListData(data);
        }
        if (channelPartnerList?.pagination) {
            const { limit, page, totalPage } = channelPartnerList.pagination;
            setPagination((prev) => ({
                ...prev,
                limit,
                page,
                totalPage
            }));
        }
    }, [channelPartnerList]);

    return (
        <MainWrapper>
            <PageTitle title={"Channel Partners"} />
            <CustomDataGrid
                columns={columns}
                rows={chanelPartnerListData}
                loading={loading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                rowCount={channelPartnerList?.total}
                style={{ height: "calc(100vh - 180px)" }}
            />
        </MainWrapper>
    )
}

export default ChannelPartnerListing