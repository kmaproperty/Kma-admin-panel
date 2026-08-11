import { PropertyCategoryResponse, PropertyListResponse, PropertyType as PropertyTypeList } from "@/cp/services/masterService";
import { ElementType } from "react";

export interface PropertyType extends PropertyListResponse {
    icon: string
}

export interface PropertyCategory extends PropertyCategoryResponse {
    icon: string
}

export interface PropertyList extends PropertyTypeList {
    icon: ElementType
}