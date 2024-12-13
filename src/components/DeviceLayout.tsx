"use client";

import React from "react";
import { DevicePanel } from "./DevicePanel";

export const DeviceLayout = ({
  streamingDevices,
  removeStreamingDevice,
  toggleStream,
}: {
  streamingDevices: { host: string; stream: boolean }[];
  removeStreamingDevice: (key: string) => void;
  toggleStream: (host: string, stream: boolean) => void;
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  return (
    <div className="flex-1 p-8 bg-zinc-800 overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        {streamingDevices.map((item, index) => (
          <div
            key={item.host}
            className={`transition-all duration-300 ${
              selectedIndex === index
                ? "col-span-2 row-span-2"
                : "col-span-1 row-span-1"
            }`}
          >
            <DevicePanel
              host={item.host}
              isStreaming={item.stream}
              removeStreamingDevice={removeStreamingDevice}
              toggleStream={toggleStream}
              isSelected={selectedIndex === index}
              onSelect={() =>
                setSelectedIndex(selectedIndex === index ? null : index)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};
