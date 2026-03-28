import { useParams } from "react-router-dom"
import { getPropertyDetailsApiHandler, markTopPropertiesApiHandler, removeTopPropertiesApiHandler } from "../../../services/postProperty";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MapPin, Sofa, Bath, Grid2x2, CircleCheck, Wallet, IndianRupee, SquareArrowOutUpRight, Instagram, Mail, Phone, CheckCircle, XCircle } from 'lucide-react'
import PageTitle from "../../../components/common/layout/PageTitle";
import PropertyMediaSlider from "./propertyMediaSlider";
import { Avatar, Chip } from "@mui/material";
import { deepOrange, green, indigo, orange } from '@mui/material/colors';
import ApproveRejectProperty from "../../../components/common/approveReject/approveRejectProperty";
import { useState } from "react";
import { toast } from "react-toastify";
import { useMemo } from "react";

const propertyInformation = [
    ["Listing Type", "Rent"],
    ["Building Type", "Residential"],
    ["Property Type", "Apartment"],
    ["City", "Gurgaon"],
    ["Micro market", "Sohna Road"],
    ["Locality", "Sector 49"],
    ["Project Name", "Orchid Petals"],
    ["Area", "2337 Sq.Ft. (Area)"],
    ["Facing", "North West"],
    ["View", "Park View"],
    ["Built in", "2018"],
    ["Age", "Less than 1 year"],
    ["Additional Rooms", "Servant room, Study"],
    ["Total Floor Count", "28"],
    ["Floor Number", "15"],
    ["Tower/Block", "B"],
];


