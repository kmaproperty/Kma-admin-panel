import { useQuery } from "@tanstack/react-query";
import FilterChipTag from "../common/chipTag/filterChipTag";
import {
  getPropertyCategoryApiHandler,
  getPropertyListApiHandler,
  getPropertyTypeApiHandler,
} from "../../services/masterService";
import { FURNISH_TYPE, PROPERTY_STATUS } from "../../lib/enums";
import { Accordion, AccordionDetails, AccordionSummary, InputBase, Slider } from "@mui/material";
import { encodeFilters } from "../../lib/helper";
import { defaultFilters } from "./contentLayout";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

export default function ListFilter({ filters, setFilters, statusData }) {
  const navigate = useNavigate();
  console.log("filters", filters);

  const updateFilter = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    const encoded = encodeFilters(newFilters);
    navigate(`?filters=${encoded}`, { scroll: false });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    navigate("/my-listing");
  };

  const { data: propertyTypeList } = useQuery({
    queryKey: ["propertyList"],
    queryFn: getPropertyListApiHandler,
    select: (data) => data.map((i) => ({ id: i.id, name: i.name })),
  });

  const { data: propertyCategoryList } = useQuery({
    queryKey: ["propertyCategory"],
    queryFn: getPropertyCategoryApiHandler,
    select: (data) => data.map((i) => ({ id: i.id, name: i.name })),
  });

  const { data: propertyList } = useQuery({
    queryKey: ["propertyTypes"],
    queryFn: () =>
      getPropertyTypeApiHandler({ propertyListType: "", propertyCategory: "" }),
    select: (data) =>
      data.propertyTypes.map((i) => ({ id: i.id, name: i.name })),
  });

  // ---------- Toggle Chip Helper ----------
  const toggleFilterArray = (key, id) => {
    const exists = filters[key].includes(id);
    const newArr = exists
      ? filters[key].filter((x) => x !== id)
      : [...filters[key], id];
    updateFilter(key, newArr);
  };

  const generateActiveTags = () => {
    const tags = [];

    // Service / propertyTypeIds
    propertyTypeList?.forEach((item) => {
      if (filters.propertyTypeIds.includes(item.id)) {
        tags.push({ key: "propertyTypeIds", id: item.id, label: item.name });
      }
    });

    // Building Type / categoryIds
    propertyCategoryList?.forEach((item) => {
      if (filters.categoryIds.includes(item.id)) {
        tags.push({ key: "categoryIds", id: item.id, label: item.name });
      }
    });

    // Property Type / listingTypeIds
    propertyList?.forEach((item) => {
      if (filters.listingTypeIds.includes(item.id)) {
        tags.push({ key: "listingTypeIds", id: item.id, label: item.name });
      }
    });

    // Furnishing Types
    FURNISH_TYPE.forEach((item) => {
      if (filters.furnishingTypes.includes(item.value)) {
        tags.push({ key: "furnishingTypes", id: item.value, label: item.name });
      }
    });

    // Property Status
    PROPERTY_STATUS.forEach((item) => {
      if (filters.statuses.includes(item.value)) {
        tags.push({ key: "statuses", id: item.value, label: item.name });
      }
    });

    // Price Range
    if (filters.minPrice != 0 || filters.maxPrice != 10000000) {
      tags.push({
        key: "price",
        id: "price",
        label: `₹ ${filters.minPrice} - ₹ ${filters.maxPrice}`,
      });
    }

    return tags;
  };

  const removeActiveTag = (tag) => {
    if (tag.key === "price") {
      updateFilter("minPrice", 0);
      updateFilter("maxPrice", 10000000);
      return;
    }

    const updatedArray = filters[tag.key].filter((val) => val !== tag.id);
    updateFilter(tag.key, updatedArray);
  };

  const statusCount = statusData?.byStatus ?? {};
  const CleanAccordion = styled(Accordion)(() => ({
    background: "transparent",
    boxShadow: "none",
    "&::before": { display: "none" },
    "& .MuiAccordionSummary-root": {
      minHeight: "0 !important",
      padding: 0,
      margin: 0,
    },
    "& .MuiAccordionSummary-content": {
      margin: "0 !important",
      padding: 0,
    },
    "& .MuiAccordionDetails-root": {
      padding: 0,
      margin: 0,
      marginTop: "20px",
    },
  }));

  return (
    <div className="bg-[#F4F4F4] rounded-[10px] px-[0.75rem] py-[1rem] h-fit">
    <CleanAccordion>
      <AccordionSummary
        expandIcon={
          <img
            alt="Arrow"
            src="/assets/down-arrow-outline-black.svg"
            width={18}
            height={18}
          />
        }
      >
        <p className="text-lg font-medium text-text-black">
          Property Filter
          <span className="text-text-black font-medium">{}</span>
        </p>
      </AccordionSummary>
      <AccordionDetails>
        <div className="flex flex-col rounded-xl px-4 py-5 justify-start gap-5 w-full">
          {/* HEADER */}
          <div className="flex justify-between w-full">
            <p
              className="text-base text-blue underline cursor-pointer"
              onClick={resetFilters}
            >
              Reset applied filter
            </p>
          </div>

          {generateActiveTags().length > 0 && (
            <div className="flex flex-wrap gap-1">
              {generateActiveTags().map((item) => {
                return (
                  <button
                    className={`h-[35px] flex items-center py-[5px] px-[10px] cursor-pointer border border-border rounded-[5px] bg-light-purple`}
                    onClick={() => removeActiveTag(item)}
                  >
                    <span
                      className={`text-[14px] leading-[24px] text-text-gray mr-1`}
                    >
                      {item.label}
                    </span>
                    <img
                      alt={""}
                      src={"/assets/close-icon.svg"}
                      width={20}
                      height={20}
                    />
                  </button>
                );
              })}
            </div>
          )}
          <hr className="border-[#01004812]"></hr>

          {/* SERVICE */}
          {Array.isArray(propertyTypeList) && (
            <div className="text-text-gray">
              <p className="font-medium text-base text-text-black">Service</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {propertyTypeList.map((item) => {
                  let checked = filters.propertyTypeIds.includes(item.id);
                  return (
                    <FilterChipTag
                      key={item.id}
                      label={item.name}
                      isIcon={true}
                      iconSrc={
                        checked
                          ? "/assets/check-arrow-white.svg"
                          : "/assets/check-arrow-transparent.svg"
                      }
                      checked={checked}
                      onChagne={() =>
                        toggleFilterArray("propertyTypeIds", item.id)
                      }
                      value={item.name}
                      iconStyle="w-[16px] h-[16px]"
                      containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[80px]"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* BUILDING TYPE */}
          {Array.isArray(propertyCategoryList) && (
            <div className="text-text-gray">
              <p className="font-medium text-base text-text-black">
                Building Type
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {propertyCategoryList.map((item) => {
                  const checked = filters.categoryIds.includes(item.id);
                  return (
                    <FilterChipTag
                      key={item.id}
                      label={item.name}
                      isIcon={true}
                      iconSrc={
                        checked
                          ? "/assets/check-arrow-white.svg"
                          : "/assets/check-arrow-transparent.svg"
                      }
                      checked={checked}
                      onChagne={() => toggleFilterArray("categoryIds", item.id)}
                      value={item.name}
                      iconStyle="w-[16px] h-[16px]"
                      containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* PROPERTY TYPE */}
          {Array.isArray(propertyList) && (
            <div className="text-text-gray">
              <p className="font-medium text-base text-text-black">
                Property Type
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {propertyList.map((item) => {
                  const checked = filters.listingTypeIds.includes(item.id);
                  return (
                    <FilterChipTag
                      key={item.id}
                      label={item.name}
                      isIcon={true}
                      iconSrc={
                        checked
                          ? "/assets/check-arrow-white.svg"
                          : "/assets/check-arrow-transparent.svg"
                      }
                      checked={checked}
                      onChagne={() =>
                        toggleFilterArray("listingTypeIds", item.id)
                      }
                      value={item.name}
                      iconStyle="w-[16px] h-[16px]"
                      containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* FURNISHING TYPE */}
          <div className="text-text-gray">
            <p className="font-medium text-base text-text-black">
              Furnishing Type
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {FURNISH_TYPE.map((item) => {
                const checked = filters.furnishingTypes.includes(item.value);
                return (
                  <FilterChipTag
                    key={item.value}
                    label={item.name}
                    isIcon={true}
                    iconSrc={
                      checked
                        ? "/assets/check-arrow-white.svg"
                        : "/assets/check-arrow-transparent.svg"
                    }
                    checked={checked}
                    onChagne={() =>
                      toggleFilterArray("furnishingTypes", item.value)
                    }
                    value={item.name}
                    iconStyle="w-[16px] h-[16px]"
                    containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
                  />
                );
              })}
            </div>
          </div>

          {/* PROPERTY STATUS */}
          <div className="text-text-gray">
            <p className="font-medium text-base text-text-black">
              Property Status
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {PROPERTY_STATUS.map((item) => {
                const checked = filters.statuses.includes(item.value);
                if (!statusCount[item.value]) {
                  return "";
                }
                return (
                  <FilterChipTag
                    key={item.name}
                    label={
                      item.name +
                      (statusCount[item.value]
                        ? " (" + statusCount[item.value] + ")"
                        : "")
                    }
                    isIcon={true}
                    iconSrc={
                      checked
                        ? "/assets/check-arrow-white.svg"
                        : "/assets/check-arrow-transparent.svg"
                    }
                    checked={checked}
                    onChagne={() => toggleFilterArray("statuses", item.value)}
                    value={item.name}
                    iconStyle="w-[16px] h-[16px]"
                    containerStyle="flex flex-1 2md:flex-none justify-center gap-2 min-w-[90px]"
                  />
                );
              })}
            </div>
          </div>

          {/* PRICE */}
          <div className="text-text-gray">
            <p className="font-medium text-base text-text-black">Price</p>

            <Slider
              sx={{
                color: "var(--color-blue)",
                "& .MuiSlider-thumb": { backgroundColor: "var(--color-blue)" },
              }}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={(e, val, activeThumb) => {
                const [min, max] = val;
                if (activeThumb == 0) {
                  updateFilter("minPrice", min);
                } else {
                  updateFilter("maxPrice", max);
                }
              }}
              valueLabelDisplay="auto"
              min={0}
              max={10000000}
            />

            <div className="flex justify-between gap-3 mt-3">
              <div>
                <p className="text-base text-text-black">From</p>
                <InputBase
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    updateFilter("minPrice", Number(e.target.value))
                  }
                  className="box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border"
                />
              </div>
              <div>
                <p className="text-base text-text-black">To</p>
                <InputBase
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    updateFilter("maxPrice", Number(e.target.value))
                  }
                  className="box-border h-[40px] px-4 py-2 text-sm rounded-full border border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </AccordionDetails>
    </CleanAccordion>
    </div>
  );
}
