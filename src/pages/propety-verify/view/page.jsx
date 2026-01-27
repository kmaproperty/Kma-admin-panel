import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle } from 'lucide-react'
import PageTitle from "../../../components/common/layout/PageTitle";
import { useState } from "react";
import { fetchVerifyPropertyById } from "../../../services/verify-property";
import VideoPreviewDialog from "../../../components/common/videoPreview";
import ApproveRejectVerifyProperty from "../../../components/common/approveRejectVerifyProperty";


const MediaList = ({ title, items, imageBaseUrl }) => (
  <div>
    <h3 className="text-base pb-2 font-semibold">{title}</h3>
    <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
      {Array.isArray(items) &&
        items.map((item) => {
          return (
            <div onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(imageBaseUrl + item.fileKey, '_blank')
            }} className="cursor-pointer relative">
              <img
                src={imageBaseUrl + item.fileKey}
                alt="property photo"
                width={600}
                height={600}
                className="aspect-video rounded-[5px]"
              />
              <p className="bg-[#00000099] text-white text-sm rounded-full absolute bottom-2 px-2 py-0.5 left-2">
                {item.view}
              </p>
            </div>
          );
        })}
    </div>
  </div>
);

const VideoMediaList = ({
  title,
  items,
  imageBaseUrl,
  handleOpenVideoPreview,
}) => (
  <div>
    <h3 className="text-base pb-2 font-semibold">{title}</h3>
    {items.map((i, idx) => (
      <div key={idx} className="text-sm text-gray-600">
        {i.key}
      </div>
    ))}
    <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
      {Array.isArray(items) &&
        items.map((item) => {
          return (
            <div className="relative">
              <video
                src={imageBaseUrl + item.fileKey + "?t=0.002"}
                className="rounded-[10px] w-full aspect-video object-cover"
                preload="metadata"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex cursor-pointer items-center justify-center rounded-full w-12 h-12 bg-[#01004866]">
                  <div
                    onClick={() => {
                      handleOpenVideoPreview(imageBaseUrl + item.fileKey);
                    }}
                    className="flex items-center justify-center rounded-full w-10 h-10 bg-blue"
                  >
                    <img
                      alt="play"
                      src="/assets/play-white.svg"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  </div>
);

export default function ViewVerifyProperty() {
    const [approvePopup, setApprovePopup] = useState(false)
    const [popupType, setPopupType] = useState('')
    const [propertyId, setPropertyId] = useState(null)
    const params = useParams()
    const imageBaseUrl = import.meta.env.VITE_AWS_URL
    const navigate = useNavigate()
    const [openVideoPreview, setOpenVideoPreview] = useState(false)
    const [videourl, setVideoUrl] = useState(null)

    const handleOpenStatusPopup = (type, id) => {
        setApprovePopup(true)
        setPopupType(type)
        setPropertyId(id)
    }

    const { data: propertyDetails, refetch: refetchDetails } = useQuery({
        queryKey: ["verify-property-details", params?.propertyId],
        queryFn: async () => {
            return fetchVerifyPropertyById(String(params?.propertyId ?? ''));
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
        if(isRefetch){
            navigate('/verify-property')
        }
        setApprovePopup(false)
        setPopupType('')
        setPropertyId(null)
    }

    let buttons = [
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

    if(propertyDetails?.status == 'rejected'){
        buttons = []
    }

    const handleClosePreview = () => {
        setVideoUrl(null)
        setOpenVideoPreview(false)
    }

    const handleOpenVideoPreview = (url) => {
        setOpenVideoPreview(true)
        setVideoUrl(url)
    }

    return (
        <div className="pl-6 py-3 pb-8 flex justify-start gap-3 flex-col ">
            <PageTitle title={"Verify Property Media" + ' (' + propertyDetails?.status + ')'} actions={buttons} />

            <div className="flex gap-5">
                
                <div className="flex flex-col gap-3 bg-[#f6f6ff] w-full p-4 rounded-2xl">
                    <MediaList imageBaseUrl={imageBaseUrl} items={propertyDetails?.livePhotos ?? []} title={'Photo List'} key={'photo'}/>
                    <VideoMediaList imageBaseUrl={imageBaseUrl} items={propertyDetails?.liveVideos ?? []} title={'Video List'} key={'video'} handleOpenVideoPreview={handleOpenVideoPreview}/>
                </div>
            </div>
            <VideoPreviewDialog
                open={openVideoPreview}
                videoUrl={videourl}
                onClose={handleClosePreview}
            />
            <ApproveRejectVerifyProperty open={approvePopup} popupType={popupType} onClose={closePopup} propertyId={propertyId} />
        </div>
    )
}