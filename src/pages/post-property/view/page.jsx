import { useParams } from "react-router-dom"
import { getPropertyDetailsApiHandler } from "../../../services/postProperty";
import { useQuery } from "@tanstack/react-query";
import {MapPin, Sofa, Bath, Grid2x2 ,CircleCheck, Wallet, IndianRupee, SquareArrowOutUpRight    } from 'lucide-react'

export default function ViewProperty(){
    const params = useParams()
    const imageBaseUrl = import.meta.env.VITE_AWS_URL

    const { data: propertyDetails } = useQuery({
    queryKey: ["property-details", params?.propertyId],
    queryFn: async () => {
      return getPropertyDetailsApiHandler(String(params?.propertyId ?? ''));
    },
    select: (resposne) => {
      console.log('property details',resposne)
      return resposne.data
    },
    enabled: params?.propertyId ? true : false,
    staleTime: 0,
    refetchOnMount: true
  });


    return(
        <div className="px-6 py-6 flex justify-start gap-3 flex-col">
            <p className="font-medium text-2xl">Property Overview</p>

            <div className="">
                <p className="font-semibold text-xl text-text-black">
                    {propertyDetails?.society?.name ?? ""}  {propertyDetails?.society?.name ? ' In ' : ''} {propertyDetails?.city?.name}
                </p>
                {(propertyDetails?.flatNumber || propertyDetails?.plotNumber || propertyDetails?.houseNumber || propertyDetails?.villaNumber) && <span className="flex justify-start gap-2 items-center"> <MapPin size={18} /> {propertyDetails?.flatNumber || propertyDetails?.houseNumber || propertyDetails?.villaNumber} {propertyDetails?.locality?.name ? ", " : ''} {propertyDetails?.locality?.name ?? ''}</span>}
            </div>
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
                    {
                        Array.isArray(propertyDetails?.photos) && propertyDetails?.photos.map(item => {
                            return(
                                <div className="relative">
                                    <img
                                    src={imageBaseUrl + item.fileKey}
                                    alt="property photo"
                                    width={600}
                                    height={600}
                                    className="aspect-video rounded-[5px]"
                                    />
                                    <p className="bg-[#00000099] text-white text-sm rounded-full absolute bottom-2 px-2 py-0.5 left-2">{item.view}</p>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
                    {
                        Array.isArray(propertyDetails?.videos) && propertyDetails.videos.map((item) => {
                            return(
                                <div className="relative">
                                    <video
                                        src={imageBaseUrl + item.fileKey + '?t=5'}
                                        className="rounded-[10px] w-full aspect-video"
                                    />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="flex cursor-pointer items-center justify-center rounded-full w-12 h-12 bg-[#01004866]">
                                            <div onClick={() => {
                                                handleOpenVideoPreview(imageBaseUrl + item.fileKey)
                                            }} className="flex items-center justify-center rounded-full w-10 h-10 bg-blue">
                                            <img alt="play" src="/assets/play-white.svg" width={16} height={16} />
                                            </div>
                                        </div>
                                        </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div>
                    <div className="flex justify-start gap-3 items-center"><Wallet size={24} /> <p className="flex items-center text-2xl"><IndianRupee size={22}/>{propertyDetails?.monthlyRent || propertyDetails?.plotPrice || propertyDetails?.price }</p></div>
            </div>
            <div>
                <div className=" bg-[#fcfcfd] flex flex-wrap justify-start items-center gap-3 border rounded-sm border-border p-3">

                    {String(propertyDetails?.builtUpAreaMetadata?.noOfBedrooms ?? '') && <div className="flex gap-2 justify-start items-center border-r pr-2 border-border"> <Sofa size={18} /> <span>{propertyDetails?.builtUpAreaMetadata?.noOfBedrooms ?? ''} Bedroom</span></div>}
                    {String(propertyDetails?.builtUpAreaMetadata?.noOfBathrooms ?? '') && <div className="flex gap-2 justify-start items-center border-r pr-2 border-border"> <Bath size={18} /> <span>{propertyDetails?.builtUpAreaMetadata?.noOfBathrooms ?? ''} Bathroom</span></div>}
                    {String(propertyDetails?.builtUpAreaMetadata?.balconies ?? '') && <div className="flex gap-2 justify-start items-center border-r pr-2 border-border"> <Grid2x2  size={18} /> <span>{propertyDetails?.builtUpAreaMetadata?.balconies ?? ''} Balconies</span></div>}
                    {String(propertyDetails?.builtUpArea ?? '') && <div className="flex gap-2 justify-start items-center border-r pr-2 border-border"><SquareArrowOutUpRight size={18} /> <span>{propertyDetails?.builtUpArea} {propertyDetails?.builtUpAreaUnit}</span></div>}  
                    {String(propertyDetails?.plotArea ?? '') && <div className="flex gap-2 justify-start items-center border-r pr-2 border-border"><SquareArrowOutUpRight size={18} /> <span>{propertyDetails?.plotArea} {propertyDetails?.plotAreaUnit}</span></div>}  
                    {propertyDetails?.listingType?.name && <div className="flex gap-2 justify-start items-center"> <CircleCheck  size={18} /> <span>For {propertyDetails?.listingType?.name ?? ''}</span></div>}
                </div>
            </div>
            <div>
                <p className="text-xl text-text-black">Furnishing Type: <span className="text-[#687d92]">{propertyDetails?.furnishType}</span></p>
            </div>
            {Array.isArray(propertyDetails?.furnishingsCounts) && propertyDetails?.furnishingsCounts?.length > 0 && <div>
                <p className="text-xl text-text-black">Furnishing :</p>
                <div className="flex flex-wrap gap-3 pt-2">
                    {
                        propertyDetails?.furnishingsCounts?.map(item => {
                            return (
                                <div className="text-[#687d92] border rounded-sm p-1 bg-[#fcfcfd] border-border">
                                    {item.item} {"("} {item.count} {")"}
                                </div>
                            )
                        })
                    }
                </div>
                
            </div>}
           {Array.isArray(propertyDetails?.amenities) && propertyDetails?.amenities.length > 0 &&  <div >
                <p className="text-xl text-text-black">Amenities :</p>

                <div className="flex flex-wrap gap-3 pt-2">
                    {
                        propertyDetails?.amenities?.map(item => {
                            return (
                                <div className="text-[#687d92] border rounded-sm p-1 bg-[#fcfcfd] border-border">
                                    {item}
                                </div>
                            )
                        })
                    }
                </div>
            </div>}
            <div>
                <p className="text-xl text-text-black">Property Description</p>
                <div className="text-[#687d92]" dangerouslySetInnerHTML={{__html: propertyDetails?.propertyDescription}}></div>
            </div>
        </div>
    )
}