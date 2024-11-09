"use client";
import { deviceType } from "@/types/device";
import React from "react";
import { TiCog, TiMediaPlay, TiTick, TiTimes } from "react-icons/ti";

export const DeviceListItem = ({
  device,
  onUpdate,
  fetchStreamPort,
  removeDevice,
  stopStreaming,
  streamHost,
}: {
  device: deviceType;
  onUpdate: (updatedDevice: deviceType) => void;
  fetchStreamPort: (
    host: string,
    username: string,
    password: string
  ) => Promise<void>;
  removeDevice?: (deviceId: number) => void;
  stopStreaming: () => void;
  streamHost: string | null;
}) => {
  const [onAuth, setAuth] = React.useState<boolean>(false);
  const [localDevice, setLocalDevice] = React.useState<deviceType>(device);
  const isStreaming = streamHost === localDevice.host;

  const handleInputClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  return (
    <li
      onClick={() => {
        if (!onAuth && localDevice.host !== "") {
          fetchStreamPort(
            localDevice.host,
            localDevice.username!,
            localDevice.password!
          );
        }
      }}
      className={`group flex items-center pr-1 rounded border border-zinc-800 hover:bg-zinc-800 hover:opacity-100 ${
        onAuth && "bg-zinc-800"
      }`}
    >
      {isStreaming && (
        <div className="ml-1">
          <TiMediaPlay className="text-violet-600 text-xl" />
        </div>
      )}

      <div className="flex flex-col flex-1 gap-1 ">
        <input
          type="text"
          placeholder="Host"
          defaultValue={device.host}
          autoComplete="onvif-host"
          readOnly={!onAuth}
          onChange={(e) =>
            setLocalDevice((prevDevice) => ({
              ...prevDevice,
              host: e.target.value,
            }))
          }
          className={`w-full rounded px-2 py-1  text-ellipsis whitespace-nowrap overflow-hidden placeholder:text-zinc-500 ${
            onAuth
              ? " bg-zinc-700 "
              : "cursor-pointer bg-transparent focus:outline-none"
          }`}
        />
        {onAuth && (
          <>
            <input
              type="text"
              placeholder="Username"
              defaultValue={device.username || ""}
              autoComplete="onvif-username"
              onClick={handleInputClick}
              onChange={(e) =>
                setLocalDevice((prevDevice) => ({
                  ...prevDevice,
                  username: e.target.value,
                }))
              }
              className={`w-full rounded px-2 py-1   placeholder:text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis   ${
                onAuth ? "bg-zinc-700" : "bg-transparent"
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              defaultValue={device.password || ""}
              autoComplete="onvif-password"
              onClick={handleInputClick}
              onChange={(e) =>
                setLocalDevice((prevDevice) => ({
                  ...prevDevice,
                  password: e.target.value,
                }))
              }
              className={`w-full rounded px-2 py-1  placeholder:text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis  ${
                onAuth ? "bg-zinc-700" : "bg-transparent"
              }`}
            />
          </>
        )}
      </div>

      {onAuth ? (
        <button
          className="text-xl ml-2 text-zinc-500 hover:text-green-500"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(localDevice);
            setAuth(false);
          }}
        >
          <TiTick />
        </button>
      ) : (
        <div className="hidden group-hover:flex ml-2">
          <button
            className="text-xl text-zinc-500 hover:text-zinc-400"
            onClick={(e) => {
              if (isStreaming) {
                stopStreaming();
              }
              e.stopPropagation();
              setAuth((prevState) => !prevState);
            }}
          >
            <TiCog />
          </button>
          {removeDevice && (
            <button
              className="text-xl text-zinc-500 hover:text-red-600"
              onClick={(e) => {
                if (isStreaming) {
                  stopStreaming();
                }
                e.stopPropagation();
                removeDevice(device.id!);
              }}
            >
              <TiTimes />
            </button>
          )}
        </div>
      )}
    </li>
  );
};
