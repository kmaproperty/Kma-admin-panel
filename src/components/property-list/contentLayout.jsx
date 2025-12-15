import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import ListFilter from "./filter";
import PropertiesTable from "./list";
import { decodeFilters } from "../../lib/helper";
import { propertyListApiPayload } from "../../services/postProperty";

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

  const [enable, setEnable] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

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
    refetch: fetchPropertyList
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

  return (
    <div
      className="bg-white relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
    >
      <div className="pt-4 p-5">
        <div className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 gap-4">
            <ListFilter
              statusData={propertyList?.summary ?? {}}
              filters={filters}
              setFilters={setFilters}
            />

            <PropertiesTable
              propertyList={propertyList?.data ?? []}
              propertyData={propertyList}
              fetchPropertyList={fetchPropertyList}
              // setSearch={setSearch}
              // setSorting={setSorting}
              // sorting={sorting}
              // search={search}
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
