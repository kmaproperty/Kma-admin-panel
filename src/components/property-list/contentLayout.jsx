// import { use, useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";

// import ListFilter from "./filter";
// import PropertiesTable from "./list";
// import { decodeFilters } from "../../lib/helper";
// import { propertyListApiPayload } from "../../services/postProperty";
// import { Building2, MonitorCheck, Search, ShieldCheck, ShieldQuestionMark } from "lucide-react";
// import CustomPopover from "../common/popover";
// import { set } from "react-hook-form";

// export const defaultFilters = {
//   propertyTypeIds: [],
//   categoryIds: [],
//   listingTypeIds: [],
//   furnishingTypes: [],
//   projectStatuses: [],
//   statuses: [],
//   minPrice: 0,
//   maxPrice: 10000000,
//   search: ""
// };

// export default function ContentLayout() {
//   const [searchParams] = useSearchParams();
//   const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false)
//   const [enable, setEnable] = useState(false);
//   const [filters, setFilters] = useState(defaultFilters);
//   const [propertyStats, setPropertyStats] = useState([
//     {
//       title: "Total Properties",
//       count: 2000,
//       icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//     },
//     {
//       title: "Active Properties",
//       count: 1800,
//       icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//     },
//     {
//       title: "Pending Properties",
//       count: 200,
//       icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//     },
//     {
//       title: "Verified Properties",
//       count: 1500,
//       icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//     },
//   ]);

//   const [pagination, setPagination] = useState({
//     limit: 10,
//     page: 1,
//     totalPage: 1
//   });

//   const [sorting, setSorting] = useState({
//     order: "ASC",
//     fieldName: "createdAt"
//   });

//   const [search, setSearch] = useState("");

//   const {
//     data: propertyList,
//     refetch: fetchPropertyList,
//     isLoading
//   } = useQuery({
//     queryKey: ["property-list", filters, pagination, sorting, search],
//     queryFn: () => {
//       const payload = {
//         page: pagination.page,
//         limit: pagination.limit,
//         ...(filters.listingTypeIds.length > 0 && {
//           listingTypeIds: filters.listingTypeIds.join(",")
//         }),
//         ...(filters.categoryIds.length > 0 && {
//           categoryIds: filters.categoryIds.join(",")
//         }),
//         ...(filters.furnishingTypes.length > 0 && {
//           furnishingTypes: filters.furnishingTypes.join(",")
//         }),
//         ...(filters.statuses.length > 0 && {
//           statuses: filters.statuses.join(",")
//         }),
//       };

//       return propertyListApiPayload(payload);
//     },
//     enabled: enable,
//     staleTime: 0,
//     refetchOnMount: true
//   });

//   useEffect(() => {
//     const query = searchParams.get("filters");
//     if (query) {
//       const parsed = decodeFilters(query);
//       if (parsed) setFilters(parsed);
//     }
//     setEnable(true);
//   }, [searchParams]);

//   useEffect(() => {
//     if (propertyList?.pagination) {
//       const { limit, page, totalPage } = propertyList.pagination;
//       setPagination((prev) => ({
//         ...prev,
//         limit,
//         page,
//         totalPage
//       }));
//     }
//   }, [propertyList]);

//   const openFilterPopup = (e) => {
//     setIsFilterPopupOpen(e.currentTarget);
//   }

//   useEffect(() => {
//     if (propertyList?.summary) {
//       const stats = [
//         {
//           title: "Total Properties",
//           count: propertyList.summary.totalProperties,
//           icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//         {
//           title: "Active Properties",
//           count: propertyList.summary.activeProperties,
//           icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//         {
//           title: "Pending Properties",
//           count: propertyList.summary.pendingProperties,
//           icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//         {
//           title: "Verified Properties",
//           count: propertyList.summary.verifiedProperties,
//           icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//       ]
//       setPropertyStats(stats)
//     }
//   }, [propertyList])

//   return (
//     <div
//       className="bg-[#F9F9F9] relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl"
//       style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
//     >
//       <div className="pt-4 p-5">
//         <div className="flex flex-col gap-6 w-full">
//           <div className="grid grid-cols-1 gap-4">
//             <div className="flex gap-5 pt-3">
//               {
//                 propertyStats.map((stat) => (
//                   <div className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
//                     <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50 mb-2">
//                       {stat.icon}
//                     </div>
//                     <div className="text-right w-full">
//                       <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
//                       <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
//                     </div>
//                   </div>
//                 ))
//               }
//             </div>
//             {/* <ListFilter
//               statusData={propertyList?.summary ?? {}}
//               filters={filters}
//               setFilters={setFilters}
//             /> */}

//             <div className="relative flex-1 min-w-[220px] max-w-md">
//             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-gray" />
//             <input
//               type="text"
//               placeholder="Search by society, locality, city…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full h-10 rounded-full border border-border pl-10 pr-4 text-sm focus:border-blue focus:outline-none"
//             />
//           </div>
//             <PropertiesTable
//               openFilterPopup={openFilterPopup}
//               propertyList={propertyList?.data ?? []}
//               propertyData={propertyList}
//               fetchPropertyList={fetchPropertyList}
//               isLoading={isLoading}
//               // setSearch={setSearch}
//               // setSorting={setSorting}
//               // sorting={sorting}
//               // search={search}
//               pagination={pagination}
//               setPagination={setPagination}
//             />

//             <CustomPopover
//               anchorEl={isFilterPopupOpen}
//               onClose={() => setIsFilterPopupOpen(null)}
//             >
//               <ListFilter
//                 statusData={propertyList?.summary ?? {}}
//                 filters={filters}
//                 setFilters={setFilters}
//               />
//             </CustomPopover>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";

// import ListFilter from "./filter";
// import PropertiesTable from "./list";
// import { decodeFilters } from "../../lib/helper";
// import { propertyListApiPayload } from "../../services/postProperty";
// import { Building2, MonitorCheck, Search, ShieldCheck, ShieldQuestionMark } from "lucide-react";
// import CustomPopover from "../common/popover";

