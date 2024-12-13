"use client";

import React from "react";
import io from "socket.io-client";
import { DeviceStream } from "./DeviceStream";
import { TiTimes } from "react-icons/ti";
import { TbPlayerPauseFilled, TbPlayerPlayFilled } from "react-icons/tb";
import { DevicePtz } from "./DevicePtz";

export const DevicePanel = ({
  host,
  isStreaming,
  removeStreamingDevice,
  toggleStream,
  isSelected,
  onSelect,
}: {
  host: string;
  removeStreamingDevice: (key: string) => void;
  toggleStream: (host: string, stream: boolean) => void;
  isStreaming: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [image, setImage] = React.useState<string | null>(null);
  const [socketPort, setSocketPort] = React.useState<number | null>(null);

  const fetchStreamPort = async () => {
    try {
      const response = await fetch(`/api/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ host }),
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSocketPort(data.port);
      toggleStream(host, true);
    } catch (error) {}
  };

  React.useEffect(() => {
    if (socketPort) {
      const socket = io(
        `${window.location.protocol}//${window.location.hostname}:${socketPort}`,
        {
          transports: ["websocket"],
        }
      );

      socket.on("connect", () => {});

      socket.on("data", (data: string) => {
        setImage(`data:image/jpeg;base64,${data}`);
      });

      socket.on("disconnect", () => {});

      return () => {
        socket.disconnect();
        setImage(null);
        toggleStream(host, false);
      };
    }
  }, [socketPort]);

  return (
    <div
      onClick={onSelect}
      className={`group/item relative rounded overflow-hidden ${
        isStreaming && "border border-violet-500"
      }`}
    >
      <div className="absolute top-0 left-0 z-10 bg-zinc-800 text-zinc-40 rounded px-1 m-2">
        {host}
      </div>
      <button
        className="absolute top-0 right-0 text-2xl text-zinc-500 hover:text-red-600 z-10 m-1"
        onClick={(e) => {
          e.stopPropagation();
          removeStreamingDevice(host);
        }}
      >
        <TiTimes />
      </button>

      <div className="relative aspect-[4/3] w-full bg-zinc-900">
        {image && <DeviceStream image={image} />}
        <div className="hidden group-hover/item:block">
          {isStreaming ? (
            <button
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-500  z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSocketPort(null);
              }}
            >
              <TbPlayerPauseFilled className="text-6xl" />
            </button>
          ) : (
            <button
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 z-10"
              onClick={(e) => {
                e.stopPropagation();
                fetchStreamPort();
              }}
            >
              <TbPlayerPlayFilled className="text-6xl" />
            </button>
          )}
        </div>
      </div>
      {isStreaming && <DevicePtz host={host} />}
    </div>
  );
};
