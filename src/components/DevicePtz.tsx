"use client";

import React from "react";
import {
  TiArrowDownThick,
  TiArrowLeftThick,
  TiArrowRightThick,
  TiArrowUpThick,
} from "react-icons/ti";
import { TbZoomIn, TbZoomOut } from "react-icons/tb";

export const DevicePtz = ({ host }: { host: string }) => {
  const ptzControl = async ({
    key,
    action,
    speed,
    duration,
  }: {
    key: string;
    action: "pan" | "tilt" | "zoom";
    speed: number;
    duration?: number;
  }) => {
    try {
      const response = await fetch("/api/ptz-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action, speed, duration }),
      });

      if (!response.ok) {
        const error = await response.json();

        return { success: false, error };
      }

      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleControl = async (
    action: "pan" | "tilt" | "zoom",
    speed: number,
  ) => {
    const response = await ptzControl({
      key: host,
      action,
      speed,
      duration: 1000,
    });

    if (!response.success) {
    } else {
    }
  };

  return (
    <div className="flex w-full justify-evenly bg-zinc-900 p-1 text-zinc-500">
      <button
        className="text-3xl hover:text-zinc-400"
        onClick={(e) => {
          e.stopPropagation();
          handleControl("pan", -1);
        }}
      >
        <TiArrowLeftThick />
      </button>
      <button
        className="text-3xl hover:text-zinc-400"
        onClick={(e) => {
          e.stopPropagation();
          handleControl("tilt", 1);
        }}
      >
        <TiArrowUpThick />
      </button>
      <button
        className="text-3xl hover:text-zinc-400"
        onClick={(e) => {
          e.stopPropagation();
          handleControl("tilt", -1);
        }}
      >
        <TiArrowDownThick />
      </button>
      <button
        className="text-3xl hover:text-zinc-400"
        onClick={(e) => {
          e.stopPropagation();
          handleControl("pan", 1);
        }}
      >
        <TiArrowRightThick />
      </button>
      <button
        className="text-3xl hover:text-zinc-400"
        onClick={(e) => {
          e.stopPropagation();
          handleControl("zoom", 1);
        }}
      >
        <TbZoomIn />
      </button>
      <button
        className="text-3xl hover:text-zinc-400"
        onClick={(e) => {
          e.stopPropagation();
          handleControl("zoom", 1);
        }}
      >
        <TbZoomOut />
      </button>
    </div>
  );
};