// export const defaultFilters = {
//   propertyTypeIds: [],
//   categoryIds: [],
//   listingTypeIds: [],
//   furnishingTypes: [],
//   projectStatuses: [],
//   statuses: [],
//   minPrice: 0,
//   maxPrice: 10000000,
// };

// export default function ContentLayout() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(null);
//   const [enableQuery, setEnableQuery] = useState(false);
//   const [filters, setFilters] = useState(defaultFilters);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");

//   const initialPageFromUrl = Number(searchParams.get("page")) || 1;

//   const [pagination, setPagination] = useState({
//     limit: 10,
//     page: initialPageFromUrl,
//     totalPage: 1,
//   });

//   const previousPageRef = useRef(initialPageFromUrl);

//   const [propertyStats, setPropertyStats] = useState([
//     { title: "Total Properties", count: 0, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Active Properties", count: 0, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Pending Properties", count: 0, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Verified Properties", count: 0, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//   ]);

//   const [sorting, setSorting] = useState({
//     order: "ASC",
//     fieldName: "createdAt",
//   });

//   const {
//     data: propertyList,
//     refetch: fetchPropertyList,
//     isLoading,
//   } = useQuery({
//     queryKey: ["property-list-all", filters, sorting],
//     queryFn: () => {
//       const payload = {
//         page: 1,
//         limit: 10000,
//         ...(filters.listingTypeIds.length > 0 && {
//           listingTypeIds: filters.listingTypeIds.join(","),
//         }),
//         ...(filters.categoryIds.length > 0 && {
//           categoryIds: filters.categoryIds.join(","),
//         }),
//         ...(filters.furnishingTypes.length > 0 && {
//           furnishingTypes: filters.furnishingTypes.join(","),
//         }),
//         ...(filters.statuses.length > 0 && {
//           statuses: filters.statuses.join(","),
//         }),
//       };

//       return propertyListApiPayload(payload);
//     },
//     enabled: enableQuery,
//     staleTime: 1000 * 60 * 5,
//     refetchOnMount: true,
//   });

//   useEffect(() => {
//     const query = searchParams.get("filters");
//     if (query) {
//       const parsed = decodeFilters(query);
//       if (parsed) setFilters(parsed);
//     }
//     setEnableQuery(true);
//   }, [searchParams]);

//   useEffect(() => {
//     if (propertyList?.summary) {
//       const stats = [
//         {
//           title: "Total Properties",
//           count: propertyList.summary.totalProperties,
//           icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//         {
//           title: "Active Properties",
//           count: propertyList.summary.activeProperties,
//           icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//         {
//           title: "Pending Properties",
//           count: propertyList.summary.pendingProperties,
//           icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//         {
//           title: "Verified Properties",
//           count: propertyList.summary.verifiedProperties,
//           icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} />,
//         },
//       ];
//       setPropertyStats(stats);
//     }
//   }, [propertyList]);

//   const allFilteredProperties = useMemo(() => {
//     const rawDataList = propertyList?.data ?? [];
//     const lowerCaseSearch = searchQuery.trim().toLowerCase();

//     return rawDataList.filter((item) => {
//       if (statusFilter && item?.status !== statusFilter) {
//         return false;
//       }

//       if (!lowerCaseSearch) return true;

//       const ownerName = (item?.owner?.name || "").toLowerCase();
//       const ownerEmail = (item?.owner?.email || "").toLowerCase();
//       const ownerPhone = (item?.owner?.phone || "").toLowerCase();
//       const postedByMatch =
//         ownerName.includes(lowerCaseSearch) ||
//         ownerEmail.includes(lowerCaseSearch) ||
//         ownerPhone.includes(lowerCaseSearch);

//       const categoryName = (item?.category?.name || "").toLowerCase();
//       const propertyTypeName = (item?.propertyType?.name || "").toLowerCase();
//       const listingTypeName = (item?.listingType?.name || "").toLowerCase();
//       const categoryTypeMatch =
//         categoryName.includes(lowerCaseSearch) ||
//         propertyTypeName.includes(lowerCaseSearch) ||
//         listingTypeName.includes(lowerCaseSearch);

//       const societyName = (item?.society?.name || "").toLowerCase();
//       const localityName = (item?.locality?.name || "").toLowerCase();
//       const cityName = (item?.city?.name || "").toLowerCase();
//       const fullAddress = (item?.society?.address || "").toLowerCase();
//       const bhkName = (item?.bhkType?.name || "").toLowerCase();
//       const locationMatch =
//         societyName.includes(lowerCaseSearch) ||
//         localityName.includes(lowerCaseSearch) ||
//         cityName.includes(lowerCaseSearch) ||
//         fullAddress.includes(lowerCaseSearch) ||
//         bhkName.includes(lowerCaseSearch);

//       const propertyDescription = (item?.propertyDescription || "").toLowerCase();
//       const descMatch = propertyDescription.includes(lowerCaseSearch);

//       return postedByMatch || categoryTypeMatch || locationMatch || descMatch;
//     });
//   }, [propertyList?.data, searchQuery, statusFilter]);

//   useEffect(() => {
//     const totalItems = allFilteredProperties.length;
//     const totalPageCount = Math.max(1, Math.ceil(totalItems / pagination.limit));

//     setPagination((prev) => {
//       let targetPage = prev.page;

//       if (searchQuery.trim() !== "") {
//         targetPage = 1;
//       } else {
//         targetPage = Math.min(previousPageRef.current, totalPageCount);
//       }

//       return {
//         ...prev,
//         page: targetPage,
//         totalPage: totalPageCount,
//       };
//     });
//   }, [allFilteredProperties.length, searchQuery, statusFilter, pagination.limit]);

