import { use, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import ListFilter from "./filter";
import PropertiesTable from "./list";
import { decodeFilters } from "../../lib/helper";
import { propertyListApiPayload } from "../../services/postProperty";
import { Building2, MonitorCheck, ShieldCheck, ShieldQuestionMark } from "lucide-react";
import CustomPopover from "../common/popover";
import { set } from "react-hook-form";

export const defaultFilters = {
  propertyTypeIds: [],
  categoryIds: [],
  listingTypeIds: [],
  furnishingTypes: [],
  projectStatuses: [],
  statuses: [],
  minPrice: 0,
  maxPrice: 10000000,
  search: ""
};

export default function ContentLayout() {
  const [searchParams] = useSearchParams();
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false)
  const [enable, setEnable] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [propertyStats, setPropertyStats] = useState([
    {
      title: "Total Properties",
      count: 2000,
      icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
    },
    {
      title: "Active Properties",
      count: 1800,
      icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
    },
    {
      title: "Pending Properties",
      count: 200,
      icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
    },
    {
      title: "Verified Properties",
      count: 1500,
      icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
    },
  ]);

  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalPage: 1
  });

  const [sorting, setSorting] = useState({
    order: "ASC",
    fieldName: "createdAt"
  });

  const [search, setSearch] = useState("");

  const {
    data: propertyList,
    refetch: fetchPropertyList,
    isLoading
  } = useQuery({
    queryKey: ["property-list", filters, pagination, sorting, search],
    queryFn: () => {
      const payload = {
        page: pagination.page,
        limit: pagination.limit,
        // ...(filters.propertyTypeIds.length > 0 && {
        //   propertyTypeIds: filters.propertyTypeIds.join(",")
        // }),
        // ...(filters.listingTypeIds.length > 0 && {
        //   listingTypeIds: filters.listingTypeIds.join(",")
        // }),
        // ...(filters.furnishingTypes.length > 0 && {
        //   furnishingTypes: filters.furnishingTypes.join(",")
        // }),
        // ...(filters.projectStatuses.length > 0 && {
        //   projectStatuses: filters.projectStatuses.join(",")
        // }),
        ...(filters.statuses.length > 0 && {
          statuses: filters.statuses.join(",")
        }),
        // minPrice: String(filters.minPrice),
        // maxPrice: String(filters.maxPrice),
        // search,
        // sortOrder: sorting.order,
        // sortBy: sorting.fieldName
      };

      return propertyListApiPayload(payload);
    },
    enabled: enable,
    staleTime: 0,
    refetchOnMount: true
  });

  useEffect(() => {
    const query = searchParams.get("filters");
    if (query) {
      const parsed = decodeFilters(query);
      if (parsed) setFilters(parsed);
    }
    setEnable(true);
  }, [searchParams]);

  useEffect(() => {
    if (propertyList?.pagination) {
      const { limit, page, totalPage } = propertyList.pagination;
      setPagination((prev) => ({
        ...prev,
        limit,
        page,
        totalPage
      }));
    }
  }, [propertyList]);

  const openFilterPopup = (e) => {
    setIsFilterPopupOpen(e.currentTarget);
  }

  useEffect(() => {
    if (propertyList?.summary) {
      const stats = [
        {
          title: "Total Properties",
          count: propertyList.summary.totalProperties,
          icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
        {
          title: "Active Properties",
          count: propertyList.summary.activeProperties,
          icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
        {
          title: "Pending Properties",
          count: propertyList.summary.pendingProperties,
          icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
        {
          title: "Verified Properties",
          count: propertyList.summary.verifiedProperties,
          icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
        },
      ]
      setPropertyStats(stats)
    }
  }, [propertyList])

  return (
    <div
      className="bg-[#F9F9F9] relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
    >
      <div className="pt-4 p-5">
        <div className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-5 pt-3">
              {
                propertyStats.map((stat) => (
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
            {/* <ListFilter
              statusData={propertyList?.summary ?? {}}
              filters={filters}
              setFilters={setFilters}
            /> */}

            <PropertiesTable
              openFilterPopup={openFilterPopup}
              propertyList={propertyList?.data ?? []}
              propertyData={propertyList}
              fetchPropertyList={fetchPropertyList}
              isLoading={isLoading}
              // setSearch={setSearch}
              // setSorting={setSorting}
              // sorting={sorting}
              // search={search}
              pagination={pagination}
              setPagination={setPagination}
            />
            <CustomPopover
              anchorEl={isFilterPopupOpen}
              onClose={() => setIsFilterPopupOpen(null)}
            >
              <ListFilter
                statusData={propertyList?.summary ?? {}}
                filters={filters}
                setFilters={setFilters}
              />
            </CustomPopover>
          </div>
        </div>
      </div>
    </div>
  );
}
