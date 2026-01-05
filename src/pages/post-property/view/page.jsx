import { useParams } from "react-router-dom"
import { getPropertyDetailsApiHandler } from "../../../services/postProperty";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Sofa, Bath, Grid2x2, CircleCheck, Wallet, IndianRupee, SquareArrowOutUpRight, Instagram, Mail, Phone, CheckCircle, XCircle } from 'lucide-react'
import PageTitle from "../../../components/common/layout/PageTitle";
import PropertyMediaSlider from "./propertyMediaSlider";
import { Avatar } from "@mui/material";
import { deepOrange, indigo } from '@mui/material/colors';
import ApproveRejectProperty from "../../../components/common/approveReject/approveRejectProperty";
import { useState } from "react";


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

    const closePopup = (isRefetch) => {
        setApprovePopup(false)
        setPopupType('')
        setPropertyId(null)
    }

    const buttons = [
        {
            label: 'Approve',
            type: "success",
            icon: <CheckCircle className="text-green-800 w-4.5 h-4.5" />,
            onClick: () => {
                handleOpenStatusPopup("approve", params.propertyId)
            }
        },
        {
            label: 'Reject',
            type: "danger",
            icon: <XCircle className="text-red-700 w-4.5 h-4.5" />,
            onClick: () => {
                handleOpenStatusPopup("reject", params.propertyId)
            }
        },
    ];

    const { data: propertyDetails } = useQuery({
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


    return (
        <div className="pl-6 py-3 pb-8 flex justify-start gap-3 flex-col ">
            <PageTitle title="Property Overview" actions={buttons} />

            <div className="flex gap-5">
                <div className="w-[30%] bg-[#f6f6ff] p-4 rounded-2xl h-fit">
                    <h3 className='text-md font-semibold text-gray-600'>Property Owner Details</h3>
                    <div className="flex flex-col items-center py-6">
                        <Avatar sx={{ width: 80, height: 80, bgcolor: indigo[800], fontSize: '1.75rem' }}>{propertyDetails?.owner.name.charAt(0) + propertyDetails?.owner.name.charAt(1)}</Avatar>
                        <p className='text-md font-medium text-gray-600 mt-3'>{propertyDetails?.owner.name}</p>
                        <p className='text-md text-gray-500 mt-1'>(Owner)</p>
                        <div className="flex gap-3 py-4">
                            {
                                propertyDetails?.owner.email ?
                                    <a href={`mailto:${propertyDetails?.owner.email}`} className="bg-purple-900 w-9 h-9 rounded-full flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-white" />
                                    </a>
                                    : ''
                            }
                            {
                                propertyDetails?.owner.phone ?
                                    <a href={`tel:${propertyDetails?.owner.phone}`} className="bg-green-700 w-9 h-9 rounded-full flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-white" />
                                    </a> : ''
                            }
                        </div>
                    </div>
                </div>
                <div className="bg-[#f6f6ff] w-[70%] p-4 rounded-2xl">
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
                                <p className="font-semibold text-xl text-gray-700">
                                    {propertyDetails?.society?.name ?? ""}  {propertyDetails?.society?.name ? ' In ' : ''} {propertyDetails?.city?.name}
                                </p>
                                {(propertyDetails?.flatNumber || propertyDetails?.plotNumber || propertyDetails?.houseNumber || propertyDetails?.villaNumber) && <span className="flex justify-start gap-2 items-center text-gray-500"> <MapPin size={18} /> {propertyDetails?.flatNumber || propertyDetails?.houseNumber || propertyDetails?.villaNumber} {propertyDetails?.locality?.name ? ", " : ''} {propertyDetails?.locality?.name ?? ''}</span>}
                            </div>
                            <div>
                                <div className="flex justify-start gap-3 items-center"><div className="p-1.5 bg-green-100 rounded-lg"><img src="/assets/wallet.svg" /></div> <p className="flex items-center font-medium text-[22px] text-gray-700"><IndianRupee size={22} />{propertyDetails?.monthlyRent || propertyDetails?.plotPrice || propertyDetails?.price}</p></div>
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
                            <p className="text-[18px] font-medium text-gray-800">Property Description</p>
                            <div className="text-gray-500  text-[14px] mt-2" dangerouslySetInnerHTML={{ __html: propertyDetails?.propertyDescription }}></div>
                        </div>
                    </div>
                </div>
            </div>
            <ApproveRejectProperty open={approvePopup} popupType={popupType} onClose={closePopup} propertyId={propertyId} />
        </div>
    )
}