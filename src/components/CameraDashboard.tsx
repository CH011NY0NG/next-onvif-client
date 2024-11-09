"use client";

import React from "react";
import { StreamViewer } from "./StreamViewer";
import { DeviceList } from "./DeviceList";

export const CameraDashboard = () => {
  const [socketPort, setSocketPort] = React.useState<number | null>(null);
  const [streamHost, setStreamHost] = React.useState<string | null>("");

  const stopStreaming = () => {
    setSocketPort(null);
    setStreamHost(null);
  };

  const fetchStreamPort = async (
    host: string,
    username: string,
    password: string
  ) => {
    stopStreaming();
    try {
      const { hostname, port } = new URL(`http://${host}`);
      const response = await fetch(`/api/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostname, port, username, password }),
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSocketPort(data.port);
      setStreamHost(data.host);
      /* console.log(data.host); */
    } catch (error) {
      /*  console.error("API 호출 실패:", error); */
    }
  };

  return (
    <div className="flex h-screen">
      <DeviceList
        fetchStreamPort={fetchStreamPort}
        stopStreaming={stopStreaming}
        streamHost={streamHost}
      />
      <div className="flex-1 p-8 bg-zinc-800 overflow-y-auto">
        {/*  <div className="grid grid-cols-5 gap-2"></div> */}
        <StreamViewer port={socketPort!} />
      </div>
    </div>
  );
};
