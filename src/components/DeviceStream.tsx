"use client";

import React from "react";

export const DeviceStream = ({ image }: { image: string }) => {
  return (
    <div className="relative aspect-[4/3]">
      <img src={image} alt="RTSP Stream" className="absolute w-full" />
    </div>
  );
};
