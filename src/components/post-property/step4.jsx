import PhotoViewer from "../common/photoViewer";
import ImageUpload from "../common/upload";
import FieldLabel from "./fieldLabel";
import { useDispatch, useSelector } from "react-redux";
import { getActiveStep, resetProgress, setActiveStep, setTotalProgress } from "../../store/postPropertyProgress";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getFileUploadUrlApiHandler,
  uploadFileToS3ApiHandler,
} from "../../services/masterService";
import { toast } from "react-toastify";
import { PROPERTY_IMAGE_TYPE } from "../../lib/enums";
import VideoPreviewDialog from "../common/videoPreview";
import {
  getPropertyDetailsApiHandler,
  propertyEditAsAdminAPiPayload,
  step1PostPropertyDetailsApiHandler,
  step4PostPropertyCreateApiHandler,
  step4PostPropertyDetailsApiHandler,
} from "../../services/postProperty";
import { useNavigate, useParams } from "react-router-dom";

export default function Step4({containerRef}) {
  const params = useParams();
  const toastRef = useRef(null);
  const navigate = useNavigate()

  const activeStep = useSelector(getActiveStep);
  const dispatch = useDispatch();

  const [basicStaticDetail, setBasicStaticDetail] = useState({
    propertyListFor: null,
    propertyCategory: null,
    propertyType: null,
  })

  const [photoList, setPhotoList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [errors, setErrors] = useState({});

  //Video Preview
  const [openVideoPreview, setOpenVideoPreview] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");

  console.log("step4 state details", photoList, videoList);

  const validate = () => {
    let hasError = false;
    let updatedErrors = {};

    if (photoList.length < 2) {
      updatedErrors.photo = "Minimun 2 photos requried";
      hasError = true;
    }

    if (photoList.length >= 2) {
      let isCoverImageSelected = photoList.some((item) => item.isCoverImage);
      if (!isCoverImageSelected) {
        updatedErrors.cover = `Set one cover image from ${photoList.length} image`;
        hasError = true;
      }
    }

    if (photoList.length >= 2) {
      let isAllviewSelected = photoList.every((item) => item.view?.value);
      if (!isAllviewSelected) {
        updatedErrors.view = `Select view of image`;
        hasError = true;
      }
    }
    console.log('step4 validation error', updatedErrors)
    setErrors(updatedErrors);
    return hasError;
  };

  const { mutate: handleFileUpload } = useMutation({
    mutationFn: async (
      payload
    ) => {
      return await uploadFileToS3ApiHandler(payload);
    },
    onError: (error) => {
      console.log("file upload s3 api", error);
      toast.dismiss(toastRef.current);
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  const { mutate: handleGetFileUrl, isPending: ownerLoader } = useMutation({
    mutationFn: async (
      payload
    ) => {
      return await getFileUploadUrlApiHandler(payload);
    },
    onError: (error) => {
      console.log("get file url api", error);
      toast.dismiss(toastRef.current);
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

const handleUploadFileToS3 = async (files, type) => {
  if (type == 'image' && photoList.length + files.length > 50) {
    toast.error("Max 50 photos can be uploaded");
    return;
  }

  if (type == 'video' && videoList.length + files.length > 5) {
    toast.error("Max 5 videos can be uploaded");
    return;
  }

  toastRef.current = toast.loading("Uploading files...");

  for (const file of files) {
    await new Promise((resolve) => {
      handleGetFileUrl(
        {
          contentType: file.type,
          filename: file.name,
          expiresIn: 3600,
          folder: import.meta.env.VITE_AWS_FOLDER,
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleFileUpload(
                { url: response.data.url, file },
                {
                  onSuccess: (fileResponse) => {
                    if (fileResponse.status === 200) {
                      if (type === "image") {
                        setPhotoList((pre) => [
                          ...pre,
                          {
                            fileKey: response.data.key,
                            url: import.meta.env.VITE_AWS_URL + response.data.key,
                            view: null,
                            isCoverImage: false,
                          },
                        ]);
                      } else if (type === "video") {
                        setVideoList((pre) => [
                          ...pre,
                          {
                            fileKey: response.data.key,
                            url:
                              import.meta.env.VITE_AWS_URL +
                              response.data.key +
                              "#t=5",
                          },
                        ]);
                      }
                    } else {
                      toast.error(`Error uploading ${file.name}`);
                    }
                    resolve();
                  },
                }
              );
            } else {
              toast.error(`Failed to get upload URL for ${file.name}`);
              resolve();
            }
          },
        }
      );
    });
  }

  toast.dismiss(toastRef.current);
  setErrors((pre) => ({...pre, photo: ''}))
};


  const handleDeletePhoto = (id) => {
    let updatedPhotolist = photoList.filter((_, index) => String(index) != id);
    setPhotoList(updatedPhotolist);
    setErrors({});
  };

  const handleDeleteVideo = (id) => {
    let updatedPhotolist = videoList.filter((_, index) => String(index) != id);
    setVideoList(updatedPhotolist);
  };

  const handleOpenVideoPreview = (url) => {
    if(url){
      const cleanUrl = url?.split('#')[0];
      setVideoPreviewUrl(cleanUrl ?? '');
      setOpenVideoPreview(true);
    }
  };

  const handleClosePreview = () => {
    setOpenVideoPreview(false);
    setVideoPreviewUrl(null);
  };

  const handleCoverChange = (checked, id) => {
    let updatedFile = [...photoList];
    updatedFile = updatedFile.map((item, index) => {
      if (String(index) == id) {
        return { ...item, isCoverImage: checked };
      } else {
        return { ...item, isCoverImage: false };
      }
    });
    setPhotoList(updatedFile);
    setErrors((pre) => ({...pre, cover: ''}))
  };

  const handleRoomChange = (value, id) => {
    let updatedFile = [...photoList];
    updatedFile = updatedFile.map((item, index) => {
      if (String(index) == id) {
        return { ...item, view: value };
      }
      return item;
    });
    setPhotoList(updatedFile);
    setErrors((pre) => ({...pre, view: ''}))
  };

  const { data: step4Details } = useQuery({
    queryKey: ["step4-details", params?.propertyId],
    queryFn: async () => {
      return getPropertyDetailsApiHandler(
        String(params?.propertyId ?? "")
      );
    },
    select: (resposne) => {
      console.log("step4 details", resposne);
      return resposne.data;
    },
    enabled: params?.propertyId ? true : false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const generatePayload = () => {
    let photos = photoList.map((item) => {
      return {
        fileKey: item.fileKey,
        view: item.view.value,
        isCoverImage: item.isCoverImage,
      };
    });
    let videos = videoList.map((item) => {
      return {
        fileKey: item.fileKey,
        format: item.fileKey.substring(item.fileKey.lastIndexOf('.') + 1),
      };
    });
    return {
      propertyId: String(params?.propertyId),
      photos: photos,
      videos: videos,
    };
  };

  const { mutate: handleStep4Submit, isPending: step4Loader } = useMutation({
    mutationFn: async (
      payload
    ) => {
      return await propertyEditAsAdminAPiPayload(payload);
    },
    onSuccess: (response) => {
      console.log("step4 success response", response);
      // dispatch(setActiveStep({ step: activeStep + 1 }));
      toast.success('Post Property created successfully')
      dispatch(resetProgress())
      dispatch(setActiveStep({step: 1}))
      navigate('/user-dashboard')
    },
    onError: (error) => {
      console.log("step4 error response", error);
      if (Array.isArray(error.message)) {
        error.message.map((item) => {
          toast.error(item);
        });
      } else {
        toast.error(error.message);
      }
    },
  });

  // const { data: step1Details } = useQuery({
  //     queryKey: ["step1-in-4-details", params?.propertyId],
  //     queryFn: async () => {
  //       return propertyEditAsAdminAPiPayload(
  //         String(params?.propertyId ?? "")
  //       );
  //     },
  //     select: (resposne) => {
  //       return resposne;
  //     },
  //     enabled: params?.propertyId ? true : false,
  //     staleTime: 0,
  //     refetchOnMount: true,
  //   });

  // useEffect(() => {
  //     if (step1Details) {
  //       setBasicStaticDetail((pre) => ({
  //           ...pre,
  //           propertyListFor: step1Details?.listingType,
  //           propertyCategory: step1Details?.category,
  //           propertyType: step1Details?.propertyType,
  //       }))
  //       dispatch(setTotalProgress({progress: step1Details.progressPercentage}))
  //     }
  //   }, [step1Details]);

  useEffect(() => {
    if (step4Details) {
      setBasicStaticDetail((pre) => ({
            ...pre,
            propertyListFor: step4Details?.listingType,
            propertyCategory: step4Details?.category,
            propertyType: step4Details?.propertyType,
        }))
      let photo = step4Details.photos?.map((item) => {
        return {
          fileKey: item.fileKey,
          url: import.meta.env.VITE_AWS_URL + item.fileKey,
          view: { label: item.view, value: item.view },
          isCoverImage: item.isCoverImage,
        };
      }) ?? [];
      let video = step4Details.videos?.map((item) => {
        return {
          fileKey: item.fileKey,
          url: import.meta.env.VITE_AWS_URL + item.fileKey + "#t=5",
        };
      }) ?? [];

      setPhotoList(photo);
      setVideoList(video);
    }
  }, [step4Details]);

  return (
    <>
      <div className="flex flex-col gap-4" ref={containerRef}>
        <p className="text-text-black font-semibold text-lg 2md:text-xl pb-2">
          Amenities & Description
        </p>

        <div>
          <FieldLabel label="Add Property Photos" />
          <FieldLabel
            label="Upload clear images to attract more buyers or tenants."
            customClass="text-text-gray font-normal! text-xs!"
          />
        </div>
        <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
          <div className=" flex-1">
            {" "}
            {/*min-w-[230px]*/}
            <ImageUpload
              onUpload={(file) => {
                handleUploadFileToS3(file, "image");
              }}
              type='photo'
              accept={"image/jpeg, image/jpg, image/png, image/gif, image/webp"}
              label="Drag and drop file here"
              subLabel="Upto 50 photos • Max. size 20 MB • Formats: PNG, JPG, JPEG, GIF, WEBP"
            />
          </div>
          {photoList.map((item, index) => {
            return (
              <div className="">
                {" "}
                {/*flex-1 min-w-[230px]*/}
                <PhotoViewer
                  data={item}
                  type="photo"
                  onDelete={handleDeletePhoto}
                  id={String(index)}
                  onCoverChange={handleCoverChange}
                  onRoomChange={handleRoomChange}
                  options={PROPERTY_IMAGE_TYPE}
                />
              </div>
            );
          })}
        </div>
        <div>
          {errors?.photo && (
            <p className="pt-1 text-red-500 text-xs">{errors.photo}</p>
          )}
          {errors?.cover && (
            <p className="pt-1 text-red-500 text-xs">{errors.cover}</p>
          )}
          {errors?.view && (
            <p className="pt-1 text-red-500 text-xs">{errors.view}</p>
          )}
        </div>
        <div>
          <FieldLabel label="Add Property Videos" />
          <FieldLabel
            label="Add a walkthrough video to give buyers a better view of your property."
            customClass="text-text-gray font-normal! text-xs!"
          />
        </div>
        <div className="grid grid-cols-[1fr] lg:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_1fr_1fr] gap-3 items-stretch">
          {" "}
          {/*flex flex-wrap*/}
          <div className="">
            <ImageUpload
              onUpload={(file) => {
                handleUploadFileToS3(file, "video");
              }}
              type='video'
              accept={"video/mp4,video/mov,video/avi,video/mkv,video/webm"}
              label="Drag and drop file here"
              subLabel="Upto 5 video • Max. size 50 MB • Formats: MP4, MOV, AVI, MKV"
            />
          </div>
          {videoList.map((item, index) => {
            return (
              <div className="flex-1 min-w-[230px]">
                <PhotoViewer
                  data={item}
                  type="video"
                  onDelete={handleDeleteVideo}
                  id={String(index)}
                  previewVideo={handleOpenVideoPreview}
                />
              </div>
            );
          })}
        </div>
        <VideoPreviewDialog
          open={openVideoPreview}
          videoUrl={videoPreviewUrl}
          onClose={handleClosePreview}
        />
      </div>
      <div className="flex justify-end w-full">
        <div className="flex flex-wrap justify-start flex-row gap-2 items-center mt-8">
          <button
            onClick={() => {
              if (activeStep != 1) {
                const propertyType = basicStaticDetail.propertyType?.code
                const isStep3Skipped = ['res-sale-plot', 'res-sale-agri-land', 'com-rent-warehouse', 'com-sale-warehouse', 'com-rent-plot', 'com-sale-plot'].includes(propertyType ?? '')
                if(isStep3Skipped){
                  dispatch(setActiveStep({step: activeStep - 2}))
                }else{
                  dispatch(setActiveStep({step: activeStep - 1}))
                }
              }
            }}
            className="w-full md:w-[130px] text-sm 1xl:text-base px-12 py-3 border border-blue text-center cursor-pointer rounded-full bg-light-purple"
          >
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap font-medium`}>Back</p>
            </span>
          </button>
          <button
            disabled={step4Loader}
            onClick={() => {
              if (activeStep == 4) {
                if (validate()) {
                  return;
                }
                let payload = generatePayload();
                handleStep4Submit({id:params.propertyId, data: payload});
              }
            }}
            className="w-full md:w-[130px] text-sm 1xl:text-base animated-button px-12 py-3 border border-blue text-center cursor-pointer"
          >
            <span className="gap-3 relative flex justify-center">
              <p className={`text-nowrap font-medium`}>
                {activeStep == 4 ? "Submit" : "Next"}
              </p>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
