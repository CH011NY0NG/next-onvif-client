"use client";

import React from "react";
import { TiRefresh } from "react-icons/ti";
import { DeviceListItem } from "./DeviceListItem";
import { deviceType } from "@/types/device";

export const DiscoveredDeviceList = ({
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
  const [discoveredDevices, setDiscoveredDevices] = React.useState<
    deviceType[]
  >([]);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const [isError, setError] = React.useState<boolean>(false);

  const fetchDevices = async () => {
    setError(false);
    setLoading(true);
    stopStreaming();
    setDiscoveredDevices([]);

    const response = await fetch("/api/discover");

    if (!response.ok) {
      setError(true);
      setLoading(false);
      return;
    }

    const data = await response.json();
    const initialDevices = data.devices.map(
      (device: deviceType, index: number) => ({
        id: index,
        username: "",
        password: "",
        host: device.host,
      })
    );
    setDiscoveredDevices(initialDevices);
    setLoading(false);
  };
  React.useEffect(() => {
    fetchDevices();
  }, []);

  const updateDiscoveredDevice = (index: number, updatedDevice: deviceType) => {
    setDiscoveredDevices((prevDevices: deviceType[]) =>
      prevDevices.map((device, i) => (i === index ? updatedDevice : device))
    );
  };

  const Loading = () => (
    <div className="flex justify-center space-x-2 mt-2">
      <style>
        {`
          @keyframes bounce {
            0%, 66%, 100% { opacity: 0; }
            33% { opacity: 1; }
          }
          .bounce-animation {
            animation: bounce 1s infinite ease-in-out both;
          }
        `}
      </style>
      <div
        className="w-3 h-3 bg-zinc-800 rounded-full bounce-animation"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="w-3 h-3 bg-zinc-800 rounded-full bounce-animation"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-3 h-3 bg-zinc-800 rounded-full bounce-animation"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Discovered Devices</h2>
        <button
          onClick={fetchDevices}
          className="text-2xl text-zinc-500 hover:text-zinc-400 p-1 rounded-2xl hover:bg-zinc-800"
        >
          <TiRefresh className="transform scale-125" />
        </button>
      </div>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <p className="text-xs font-bold text-zinc-500 mt-1">
          ONVIF discovery found no devices
        </p>
      ) : (
        <ul className="space-y-2">
          {discoveredDevices.map((device: deviceType, index: number) => (
            <DeviceListItem
              device={device}
              key={device.id}
              onUpdate={(updatedDevice) =>
                updateDiscoveredDevice(index, updatedDevice)
              }
              fetchStreamPort={fetchStreamPort}
              stopStreaming={stopStreaming}
              streamHost={streamHost}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
