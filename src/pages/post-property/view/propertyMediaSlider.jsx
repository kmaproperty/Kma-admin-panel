"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function MediaSlider({
  propertyDetails,
  imageBaseUrl,
  handleOpenVideoPreview,
}) {
  const media = [
    ...(propertyDetails?.photos || []).map(item => ({
      type: "image",
      ...item,
    })),
    ...(propertyDetails?.videos || []).map(item => ({
      type: "video",
      ...item,
    })),
  ];

  if (!media.length) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={12}
        slidesPerView={1}
        className="w-full rounded-lg"
      >
        {media.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full max-h-[55vh] rounded-lg overflow-hidden bg-black">
              
              {/* IMAGE */}
              {item.type === "image" && (
                <>
                  <img
                    src={imageBaseUrl + item.fileKey}
                    alt="property"
                    className="w-full max-h-[55vh] object-cover object-center"
                  />
                  <p className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    {item.view}
                  </p>
                </>
              )}

              {/* VIDEO */}
              {item.type === "video" && (
                <>
                  <video
                    src={imageBaseUrl + item.fileKey + "?t=5"}
                    className="w-full h-[55vh] object-cover"
                    muted
                  />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                    //   onClick={() =>
                    //     handleOpenVideoPreview(imageBaseUrl + item.fileKey)
                    //   }
                      className="cursor-pointer flex items-center justify-center w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 transition"
                    >
                      <img
                        src="/assets/play-white.svg"
                        alt="play"
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
