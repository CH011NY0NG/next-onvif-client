"use client";

import React from "react";
import { DiscoveredDeviceList } from "./DiscoveredDeviceList";
import { AddedDeviceList } from "./AddedDeviceList";

export const DeviceList = ({
  fetchStreamPort,
  stopStreaming,
  streamHost,
}: {
  fetchStreamPort: (
    host: string,
    username: string,
    password: string
  ) => Promise<void>;
  stopStreaming: () => void;
  streamHost: string | null;
}) => {
  return (
    <aside className="flex flex-col gap-4 w-[260px] bg-zinc-900 p-4 overflow-y-auto">
      <DiscoveredDeviceList
        fetchStreamPort={fetchStreamPort}
        stopStreaming={stopStreaming}
        streamHost={streamHost}
      />
      <AddedDeviceList
        fetchStreamPort={fetchStreamPort}
        stopStreaming={stopStreaming}
        streamHost={streamHost}
      />
    </aside>
  );
};
