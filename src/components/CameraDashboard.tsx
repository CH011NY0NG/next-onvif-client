"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DeviceList } from "./DeviceList";
import { DeviceLayout } from "./DeviceLayout";

export const CameraDashboard = () => {
  const [streamingDevices, setStreamingDevices] = React.useState<
    {
      host: string;
      stream: boolean;
      wsPort: string | null;
      snapshot: string | null;
    }[]
  >([]);

  const fetchStreamPort = async (host: string) => {
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
      setStreamingDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.host === host
            ? { ...device, stream: true, wsPort: data.port }
            : device,
        ),
      );
    } catch (error) {}
  };

  const resetStreamPort = (host: string) => {
    setStreamingDevices((prevDevices) =>
      prevDevices.map((device) =>
        device.host === host
          ? { ...device, stream: false, wsPort: null }
          : device,
      ),
    );
  };

  const addStreamingDevice = async (host: string) => {
    const snapshot = await getSnapshot(host);
    setStreamingDevices((prevDevices) => {
      if (prevDevices.some((device) => device.host === host)) {
        return prevDevices;
      }

      return [...prevDevices, { host, stream: false, wsPort: null, snapshot }];
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

  const getSnapshot = async (host: string) => {
    try {
      const response = await fetch(`/api/snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ host }),
        credentials: "include",
        cache: "no-store",
      });

      const { snapshot } = await response.json();
      return snapshot;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <DndProvider backend={HTML5Backend}>
        <DeviceList
          addStreamingDevice={addStreamingDevice}
          removeStreamingDevice={removeStreamingDevice}
          streamingDevices={streamingDevices}
          fetchStreamPort={fetchStreamPort}
          resetStreamPort={resetStreamPort}
        />
      </DndProvider>

      <DeviceLayout
        streamingDevices={streamingDevices}
        removeStreamingDevice={removeStreamingDevice}
        fetchStreamPort={fetchStreamPort}
        resetStreamPort={resetStreamPort}
      />
    </div>
  );
};