//   const handlePageChange = (newPage) => {
//     previousPageRef.current = newPage;
//     setPagination((prev) => ({ ...prev, page: newPage }));

//     setSearchParams((prevParams) => {
//       const updated = new URLSearchParams(prevParams);
//       updated.set("page", newPage.toString());
//       return updated;
//     });
//   };

//   const paginatedResultsForTable = useMemo(() => {
//     const startIndex = (pagination.page - 1) * pagination.limit;
//     return allFilteredProperties.slice(startIndex, startIndex + pagination.limit);
//   }, [allFilteredProperties, pagination.page, pagination.limit]);

//   const openFilterPopup = (e) => {
//     setIsFilterPopupOpen(e.currentTarget);
//   };

//   return (
//     <div
//       className="bg-[#F9F9F9] relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl p-5 pt-4"
//       style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
//     >
//       <div className="flex flex-col gap-6 w-full">
//         <div className="grid grid-cols-1 gap-4">
//           <div className="flex gap-5 pt-3">
//             {propertyStats.map((stat, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
//                 <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50">
//                   {stat.icon}
//                 </div>
//                 <div className="text-right w-full">
//                   <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
//                   <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-wrap items-center justify-between">
//             <div className="relative flex-1 min-w-[280px] max-w-md">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by Channel Partner, Society, Category..."
//                 value={searchQuery}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (!searchQuery && val) {
//                     previousPageRef.current = pagination.page;
//                   }
//                   setSearchQuery(val);
//                 }}
//                 className="w-full h-10 rounded-full border border-gray-200 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
//               />
//             </div>

//             <select
//               value={statusFilter}
//               onChange={(e) => {
//                 setStatusFilter(e.target.value);
//                 setPagination((prev) => ({ ...prev, page: 1 }));
//               }}
//               className="h-10 rounded-full border border-gray-200 px-4 text-sm bg-white cursor-pointer focus:border-indigo-500 focus:outline-none shadow-sm text-gray-700"
//             >
//               <option value="">All statuses</option>
//               <option value="active">Active</option>
//               <option value="pending_review">Pending Review</option>
//               <option value="draft">Draft</option>
//               <option value="rejected">Rejected</option>
//               <option value="deactivated">Deactivated</option>
//             </select>
//           </div>

//           <PropertiesTable
//             openFilterPopup={openFilterPopup}
//             propertyList={paginatedResultsForTable}
//             propertyData={{
//               ...propertyList,
//               data: paginatedResultsForTable,
//               total: allFilteredProperties.length,
//               pagination: {
//                 ...pagination,
//                 total: allFilteredProperties.length,
//               },
//             }}
//             fetchPropertyList={fetchPropertyList}
//             isLoading={isLoading}
//             pagination={pagination}
//             setPagination={(updater) => {
//               if (typeof updater === "function") {
//                 setPagination((prev) => {
//                   const nextState = updater(prev);
//                   if (nextState.page !== prev.page) {
//                     handlePageChange(nextState.page);
//                   }
//                   return nextState;
//                 });
//               } else {
//                 handlePageChange(updater.page);
//               }
//             }}
//           />

//           <CustomPopover
//             anchorEl={isFilterPopupOpen}
//             onClose={() => setIsFilterPopupOpen(null)}
//           >
//             <ListFilter
//               statusData={propertyList?.summary ?? {}}
//               filters={filters}
//               setFilters={setFilters}
//             />
//           </CustomPopover>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";

// import ListFilter from "./filter";
// import PropertiesTable from "./list";
// import { decodeFilters } from "../../lib/helper";
// import { propertyListApiPayload } from "../../services/postProperty";
// import { Building2, MonitorCheck, Search, ShieldCheck, ShieldQuestionMark } from "lucide-react";
// import CustomPopover from "../common/popover";

// export const defaultFilters = {
//   propertyTypeIds: [],
//   categoryIds: [],
//   listingTypeIds: [],
//   furnishingTypes: [],
//   projectStatuses: [],
//   statuses: [],
//   minPrice: 0,
//   maxPrice: 10000000,
// };

// export default function ContentLayout() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(null);
//   const [enableQuery, setEnableQuery] = useState(false);
//   const [filters, setFilters] = useState(defaultFilters);
  
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");

//   const initialPageFromUrl = Number(searchParams.get("page")) || 1;

//   const [pagination, setPagination] = useState({
//     limit: 10,
//     page: initialPageFromUrl,
//     totalPage: 1,
//   });

//   const previousPageRef = useRef(initialPageFromUrl);

//   const [propertyStats, setPropertyStats] = useState([
//     { title: "Total Properties", count: 0, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Active Properties", count: 0, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Pending Properties", count: 0, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Verified Properties", count: 0, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//   ]);

//   const [sorting, setSorting] = useState({
//     order: "ASC",
//     fieldName: "createdAt",
//   });

//   const {
//     data: propertyList,
//     refetch: fetchPropertyList,
//     isLoading: isNormalLoading,
//   } = useQuery({
//     queryKey: ["property-list-paginated", filters, sorting, pagination.page, pagination.limit, statusFilter],
//     queryFn: () => {
//       const activeStatuses = statusFilter 
//         ? statusFilter 
//         : filters.statuses.length > 0 
//           ? filters.statuses.join(",") 
//           : undefined;

//       const payload = {
//         page: pagination.page,
//         limit: pagination.limit,
//         ...(filters.listingTypeIds.length > 0 && { listingTypeIds: filters.listingTypeIds.join(",") }),
//         ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(",") }),
//         ...(filters.furnishingTypes.length > 0 && { furnishingTypes: filters.furnishingTypes.join(",") }),
//         ...(activeStatuses && { statuses: activeStatuses }),
//       };

//       return propertyListApiPayload(payload);
//     },
//     enabled: enableQuery,
//     staleTime: 1000 * 60 * 2,
//     refetchOnMount: true,
//   });

