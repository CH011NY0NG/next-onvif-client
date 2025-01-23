"use client";

import React from "react";
import io from "socket.io-client";
import { TiTimes } from "react-icons/ti";
import { TbPlayerPauseFilled, TbPlayerPlayFilled } from "react-icons/tb";
import { DevicePtz } from "./DevicePtz";

const DeviceStreamPanel = ({
  host,
  wsPort,
  snapshot,
  isStreaming,
  removeStreamingDevice,
  fetchStreamPort,
  resetStreamPort,
  isSelected,
  onSelect,
}: {
  host: string;
  wsPort: string | null;
  snapshot: string | null;
  removeStreamingDevice: (key: string) => void;
  fetchStreamPort: (host: string) => void;
  resetStreamPort: (host: string) => void;
  isStreaming: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [streamImage, setStreamImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (wsPort) {
      const socket = io(
        `${window.location.protocol}//${window.location.hostname}:${wsPort}`,
        {
          transports: ["websocket"],
        },
      );

      socket.on("connect", () => {});

      socket.on("data", (data: string) => {
        setStreamImage(`data:image/jpeg;base64,${data}`);
      });

      socket.on("disconnect", () => {});

      return () => {
        socket.disconnect();
        setStreamImage(null);
      };
    }
  }, [wsPort]);

  return (
    <div
      onClick={onSelect}
      className={`group/item relative overflow-hidden rounded ${
        isStreaming && "border border-violet-500"
      }`}
    >
      <div className="text-zinc-40 absolute left-0 top-0 z-10 m-2 rounded bg-zinc-800 px-1">
        {host}
      </div>
      <button
        className="absolute right-0 top-0 z-10 m-1 text-2xl text-zinc-500 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          removeStreamingDevice(host);
        }}
      >
        <TiTimes />
      </button>

      <div className="relative aspect-[4/3] w-full bg-zinc-900">
        {isStreaming
          ? streamImage && <DeviceStreamImage image={streamImage!} />
          : snapshot && <DeviceStreamSnapshot image={snapshot!} />}

        <div className="hidden group-hover/item:block">
          {isStreaming ? (
            <button
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-violet-500"
              onClick={(e) => {
                e.stopPropagation();
                resetStreamPort(host);
              }}
            >
              <TbPlayerPauseFilled className="text-6xl" />
            </button>
          ) : (
            <button
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
              onClick={(e) => {
                e.stopPropagation();
                fetchStreamPort(host);
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
const DeviceStreamImage = ({ image }: { image: string }) => {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
      <img
        src={image}
        alt="RTSP Stream"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

const DeviceStreamSnapshot = ({ image }: { image: string }) => {
  const [isError, setIsError] = React.useState(false);

  if (isError) {
    return null;
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
      <img
        src={image}
        alt="Snapshot"
        className="h-full w-full object-cover"
        onError={() => setIsError(true)}
      />
    </div>
  );
};

export default DeviceStreamPanel;
