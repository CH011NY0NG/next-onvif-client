"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DeviceList } from "./DeviceList";
import { DeviceLayout } from "./DeviceLayout";

export const CameraDashboard = () => {
  const [streamingDevices, setStreamingDevices] = React.useState<
    { host: string; stream: boolean }[]
  >([]);

  const addStreamingDevice = (host: string) => {
    setStreamingDevices((prevDevices) => {
      if (prevDevices.some((device) => device.host === host)) {
        return prevDevices;
      }

      return [...prevDevices, { host, stream: false }];
    });
  };

  const removeStreamingDevice = (host: string) => {
    setStreamingDevices((prevDevices) => {
      if (!prevDevices.some((device) => device.host === host)) {
        return prevDevices;
      }
      return prevDevices.filter((device) => device.host !== host);
    });
  };

  const toggleStream = (host: string, stream: boolean) => {
    setStreamingDevices((prevDevices) =>
      prevDevices.map((device) =>
        device.host === host ? { ...device, stream } : device
      )
    );
  };

  return (
    <div className="flex h-screen">
      <DndProvider backend={HTML5Backend}>
        <DeviceList
          addStreamingDevice={addStreamingDevice}
          removeStreamingDevice={removeStreamingDevice}
          streamingDevices={streamingDevices}
        />
      </DndProvider>

      <DeviceLayout
        streamingDevices={streamingDevices}
        removeStreamingDevice={removeStreamingDevice}
        toggleStream={toggleStream}
      />
    </div>
  );
};