export default function ViewProperty() {
    const [approvePopup, setApprovePopup] = useState(false)
    const [popupType, setPopupType] = useState('')
    const [propertyId, setPropertyId] = useState(null)
    const params = useParams()
    const imageBaseUrl = import.meta.env.VITE_AWS_URL

    const handleOpenStatusPopup = (type, id) => {
        setApprovePopup(true)
        setPopupType(type)
        setPropertyId(id)
    }


    const { mutate: markAstopProperty, isPending: topPropertyLaoder } = useMutation({
        mutationFn: markTopPropertiesApiHandler,
        onSuccess: (res) => {
            toast.success(res.message)
            refetchDetails()
        },
        onError: (error) => {
            if (Array.isArray(error.message)) {
                error.message.map((item) => {
                    toast.error(item)
                })
            } else {
                toast.error(error.message)
            }
        }
    })

    const { mutate: removeFromTopProperty, isPending: removeTopPropertyLaoder } = useMutation({
        mutationFn: removeTopPropertiesApiHandler,
        onSuccess: (res) => {
            toast.success(res.message)
            refetchDetails()
        },
        onError: (error) => {
            if (Array.isArray(error.message)) {
                error.message.map((item) => {
                    toast.error(item)
                })
            } else {
                toast.error(error.message)
            }
        }
    })


    const { data: propertyDetails, refetch: refetchDetails } = useQuery({
        queryKey: ["property-details", params?.propertyId],
        queryFn: async () => {
            return getPropertyDetailsApiHandler(String(params?.propertyId ?? ''));
        },
        select: (resposne) => {
            console.log('property details', resposne)
            return resposne.data
        },
        enabled: params?.propertyId ? true : false,
        staleTime: 0,
        refetchOnMount: true
    });

    const closePopup = (isRefetch) => {
        if (isRefetch) {
            refetchDetails()
        }
        setApprovePopup(false)
        setPopupType('')
        setPropertyId(null)
    }

    let buttons = [];
    if (propertyDetails?.status == 'active') {
        buttons = [
            ...buttons,
            {
                label: 'Reject',
                type: "danger",
                icon: <XCircle className="text-red-700 w-4.5 h-4.5" />,
                onClick: () => {
                    handleOpenStatusPopup("reject", params.propertyId)
                }
            },
        ]
    } else {
        buttons = [
            ...buttons,
            {
                label: 'Approve',
                type: "success",
                icon: <CheckCircle className="text-green-800 w-4.5 h-4.5" />,
                onClick: () => {
                    handleOpenStatusPopup("approve", params.propertyId)
                }
            },

        ];
    }

    if (propertyDetails?.status == 'active' && propertyDetails?.isVerified === "unverified") {
        buttons = [...buttons, {
            label: 'Verify',
            type: 'success',
            icon: <CheckCircle className="text-green-800 w-4.5 h-4.5" />,
            onClick: () => {
                handleOpenStatusPopup('verify', params.propertyId);
            },
        }]
    } else if (propertyDetails?.status == 'active') {
        buttons = [...buttons, {
            label: 'Unverify',
            type: 'danger',
            icon: <XCircle className="text-red-700 w-4.5 h-4.5" />,
            onClick: () => {
                handleOpenStatusPopup('unverify', params.propertyId);
            },
        }]
    }

    if (propertyDetails?.isTop) {
        buttons = [...buttons, {
            label: 'Remove form top properties',
            type: 'danger',
            icon: <XCircle className="text-red-700 w-4.5 h-4.5" />,
            onClick: () => {
                removeFromTopProperty({ id: params.propertyId })
            },
        }]
    } else {
        buttons = [...buttons, {
            label: 'Add to top properties',
            type: 'success',
            icon: <CheckCircle className="text-green-800 w-4.5 h-4.5" />,
            onClick: () => {
                markAstopProperty({ id: params.propertyId })
            },
        }]
    }

    const asString = (value) => {
        if (typeof value === "string") {
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : null;
        }
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
        return null;
    };

    const asNumber = (value) => {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === "string") {
            const n = Number(value.trim());
            return Number.isFinite(n) ? n : null;
        }
        return null;
    };

    const propertyInfoData = useMemo(() => {
        const fromApi = [
            ["Listing Type", asString(propertyDetails?.listingTypeName)],
            ["Building Type", asString(propertyDetails?.categoryName)],
            ["Property Type", asString(propertyDetails?.propertyTypeName)],
            ["City", asString(propertyDetails?.city?.name) ?? asString(propertyDetails?.city?.name)],
            ["Locality", asString(propertyDetails?.locality?.name) ?? asString(propertyDetails?.locality?.name)],
            ["Project Name", asString(propertyDetails?.society?.name) ?? asString(propertyDetails?.society?.name)],
            [
                "Area",
                asNumber(propertyDetails?.buildUpAreaSqFt)
                    ? `${formatInr(Number(propertyDetails?.buildUpAreaSqFt))} Sq.Ft. (Area)`
                    : null,
            ],
            ["Facing", asString(propertyDetails?.facing)],
            ["View", asString(propertyDetails?.facing)],
            ["Built in", asString(propertyDetails?.age)],
            ["Age", asString(propertyDetails?.age)],
            ["Additional Rooms", asString(propertyDetails?.additionalRoomsText)],
            ["Total Floor Count", asString(propertyDetails?.totalFloorCount)],
            ["Floor Number", asString(propertyDetails?.floorNumber)],
            ["Tower/Block", asString(propertyDetails?.towerOrBlock)],
        ];

        return propertyInformation.map(([label, fallback]) => {
            const match = fromApi.find(([apiLabel]) => apiLabel === label);
            return [label, match?.[1] ?? fallback];
        });
    }, [propertyDetails]);

    return (
        <div className="pl-6 py-3 pb-8 flex justify-start gap-3 flex-col ">
            <PageTitle title="Property Overview" actions={buttons} />

            <div className="flex gap-5">
                <div className="w-[30%] bg-[#fff] shadow-lg p-4 pb-0 rounded-2xl h-fit">
                    <h3 className='text-md font-semibold text-gray-600'>Property Owner Details</h3>
                    <div className="flex flex-col items-center py-6">
                        <Avatar sx={{ width: 80, height: 80, bgcolor: indigo[800], fontSize: '1.75rem' }}>{(propertyDetails?.owner?.name || 'NA').slice(0, 2).toUpperCase()}</Avatar>
                        <p className='text-md font-medium text-gray-600 mt-3'>{propertyDetails?.owner?.name || '-'}</p>
                        <p className='text-md text-gray-500 mt-1'>({propertyDetails?.owner?.role || 'Owner'})</p>
                        <div className="flex flex-col py-4 w-full">
                            {
                                propertyDetails?.owner.email ?
                                    <div className="flex justify-between w-full py-3 px-1 border-t border-b border-gray-200">
                                        <p className="text-gray-500">Email:</p>
                                        <a href={`mailto:${propertyDetails?.owner.email}`} className="text-gray-600 font-medium">
                                            {propertyDetails?.owner.email}
                                        </a>
                                    </div>
                                    : ''
                            }
                            {
                                propertyDetails?.owner.phone ?
                                    <div className="flex justify-between w-full py-3 px-1 border-t border-b border-gray-200">
                                        <p className="text-gray-500">Phone:</p>
                                        <a href={`tel:${propertyDetails?.owner.phone}`} className="text-gray-600 font-medium">
                                            {propertyDetails?.owner.phone}
                                        </a>
                                    </div>
                                    : ''
                            }
                        </div>
                    </div>
                </div>
                <div className="bg-[#fff] w-[70%] shadow-lg p-4 rounded-2xl">
                    <div className="w-full">
                        <PropertyMediaSlider
                            propertyDetails={propertyDetails}
                            imageBaseUrl={imageBaseUrl}
                        // handleOpenVideoPreview={handleOpenVideoPreview}
                        />
                    </div>
                    <div className="px-2">

                        <div className="flex justify-between items-center my-4">
                            <div className="flex flex-col gap-1.5">
                                <p className="font-semibold items-center flex gap-2 text-xl text-gray-700">
                                    {propertyDetails?.society?.name ?? ""}  {propertyDetails?.society?.name ? ' In ' : ''} {propertyDetails?.city?.name}
                                    <Chip
                                        label={propertyDetails?.status}
                                        size="small"
                                        sx={{
                                            fontSize: "14px",
                                            height: 20,
                                            fontWeight: '500',
                                            padding: '12px 4px !important',
                                            textTransform: 'capitalize',
                                            bgcolor: propertyDetails?.status === "active" ? green[50] : orange[50],
                                            color: propertyDetails?.status === "active" ? green[700] : orange[700],
                                        }}
                                    />
                                </p>
                                {(propertyDetails?.flatNumber || propertyDetails?.city.name || propertyDetails?.plotNumber || propertyDetails?.houseNumber || propertyDetails?.villaNumber) && <span className="flex justify-start gap-2 items-center  text-gray-500"> <MapPin size={18} /> {propertyDetails?.flatNumber || propertyDetails?.houseNumber || propertyDetails?.villaNumber} {propertyDetails?.locality?.name ? `${propertyDetails?.locality?.name}, ` : ''} {propertyDetails?.city.name ? `${propertyDetails?.city.name}, ` : ''} {propertyDetails?.city?.state ?? ''}</span>}
                            </div>
                            <div>
                                <div className="flex justify-start gap-3 items-center"><div className="p-1.5 bg-green-100 rounded-lg"><img src="/assets/wallet.svg" /></div> <p className="flex items-center font-bold text-[22px] text-gray-700"><IndianRupee size={22} />{propertyDetails?.monthlyRent || propertyDetails?.plotPrice || propertyDetails?.price}</p></div>
                            </div>
                        </div>
                        <div>
                            <div className=" bg-[#fcfcfd] flex items-center gap-3 border rounded-sm border-border py-2.5 px-3">

                                {String(propertyDetails?.builtUpAreaMetadata?.noOfBedrooms ?? '') && <div className="flex flex-1 gap-2.5 justify-center items-center border-r pr-2 border-border"> <Sofa className="text-[#604ae3]" size={20} /> <span className="text-gray-600 font-medium text-[14px]">{propertyDetails?.builtUpAreaMetadata?.noOfBedrooms ?? ''} Bedroom</span></div>}
                                {String(propertyDetails?.builtUpAreaMetadata?.noOfBathrooms ?? '') && <div className="flex flex-1 gap-2.5 justify-center items-center border-r pr-2 border-border"> <Bath className="text-[#604ae3]" size={20} /> <span className="text-gray-600 font-medium text-[14px]">{propertyDetails?.builtUpAreaMetadata?.noOfBathrooms ?? ''} Bathroom</span></div>}
                                {String(propertyDetails?.builtUpAreaMetadata?.balconies ?? '') && <div className="flex flex-1 gap-2.5 justify-center items-center border-r pr-2 border-border"> <Grid2x2 className="text-[#604ae3]" size={20} /> <span className="text-gray-600 font-medium text-[14px]">{propertyDetails?.builtUpAreaMetadata?.balconies ?? ''} Balconies</span></div>}
                                {String(propertyDetails?.builtUpArea ?? '') && <div className="flex flex-1 gap-2.5 justify-center items-center border-r pr-2 border-border"><SquareArrowOutUpRight className="text-[#604ae3]" size={20} /> <span className="text-gray-600 font-medium text-[14px]">{propertyDetails?.builtUpArea} {propertyDetails?.builtUpAreaUnit}</span></div>}
                                {String(propertyDetails?.plotArea ?? '') && <div className="flex flex-1 gap-2.5 justify-center items-center border-r pr-2 border-border"><SquareArrowOutUpRight className="text-[#604ae3]" size={20} /> <span className="text-gray-600 font-medium text-[14px]">{propertyDetails?.plotArea} {propertyDetails?.plotAreaUnit}</span></div>}
                                {propertyDetails?.listingType?.name && <div className="flex flex-1 gap-2.5 justify-center items-center"> <CircleCheck className="text-[#604ae3]" size={20} /> <span className="text-gray-600 font-medium text-[14px]">For {propertyDetails?.listingType?.name ?? ''}</span></div>}
                            </div>
                        </div>
                        <div className="my-3">
                            <p className="text-[18px] font-medium text-gray-800">Furnishing Type: </p>
                            <p className="text-gray-500 mt-1">{propertyDetails?.furnishType}</p>
                        </div>
                        <div className="my-3">
                            {Array.isArray(propertyDetails?.furnishingsCounts) && propertyDetails?.furnishingsCounts?.length > 0 && <div>
                                <p className="text-[18px] font-medium text-gray-800">Furnishing :</p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {
                                        propertyDetails?.furnishingsCounts?.map(item => {
                                            return (
                                                <div className="text-gray-500 font-medium text-[13px] border rounded-sm py-1 px-2.5 bg-[#fcfcfd] border-border">
                                                    {item.item} {"("} {item.count} {")"}
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                            </div>}
                        </div>
                        <div className="my-3 ">
                            {Array.isArray(propertyDetails?.amenities) && propertyDetails?.amenities.length > 0 && <div >
                                <p className="text-[18px] font-medium text-gray-800">Amenities :</p>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {
                                        propertyDetails?.amenities?.map(item => {
                                            return (
                                                <div className="text-gray-500 font-medium text-[13px] border rounded-sm py-1 px-2.5 bg-[#fcfcfd] border-border">
                                                    {item}
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>}
                        </div>
                        <div className="my-4">
                            <p className="text-[18px] mb-2 font-medium text-gray-800">Property Information</p>
                            <div className="mt-3 rounded-lg border border-border bg-white p-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {propertyInfoData.map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-border px-3 py-2"
                                    >
                                        <p className="text-[12px] text-text-gray">
                                            {label}
                                        </p>
                                        <p className="mt-0.5 text-sm font-medium text-text-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="my-4">
                            <p className="text-[18px] font-medium text-gray-800">Property Description</p>
                            <div className="text-gray-500  text-[14px] mt-2" dangerouslySetInnerHTML={{ __html: propertyDetails?.propertyDescription }}></div>
                        </div>
                        <div className="my-4 flex gap-2 items-center">
                            <p className="text-[18px] font-medium text-gray-800">Category: </p>
                            <p className="text-[14px] font-medium text-gray-600">{propertyDetails?.category.name}</p>
                        </div>
                    </div>
                </div>
            </div>
            <ApproveRejectProperty open={approvePopup} popupType={popupType} onClose={closePopup} propertyId={propertyId} />
        </div>
    )
}