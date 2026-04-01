import {
    Dialog,
    DialogContent,
    Switch,
    InputBase,
    Button
} from "@mui/material";
import { UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createAmenity, fetchAmenityById, updateAmenity } from "../../services/amenities";
import { getFileUploadUrlApiHandler, uploadFileToS3ApiHandler } from "../../services/masterService";
import { toast } from "react-toastify";
import { getPartnerApiHandler } from "../../services/channelPartnerService";

const AWS_URL = import.meta.env.VITE_AWS_URL || "";
const FALLBACK_IMAGE = "/assets/avatar-placeholder.png";

export default function ViewOwnerDialoge({ open: id, onClose, type }) {
    const { data: ownerData, isLoading } = useQuery({
        queryKey: ["cp-detail", id],
        queryFn: () => getPartnerApiHandler(id),
        enabled: !!id,
    });
    return (
        <Dialog open={id ? true : false} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
            <DialogContent className="p-0">
                <div className="">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {type === "customer" ? "Customer" : "Owner"} Details
                        </h2>
                        <button
                            onClick={() => onClose(false)}
                            className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-4 mt-5">
                        <div className="relative">
                            <img
                                src={
                                    ownerData?.data?.profileImage
                                        ? `${AWS_URL}${ownerData.data.profileImage}`
                                        : FALLBACK_IMAGE
                                }
                                onError={(e) => {
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                                className="w-40 h-40 rounded-full shadow-xl object-cover"
                            />
                            <p className={`absolute bottom-2 right-[32%] text-xs font-semibold  ${!ownerData?.data.isActive ? "text-red-700 bg-red-200" : "text-green-800 bg-green-200"} px-2 py-1 rounded-lg`}>{ownerData?.data.isActive ? "Active" : "Inactive"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-800">
                                {ownerData?.data.name}
                            </p>
                            <p className="text-sm font-semibold text-gray-500">
                                {ownerData?.data.cities}
                            </p>
                        </div>
                        <div className="flex flex-col py-4 w-full">
                            {
                                ownerData?.data.email ?
                                    <div className="flex justify-between w-full py-3 px-1 border-t border-b border-gray-200">
                                        <p className="text-gray-500">Email:</p>
                                        <a href={`mailto:${ownerData?.data.email}`} className="text-gray-600 font-medium">
                                            {ownerData?.data.email}
                                        </a>
                                    </div>
                                    : ''
                            }
                            {
                                ownerData?.data.phone ?
                                    <div className="flex justify-between w-full py-3 px-1 border-t border-b border-gray-200">
                                        <p className="text-gray-500">Phone:</p>
                                        <a href={`tel:${ownerData?.data.phone}`} className="text-gray-600 font-medium">
                                            {ownerData?.data.phone}
                                        </a>
                                    </div>
                                    : ''
                            }
                        </div>
                        {
                            type !== "customer" &&
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex-1 bg-white shadow-lg rounded-lg p-5 flex flex-col items-center gap-4">
                                    <h4 className="text-sm text-gray-500 text-center">Total Properties</h4>
                                    <p className="text-5xl font-semibold text-gray-400">{ownerData?.data.totalProperties}</p>
                                </div>
                                <div className="flex-1 bg-white shadow-lg rounded-lg p-5 flex flex-col items-center gap-4">
                                    <h4 className="text-sm text-gray-500 text-center">Properties for sale</h4>
                                    <p className="text-5xl font-semibold text-gray-400">{ownerData?.data.saleProperties}</p>
                                </div>
                                <div className="flex-1 bg-white shadow-lg rounded-lg p-5 flex flex-col items-center gap-4">
                                    <h4 className="text-sm text-gray-500 text-center">Properties for rent</h4>
                                    <p className="text-5xl font-semibold text-gray-400">{ownerData?.data.rentedProperties}</p>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    );
}