//   const { data: allDatabaseProperties = [] } = useQuery({
//     queryKey: ["all-database-properties", filters, statusFilter, propertyList?.total],
//     queryFn: async () => {
//       const total = propertyList?.total || 100;
//       const batchLimit = 100;
//       const totalBatches = Math.ceil(total / batchLimit);

//       const activeStatuses = statusFilter 
//         ? statusFilter 
//         : filters.statuses.length > 0 
//           ? filters.statuses.join(",") 
//           : undefined;

//       const promises = [];
//       for (let i = 1; i <= totalBatches; i++) {
//         promises.push(
//           propertyListApiPayload({
//             page: i,
//             limit: batchLimit,
//             ...(filters.listingTypeIds.length > 0 && { listingTypeIds: filters.listingTypeIds.join(",") }),
//             ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(",") }),
//             ...(filters.furnishingTypes.length > 0 && { furnishingTypes: filters.furnishingTypes.join(",") }),
//             ...(activeStatuses && { statuses: activeStatuses }),
//           })
//         );
//       }

//       const results = await Promise.all(promises);
//       const combined = results.flatMap((res) => res?.data || []);
//       return combined;
//     },
//     enabled: !!propertyList?.total,
//     staleTime: 1000 * 60 * 5,
//   });

//   useEffect(() => {
//     const query = searchParams.get("filters");
//     if (query) {
//       const parsed = decodeFilters(query);
//       if (parsed) setFilters(parsed);
//     }
//     setEnableQuery(true);
//   }, [searchParams]);

//   useEffect(() => {
//     if (propertyList?.summary) {
//       const stats = [
//         { title: "Total Properties", count: propertyList.summary.totalProperties, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//         { title: "Active Properties", count: propertyList.summary.activeProperties, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//         { title: "Pending Properties", count: propertyList.summary.pendingProperties, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//         { title: "Verified Properties", count: propertyList.summary.verifiedProperties, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//       ];
//       setPropertyStats(stats);
//     }
//   }, [propertyList]);

//   const fullFilteredSearchResults = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     if (!q) return null;

//     return allDatabaseProperties.filter((item) => {
//       const ownerName = (item?.owner?.name || "").toLowerCase();
//       const ownerEmail = (item?.owner?.email || "").toLowerCase();
//       const ownerPhone = (item?.owner?.phone || "").toLowerCase();
//       const postedByMatch = ownerName.includes(q) || ownerEmail.includes(q) || ownerPhone.includes(q);

//       const categoryName = (item?.category?.name || "").toLowerCase();
//       const propertyTypeName = (item?.propertyType?.name || "").toLowerCase();
//       const listingTypeName = (item?.listingType?.name || "").toLowerCase();
//       const categoryTypeMatch = categoryName.includes(q) || propertyTypeName.includes(q) || listingTypeName.includes(q);

//       const societyName = (item?.society?.name || "").toLowerCase();
//       const localityName = (item?.locality?.name || "").toLowerCase();
//       const cityName = (item?.city?.name || "").toLowerCase();
//       const fullAddress = (item?.society?.address || "").toLowerCase();
//       const bhkName = (item?.bhkType?.name || "").toLowerCase();
//       const locationMatch =
//         societyName.includes(q) ||
//         localityName.includes(q) ||
//         cityName.includes(q) ||
//         fullAddress.includes(q) ||
//         bhkName.includes(q);

//       const propertyDescription = (item?.propertyDescription || "").toLowerCase();
//       const descMatch = propertyDescription.includes(q);

//       return postedByMatch || categoryTypeMatch || locationMatch || descMatch;
//     });
//   }, [allDatabaseProperties, searchQuery]);

//   useEffect(() => {
//     if (searchQuery.trim() !== "" && fullFilteredSearchResults) {
//       const searchTotal = fullFilteredSearchResults.length;
//       const totalPages = Math.max(1, Math.ceil(searchTotal / pagination.limit));
//       setPagination((prev) => ({
//         ...prev,
//         page: 1,
//         totalPage: totalPages,
//       }));
//     } else if (propertyList?.total !== undefined) {
//       const totalCount = propertyList.total;
//       const totalPages = Math.max(1, Math.ceil(totalCount / pagination.limit));
//       setPagination((prev) => ({
//         ...prev,
//         page: previousPageRef.current,
//         totalPage: totalPages,
//       }));
//     }
//   }, [searchQuery, fullFilteredSearchResults, propertyList?.total, pagination.limit]);

//   const currentTableRows = useMemo(() => {
//     if (searchQuery.trim() !== "" && fullFilteredSearchResults) {
//       const startIndex = (pagination.page - 1) * pagination.limit;
//       return fullFilteredSearchResults.slice(startIndex, startIndex + pagination.limit);
//     }
//     return propertyList?.data ?? [];
//   }, [searchQuery, fullFilteredSearchResults, propertyList?.data, pagination.page, pagination.limit]);

//   const totalCountForTable = useMemo(() => {
//     if (searchQuery.trim() !== "" && fullFilteredSearchResults) {
//       return fullFilteredSearchResults.length;
//     }
//     return propertyList?.total || 0;
//   }, [searchQuery, fullFilteredSearchResults, propertyList?.total]);

//   const handlePageChange = (newPage) => {
//     previousPageRef.current = newPage;
//     setPagination((prev) => ({ ...prev, page: newPage }));

//     setSearchParams((prevParams) => {
//       const updated = new URLSearchParams(prevParams);
//       updated.set("page", newPage.toString());
//       return updated;
//     });
//   };

//   const openFilterPopup = (e) => {
//     setIsFilterPopupOpen(e.currentTarget);
//   };

