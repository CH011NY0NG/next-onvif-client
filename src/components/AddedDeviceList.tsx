"use client";

import React from "react";
import { DeviceListItem } from "./DeviceListItem";
import { TiPlus } from "react-icons/ti";
import { deviceType } from "@/types/device";

export const AddedDeviceList = ({
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
  const [addedDevices, setAddedDevices] = React.useState<deviceType[]>([]);
  const [addDeviceOrder, setAddDeviceOrder] = React.useState<number>(1);
  const addDevice = () => {
    setAddedDevices((prevDevices: deviceType[]) => [
      ...prevDevices,
      {
        id: addDeviceOrder,
        host: "",
        username: "",
        password: "",
      },
    ]);
    setAddDeviceOrder((prevOrder) => prevOrder + 1);
  };

  const updateAddedDevice = (index: number, updatedDevice: deviceType) => {
    setAddedDevices((prevDevices: deviceType[]) =>
      prevDevices.map((device, i) => (i === index ? updatedDevice : device))
    );
  };

  const removeDevice = (deviceId: number) => {
    setAddedDevices((prevDevices: deviceType[]) =>
      prevDevices.filter((device) => device.id !== deviceId)
    );
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex  items-center justify-between">
        <h2 className="text-lg font-bold">Manual Devices</h2>
        <button className="text-2xl text-zinc-500 hover:text-zinc-400 p-1 rounded-2xl hover:bg-zinc-800">
          <TiPlus onClick={addDevice} />
        </button>
      </div>
      <ul className="space-y-2">
        {addedDevices.map((device: deviceType, index: number) => (
          <DeviceListItem
            device={device}
            key={device.id}
            onUpdate={(updatedDevice) =>
              updateAddedDevice(index, updatedDevice)
            }
            removeDevice={removeDevice}
            fetchStreamPort={fetchStreamPort}
            stopStreaming={stopStreaming}
            streamHost={streamHost}
          />
        ))}
      </ul>
    </div>
  );
};
