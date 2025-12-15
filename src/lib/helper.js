import { PROPERTY_STATUS } from "./enums";

export function createURLSearchParam(arg1, arg2) {
  const params = new URLSearchParams();

  if (typeof arg1 === "string" && arg2 !== undefined) {
    params.set(arg1, String(arg2));
  } else if (typeof arg1 === "object") {
    Object.entries(arg1).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        params.set(key, String(val));
      }
    });
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function generateBHKList(showMore = false) {
  const bhkList = [];

  // Add 1RK first
  bhkList.push({
    id: 0,
    name: "1 RK",
    value: 1,
    bhk: 1,
    builtUpAreas: [],
    isCustom: true,
  });

  // Add 1BHK to 5BHK with 0.5 increments
  for (let i = 1; i <= 5; i += 0.5) {
    if (i === 5.5) break;

    bhkList.push({
      id: bhkList.length + 1,
      name: `${i % 1 === 0 ? i : i.toFixed(1)} BHK`,
      value: bhkList.length + 1,
      builtUpAreas: [],
      bhk: Math.ceil(Number(i.toFixed(1))),
      isCustom: true,
    });
  }

  if (!showMore) {
    bhkList.push({
      id: bhkList.length + 1,
      name: "5+ BHK",
      isPlusItem: true,
      value: bhkList.length + 1,
      bhk: 5,
      builtUpAreas: [],
    });
  }

  if (showMore) {
    for (let i = 6; i <= 12; i++) {
      bhkList.push({
        id: bhkList.length + 1,
        name: `${i} BHK`,
        value: bhkList.length + 1,
        builtUpAreas: [],
        bhk: Number(i),
        isCustom: true,
      });
    }
  }

  return bhkList;
}

export function generateBHKAmeneties(value) {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1) return [];

  return Array.from({ length: num + 1 }, (_, i) => (i + 1).toString());
}

export const generateFloors = (count) => {
  const baseFloors = [
    { label: "-2", value: "-2" },
    { label: "-1", value: "-1" },
    { label: "Ground", value: "Ground" },
  ];

  if (!count) return baseFloors;

  let upperFloors = Array.from({ length: count }, (_, i) => (i + 1).toString());
  upperFloors = upperFloors.map((item) => ({ label: item, value: item }));
  return [...baseFloors, ...upperFloors];
};

export const generateLockInPeriod = (count) => {
  let upperFloors = Array.from({ length: count }, (_, i) => (i + 1).toString());
  upperFloors = upperFloors.map((item) => ({ label: item + " month", value: item }));
  return upperFloors;
};

export const encodeFilters = (obj) => btoa(JSON.stringify(obj));

export const decodeFilters = (str) => {
  try {
    return JSON.parse(atob(str));
  } catch {
    return null;
  }
};

export const getStatusLabel = (value) => {
  if (value) {
    return PROPERTY_STATUS.find((item) => item.value == value)?.name;
  }
  return "";
};