//   return (
//     <div
//       className="bg-[#F9F9F9] relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl p-5 pt-4"
//       style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
//     >
//       <div className="flex flex-col gap-6 w-full">
//         <div className="grid grid-cols-1 gap-4">
//           <div className="flex gap-5 pt-3">
//             {propertyStats.map((stat, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
//                 <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50">
//                   {stat.icon}
//                 </div>
//                 <div className="text-right w-full">
//                   <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
//                   <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-wrap items-center justify-between">
//             <div className="relative flex-1 min-w-[280px] max-w-md">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search across all properties, owners, societies..."
//                 value={searchQuery}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (!searchQuery && val) {
//                     previousPageRef.current = pagination.page;
//                   }
//                   setSearchQuery(val);
//                 }}
//                 className="w-full h-10 rounded-full border border-gray-200 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
//               />
//             </div>

//             <select
//               value={statusFilter}
//               onChange={(e) => {
//                 setStatusFilter(e.target.value);
//                 setPagination((prev) => ({ ...prev, page: 1 }));
//                 setSearchParams((prevParams) => {
//                   const updated = new URLSearchParams(prevParams);
//                   updated.set("page", "1");
//                   return updated;
//                 });
//               }}
//               className="h-10 rounded-full border border-gray-200 px-4 text-sm bg-white cursor-pointer focus:border-indigo-500 focus:outline-none shadow-sm text-gray-700"
//             >
//               <option value="">All statuses</option>
//               <option value="active">Active</option>
//               <option value="pending_review">Pending Review</option>
//               <option value="draft">Draft</option>
//               <option value="rejected">Rejected</option>
//               <option value="deactivated">Deactivated</option>
//             </select>
//           </div>

//           <PropertiesTable
//             openFilterPopup={openFilterPopup}
//             propertyList={currentTableRows}
//             propertyData={{
//               ...propertyList,
//               data: currentTableRows,
//               total: totalCountForTable,
//               pagination: {
//                 ...pagination,
//                 total: totalCountForTable,
//               },
//             }}
//             fetchPropertyList={fetchPropertyList}
//             isLoading={isNormalLoading}
//             pagination={pagination}
//             setPagination={(updater) => {
//               if (typeof updater === "function") {
//                 setPagination((prev) => {
//                   const nextState = updater(prev);
//                   if (nextState.page !== prev.page) {
//                     handlePageChange(nextState.page);
//                   }
//                   return nextState;
//                 });
//               } else {
//                 handlePageChange(updater.page);
//               }
//             }}
//           />

//           <CustomPopover
//             anchorEl={isFilterPopupOpen}
//             onClose={() => setIsFilterPopupOpen(null)}
//           >
//             <ListFilter
//               statusData={propertyList?.summary ?? {}}
//               filters={filters}
//               setFilters={setFilters}
//             />
//           </CustomPopover>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";

// import ListFilter from "./filter";
// import PropertiesTable from "./list";
// import { decodeFilters } from "../../lib/helper";
// import { propertyListApiPayload } from "../../services/postProperty";
// import { Building2, MonitorCheck, Search, ShieldCheck, ShieldQuestionMark } from "lucide-react";
// import CustomPopover from "../common/popover";

// export const defaultFilters = {
//   propertyTypeIds: [],
//   categoryIds: [],
//   listingTypeIds: [],
//   furnishingTypes: [],
//   projectStatuses: [],
//   statuses: [],
//   minPrice: 0,
//   maxPrice: 10000000,
// };

// export default function ContentLayout() {
//   const [searchParams] = useSearchParams();
//   const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(null);
//   const [enableQuery, setEnableQuery] = useState(false);
//   const [filters, setFilters] = useState(defaultFilters);
  
//   const [searchQuery, setSearchQuery] = useState("");

//   const [statusFilter, setStatusFilter] = useState(() => {
//     return localStorage.getItem("admin_property_status_filter") || "";
//   });

//   const [pagination, setPagination] = useState(() => {
//     const savedPage = Number(localStorage.getItem("admin_property_page_number")) || 1;
//     return {
//       limit: 10,
//       page: savedPage,
//       totalPage: 1,
//     };
//   });

//   const [propertyStats, setPropertyStats] = useState([
//     { title: "Total Properties", count: 0, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Active Properties", count: 0, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Pending Properties", count: 0, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//     { title: "Verified Properties", count: 0, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//   ]);

//   const [sorting, setSorting] = useState({
//     order: "ASC",
//     fieldName: "createdAt",
//   });

//   const {
//     data: propertyList,
//     refetch: fetchPropertyList,
//     isLoading: isNormalLoading,
//   } = useQuery({
//     queryKey: ["property-list-paginated", filters, sorting, pagination.page, pagination.limit, statusFilter],
//     queryFn: () => {
//       const activeStatuses = statusFilter 
//         ? statusFilter 
//         : filters.statuses.length > 0 
//           ? filters.statuses.join(",") 
//           : undefined;

//       const payload = {
//         page: pagination.page,
//         limit: pagination.limit,
//         ...(filters.listingTypeIds.length > 0 && { listingTypeIds: filters.listingTypeIds.join(",") }),
//         ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(",") }),
//         ...(filters.furnishingTypes.length > 0 && { furnishingTypes: filters.furnishingTypes.join(",") }),
//         ...(activeStatuses && { statuses: activeStatuses }),
//       };

//       return propertyListApiPayload(payload);
//     },
//     enabled: enableQuery,
//     staleTime: 1000 * 60 * 2,
//     refetchOnMount: true,
//   });

//   const { data: allDatabaseProperties = [] } = useQuery({
//     queryKey: ["all-database-properties", filters, statusFilter, propertyList?.total],
//     queryFn: async () => {
//       const total = propertyList?.total || 100;
//       const batchLimit = 100;
//       const totalBatches = Math.ceil(total / batchLimit);

//       const activeStatuses = statusFilter 
//         ? statusFilter 
//         : filters.statuses.length > 0 
//           ? filters.statuses.join(",") 
//           : undefined;

