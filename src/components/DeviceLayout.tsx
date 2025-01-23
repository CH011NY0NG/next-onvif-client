"use client";

import React from "react";
import DeviceStreamPanel from "./DeviceStreamPanel";

export const DeviceLayout = ({
  streamingDevices,
  removeStreamingDevice,
  fetchStreamPort,
  resetStreamPort,
}: {
  streamingDevices: {
    host: string;
    stream: boolean;
    wsPort: string | null;
    snapshot: string | null;
  }[];
  removeStreamingDevice: (key: string) => void;
  fetchStreamPort: (host: string) => void;
  resetStreamPort: (host: string) => void;
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  return (
    <div className="flex-1 overflow-y-auto bg-zinc-800 p-8">
      {selectedIndex !== null && (
        <div className="mb-4 rounded-md border border-zinc-600 bg-zinc-700 p-4">
          <DeviceStreamPanel
            host={streamingDevices[selectedIndex].host}
            wsPort={streamingDevices[selectedIndex].wsPort}
            snapshot={streamingDevices[selectedIndex].snapshot!}
            isStreaming={streamingDevices[selectedIndex].stream}
            removeStreamingDevice={removeStreamingDevice}
            fetchStreamPort={fetchStreamPort}
            resetStreamPort={resetStreamPort}
            isSelected={true}
            onSelect={() => setSelectedIndex(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {streamingDevices.map((item, index) =>
          selectedIndex === index ? null : (
            <div
              key={item.host}
              className="col-span-1 row-span-1 min-w-[200px] max-w-[300px] transition-all duration-300"
            >
              <DeviceStreamPanel
                host={item.host}
                wsPort={item.wsPort}
                snapshot={item.snapshot!}
                isStreaming={item.stream}
                removeStreamingDevice={removeStreamingDevice}
                fetchStreamPort={fetchStreamPort}
                resetStreamPort={resetStreamPort}
                isSelected={false}
                onSelect={() => setSelectedIndex(index)}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
};