//       const promises = [];
//       for (let i = 1; i <= totalBatches; i++) {
//         promises.push(
//           propertyListApiPayload({
//             page: i,
//             limit: batchLimit,
//             ...(filters.listingTypeIds.length > 0 && { listingTypeIds: filters.listingTypeIds.join(",") }),
//             ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(",") }),
//             ...(filters.furnishingTypes.length > 0 && { furnishingTypes: filters.furnishingTypes.join(",") }),
//             ...(activeStatuses && { statuses: activeStatuses }),
//           })
//         );
//       }

//       const results = await Promise.all(promises);
//       return results.flatMap((res) => res?.data || []);
//     },
//     enabled: !!propertyList?.total && searchQuery.trim() !== "",
//     staleTime: 1000 * 60 * 5,
//   });

//   useEffect(() => {
//     const query = searchParams.get("filters");
//     if (query) {
//       const parsed = decodeFilters(query);
//       if (parsed) setFilters(parsed);
//     }
//     setEnableQuery(true);
//   }, [searchParams]);

//   useEffect(() => {
//     if (propertyList?.summary) {
//       const stats = [
//         { title: "Total Properties", count: propertyList.summary.totalProperties, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//         { title: "Active Properties", count: propertyList.summary.activeProperties, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//         { title: "Pending Properties", count: propertyList.summary.pendingProperties, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//         { title: "Verified Properties", count: propertyList.summary.verifiedProperties, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
//       ];
//       setPropertyStats(stats);
//     }
//   }, [propertyList]);

//   const fullFilteredSearchResults = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     if (!q) return null;

//     return allDatabaseProperties.filter((item) => {
//       const ownerName = (item?.owner?.name || "").toLowerCase();
//       const ownerEmail = (item?.owner?.email || "").toLowerCase();
//       const ownerPhone = (item?.owner?.phone || "").toLowerCase();
//       const postedByMatch = ownerName.includes(q) || ownerEmail.includes(q) || ownerPhone.includes(q);

//       const categoryName = (item?.category?.name || "").toLowerCase();
//       const propertyTypeName = (item?.propertyType?.name || "").toLowerCase();
//       const listingTypeName = (item?.listingType?.name || "").toLowerCase();
//       const categoryTypeMatch = categoryName.includes(q) || propertyTypeName.includes(q) || listingTypeName.includes(q);

//       const societyName = (item?.society?.name || "").toLowerCase();
//       const localityName = (item?.locality?.name || "").toLowerCase();
//       const cityName = (item?.city?.name || "").toLowerCase();
//       const fullAddress = (item?.society?.address || "").toLowerCase();
//       const bhkName = (item?.bhkType?.name || "").toLowerCase();
//       const locationMatch =
//         societyName.includes(q) ||
//         localityName.includes(q) ||
//         cityName.includes(q) ||
//         fullAddress.includes(q) ||
//         bhkName.includes(q);

//       const propertyDescription = (item?.propertyDescription || "").toLowerCase();
//       const descMatch = propertyDescription.includes(q);

//       return postedByMatch || categoryTypeMatch || locationMatch || descMatch;
//     });
//   }, [allDatabaseProperties, searchQuery]);

//   useEffect(() => {
//     if (propertyList?.total) {
//       const newTotalPages = Math.max(1, Math.ceil(propertyList.total / pagination.limit));
//       setPagination((prev) => {
//         if (prev.totalPage === newTotalPages) return prev;
//         return { ...prev, totalPage: newTotalPages };
//       });
//     }
//   }, [propertyList?.total, pagination.limit]);

//   const isSearchActive = searchQuery.trim() !== "";
  
//   const currentTableRows = useMemo(() => {
//     if (isSearchActive && fullFilteredSearchResults) {
//       const startIndex = (pagination.page - 1) * pagination.limit;
//       return fullFilteredSearchResults.slice(startIndex, startIndex + pagination.limit);
//     }
//     return propertyList?.data ?? [];
//   }, [isSearchActive, fullFilteredSearchResults, propertyList?.data, pagination.page, pagination.limit]);

//   const totalCountForTable = useMemo(() => {
//     if (isSearchActive && fullFilteredSearchResults) {
//       return fullFilteredSearchResults.length;
//     }
//     return propertyList?.total || 0;
//   }, [isSearchActive, fullFilteredSearchResults, propertyList?.total]);

//   const handleStatusChange = (newStatus) => {
//     setStatusFilter(newStatus);
//     localStorage.setItem("admin_property_status_filter", newStatus);
    
//     localStorage.setItem("admin_property_page_number", "1");
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   };

//   const handlePageChange = (newPage) => {
//     if (!isSearchActive) {
//       localStorage.setItem("admin_property_page_number", newPage.toString());
//     }
//     setPagination((prev) => ({ ...prev, page: newPage }));
//   };

//   const openFilterPopup = (e) => {
//     setIsFilterPopupOpen(e.currentTarget);
//   };

//   return (
//     <div
//       className="bg-[#F9F9F9] relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl p-5 pt-4"
//       style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
//     >
//       <div className="flex flex-col gap-6 w-full">
//         <div className="grid grid-cols-1 gap-4">
//           <div className="flex gap-5 pt-3">
//             {propertyStats.map((stat, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
//                 <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50">
//                   {stat.icon}
//                 </div>
//                 <div className="text-right w-full">
//                   <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
//                   <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-wrap items-center justify-between">
//             <div className="relative flex-1 min-w-[280px] max-w-md">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search across all properties, owners, societies..."
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   if (e.target.value.trim() !== "") {
//                     setPagination((prev) => ({ ...prev, page: 1 }));
//                   } else {
//                     const saved = Number(localStorage.getItem("admin_property_page_number")) || 1;
//                     setPagination((prev) => ({ ...prev, page: saved }));
//                   }
//                 }}
//                 className="w-full h-10 rounded-full border border-gray-200 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
//               />
//             </div>

//             {/* 🌟 Status Dropdown: Persisted via localStorage */}
//             <select
//               value={statusFilter}
//               onChange={(e) => handleStatusChange(e.target.value)}
//               className="h-10 rounded-full border border-gray-200 px-4 text-sm bg-white cursor-pointer focus:border-indigo-500 focus:outline-none shadow-sm text-gray-700"
//             >
//               <option value="">All statuses</option>
//               <option value="active">Active</option>
//               <option value="pending_review">Pending Review</option>
//               <option value="draft">Draft</option>
//               <option value="rejected">Rejected</option>
//               <option value="deactivated">Deactivated</option>
//             </select>
//           </div>

//           <PropertiesTable
//             openFilterPopup={openFilterPopup}
//             propertyList={currentTableRows}
//             propertyData={{
//               ...propertyList,
//               data: currentTableRows,
//               total: totalCountForTable,
//               pagination: {
//                 ...pagination,
//                 total: totalCountForTable,
//               },
//             }}
//             fetchPropertyList={fetchPropertyList}
//             isLoading={isNormalLoading}
//             pagination={pagination}
//             setPagination={(updater) => {
//               if (typeof updater === "function") {
//                 const nextState = updater(pagination);
//                 if (nextState.page !== pagination.page) {
//                   handlePageChange(nextState.page);
//                 }
//               } else if (updater && updater.page !== undefined) {
//                 handlePageChange(updater.page);
//               }
//             }}
//           />

//           <CustomPopover
//             anchorEl={isFilterPopupOpen}
//             onClose={() => setIsFilterPopupOpen(null)}
//           >
//             <ListFilter
//               statusData={propertyList?.summary ?? {}}
//               filters={filters}
//               setFilters={setFilters}
//             />
//           </CustomPopover>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import ListFilter from "./filter";
import PropertiesTable from "./list";
import { decodeFilters } from "../../lib/helper";
import { propertyListApiPayload } from "../../services/postProperty";
import { Building2, MonitorCheck, Search, ShieldCheck, ShieldQuestionMark } from "lucide-react";
import CustomPopover from "../common/popover";

export const defaultFilters = {
  propertyTypeIds: [],
  categoryIds: [],
  listingTypeIds: [],
  furnishingTypes: [],
  projectStatuses: [],
  statuses: [],
  minPrice: 0,
  maxPrice: 10000000,
};

export default function ContentLayout() {
  const [searchParams] = useSearchParams();
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(null);
  const [enableQuery, setEnableQuery] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("admin_property_search_query") || "";
  });

  const [statusFilter, setStatusFilter] = useState(() => {
    return localStorage.getItem("admin_property_status_filter") || "";
  });

  const [pagination, setPagination] = useState(() => {
    const savedSearch = localStorage.getItem("admin_property_search_query") || "";
    const savedPage = savedSearch.trim() !== ""
      ? Number(localStorage.getItem("admin_property_search_page")) || 1
      : Number(localStorage.getItem("admin_property_page_number")) || 1;

    return {
      limit: 10,
      page: savedPage,
      totalPage: 1,
    };
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Jab user page reload karega tab search clear ho jayegi
      localStorage.removeItem("admin_property_search_query");
      localStorage.removeItem("admin_property_search_page");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const [propertyStats, setPropertyStats] = useState([
    { title: "Total Properties", count: 0, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
    { title: "Active Properties", count: 0, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
    { title: "Pending Properties", count: 0, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
    { title: "Verified Properties", count: 0, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
  ]);

  const [sorting, setSorting] = useState({
    order: "ASC",
    fieldName: "createdAt",
  });

  const {
    data: propertyList,
    refetch: fetchPropertyList,
    isLoading: isNormalLoading,
  } = useQuery({
    queryKey: ["property-list-paginated", filters, sorting, pagination.page, pagination.limit, statusFilter],
    queryFn: () => {
      const activeStatuses = statusFilter 
        ? statusFilter 
        : filters.statuses.length > 0 
          ? filters.statuses.join(",") 
          : undefined;

      const payload = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.listingTypeIds.length > 0 && { listingTypeIds: filters.listingTypeIds.join(",") }),
        ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(",") }),
        ...(filters.furnishingTypes.length > 0 && { furnishingTypes: filters.furnishingTypes.join(",") }),
        ...(activeStatuses && { statuses: activeStatuses }),
      };

      return propertyListApiPayload(payload);
    },
    enabled: enableQuery,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  const { data: allDatabaseProperties = [], isLoading: isSearchLoading } = useQuery({
    queryKey: ["all-database-properties", filters, statusFilter, propertyList?.total],
    queryFn: async () => {
      const total = propertyList?.total || 100;
      const batchLimit = 100;
      const totalBatches = Math.ceil(total / batchLimit);

      const activeStatuses = statusFilter 
        ? statusFilter 
        : filters.statuses.length > 0 
          ? filters.statuses.join(",") 
          : undefined;

      const promises = [];
      for (let i = 1; i <= totalBatches; i++) {
        promises.push(
          propertyListApiPayload({
            page: i,
            limit: batchLimit,
            ...(filters.listingTypeIds.length > 0 && { listingTypeIds: filters.listingTypeIds.join(",") }),
            ...(filters.categoryIds.length > 0 && { categoryIds: filters.categoryIds.join(",") }),
            ...(filters.furnishingTypes.length > 0 && { furnishingTypes: filters.furnishingTypes.join(",") }),
            ...(activeStatuses && { statuses: activeStatuses }),
          })
        );
      }

      const results = await Promise.all(promises);
      return results.flatMap((res) => res?.data || []);
    },
    enabled: !!propertyList?.total,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const query = searchParams.get("filters");
    if (query) {
      const parsed = decodeFilters(query);
      if (parsed) setFilters(parsed);
    }
    setEnableQuery(true);
  }, [searchParams]);

  useEffect(() => {
    if (propertyList?.summary) {
      const stats = [
        { title: "Total Properties", count: propertyList.summary.totalProperties, icon: <Building2 className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
        { title: "Active Properties", count: propertyList.summary.activeProperties, icon: <MonitorCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
        { title: "Pending Properties", count: propertyList.summary.pendingProperties, icon: <ShieldQuestionMark className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
        { title: "Verified Properties", count: propertyList.summary.verifiedProperties, icon: <ShieldCheck className="w-9 h-9 text-[#604AE3]" strokeWidth={1.5} /> },
      ];
      setPropertyStats(stats);
    }
  }, [propertyList]);

  const fullFilteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    return allDatabaseProperties.filter((item) => {
      const ownerName = (item?.owner?.name || "").toLowerCase();
      const ownerEmail = (item?.owner?.email || "").toLowerCase();
      const ownerPhone = (item?.owner?.phone || "").toLowerCase();
      const postedByMatch = ownerName.includes(q) || ownerEmail.includes(q) || ownerPhone.includes(q);

      const categoryName = (item?.category?.name || "").toLowerCase();
      const propertyTypeName = (item?.propertyType?.name || "").toLowerCase();
      const listingTypeName = (item?.listingType?.name || "").toLowerCase();
      const categoryTypeMatch = categoryName.includes(q) || propertyTypeName.includes(q) || listingTypeName.includes(q);

      const societyName = (item?.society?.name || "").toLowerCase();
      const localityName = (item?.locality?.name || "").toLowerCase();
      const cityName = (item?.city?.name || "").toLowerCase();
      const fullAddress = (item?.society?.address || "").toLowerCase();
      const bhkName = (item?.bhkType?.name || "").toLowerCase();
      const locationMatch =
        societyName.includes(q) ||
        localityName.includes(q) ||
        cityName.includes(q) ||
        fullAddress.includes(q) ||
        bhkName.includes(q);

      const propertyDescription = (item?.propertyDescription || "").toLowerCase();
      const descMatch = propertyDescription.includes(q);

      return postedByMatch || categoryTypeMatch || locationMatch || descMatch;
    });
  }, [allDatabaseProperties, searchQuery]);

  const isSearchActive = searchQuery.trim() !== "";

  useEffect(() => {
    const totalCount = isSearchActive
      ? (fullFilteredSearchResults?.length || 0)
      : (propertyList?.total || 0);

    if (totalCount !== undefined) {
      const newTotalPages = Math.max(1, Math.ceil(totalCount / pagination.limit));
      setPagination((prev) => {
        if (prev.totalPage === newTotalPages) return prev;
        return { ...prev, totalPage: newTotalPages };
      });
    }
  }, [isSearchActive, fullFilteredSearchResults?.length, propertyList?.total, pagination.limit]);

  const currentTableRows = useMemo(() => {
    if (isSearchActive && fullFilteredSearchResults) {
      const startIndex = (pagination.page - 1) * pagination.limit;
      return fullFilteredSearchResults.slice(startIndex, startIndex + pagination.limit);
    }
    return propertyList?.data ?? [];
  }, [isSearchActive, fullFilteredSearchResults, propertyList?.data, pagination.page, pagination.limit]);

  const totalCountForTable = useMemo(() => {
    if (isSearchActive && fullFilteredSearchResults) {
      return fullFilteredSearchResults.length;
    }
    return propertyList?.total || 0;
  }, [isSearchActive, fullFilteredSearchResults, propertyList?.total]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.trim() !== "") {
      localStorage.setItem("admin_property_search_query", val);
      localStorage.setItem("admin_property_search_page", "1");
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      localStorage.removeItem("admin_property_search_query");
      localStorage.removeItem("admin_property_search_page");
      const savedPage = Number(localStorage.getItem("admin_property_page_number")) || 1;
      setPagination((prev) => ({ ...prev, page: savedPage }));
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    localStorage.setItem("admin_property_status_filter", newStatus);

    localStorage.setItem("admin_property_page_number", "1");
    localStorage.setItem("admin_property_search_page", "1");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (isSearchActive) {
      localStorage.setItem("admin_property_search_page", newPage.toString());
    } else {
      localStorage.setItem("admin_property_page_number", newPage.toString());
    }
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const openFilterPopup = (e) => {
    setIsFilterPopupOpen(e.currentTarget);
  };

  return (
    <div
      className="bg-[#F9F9F9] relative w-full md:min-w-96 md:min-h-[450px] h-auto rounded-xl p-5 pt-4"
      style={{ boxShadow: "0px 4px 20px 0px #0000000D" }}
    >
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-5 pt-3">
            {propertyStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md py-4 px-6 flex-1 flex items-center gap-2">
                <div className="flex items-center justify-center min-w-16 h-16 rounded-full bg-violet-50">
                  {stat.icon}
                </div>
                <div className="text-right w-full">
                  <h3 className="text-md w-full font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-3xl mt-1 w-full font-bold text-gray-800">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all properties, owners, societies..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 rounded-full border border-gray-200 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none bg-white shadow-sm"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-10 rounded-full border border-gray-200 px-4 text-sm bg-white cursor-pointer focus:border-indigo-500 focus:outline-none shadow-sm text-gray-700"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <PropertiesTable
            openFilterPopup={openFilterPopup}
            propertyList={currentTableRows}
            propertyData={{
              ...propertyList,
              data: currentTableRows,
              total: totalCountForTable,
              pagination: {
                ...pagination,
                total: totalCountForTable,
              },
            }}
            fetchPropertyList={fetchPropertyList}
            isLoading={isSearchActive ? isSearchLoading : isNormalLoading}
            pagination={pagination}
            setPagination={(updater) => {
              if (typeof updater === "function") {
                const nextState = updater(pagination);
                if (nextState.page !== pagination.page) {
                  handlePageChange(nextState.page);
                }
              } else if (updater && updater.page !== undefined) {
                handlePageChange(updater.page);
              }
            }}
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
  );
}