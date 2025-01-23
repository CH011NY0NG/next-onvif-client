"use client";

import React from "react";
import { ItemType } from "@/types/react-dnd";
import { useDrag, useDrop } from "react-dnd";
import {
  TbArrowBackUp,
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
} from "react-icons/tb";
import { TiInfoLarge, TiTimes } from "react-icons/ti";
import clsx from "clsx";

const DeviceListItem = ({
  id,
  index,
  type,
  name,
  parentId,
  moveItem,
  isParentChildRelationship,
  deleteItem,
  updateDevice,
  connectDevice,
  addDevice,
  removeDevice,
  isStreaming,
  isAdded,
  isConnected,
  capabilities,
  information,
  fetchStreamPort,
  resetStreamPort,
}: {
  id: string;
  index: number;
  type: string;
  name: string;
  parentId: string | null;
  moveItem: (draggedId: string, index: number, parentId: string | null) => void;
  addItemToFolder: (draggedId: string, parentId: string | null) => void;
  isParentChildRelationship: (parentId: string, childId: string) => boolean;
  deleteItem: (itemId: string) => void;
  updateDevice: (id: string, host: string) => void;
  addStreamingDevice: (host: string) => void;
  removeStreamingDevice: (key: string) => void;
  connectDevice: (host: string, username: string, password: string) => void;
  addDevice: (key: string) => Promise<boolean>;
  removeDevice: (key: string) => void;
  fetchStreamPort: (host: string) => void;
  resetStreamPort: (host: string) => void;
  isConnected: boolean;
  isAdded: boolean;
  isStreaming: boolean;
  capabilities: any;
  information: any;
}) => {
  const [isEditing, setEditing] = React.useState<boolean>(false);
  const [isDetail, setDetail] = React.useState<boolean>(false);

  const handleAddDevice = async () => {
    if (!isAdded) {
      if (!isEditing && name && isConnected) {
        const check = await addDevice(name);
        setEditing(!check);
      } else {
        setEditing(true);
      }
    }
  };

  const ref = React.useRef<HTMLLIElement | null>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "ITEM",
    item: { id: id, type: "ITEM", parentId: parentId, index: index },
    canDrag: () => !isEditing || !isDetail,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const padding = 4; // px (py-1 = 0.25rem = 4px)
  const [, drop] = useDrop({
    accept: ["ITEM", "FOLDER"],
    drop: (draggedItem: ItemType, monitor) => {
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!hoverBoundingRect || !clientOffset) return;

      if (isParentChildRelationship(draggedItem.id, id)) {
        return;
      }

      if (draggedItem.index === index && draggedItem.parentId === parentId)
        return;

      const hoverUpperY = hoverBoundingRect.top + padding;
      const hoverLowerY = hoverBoundingRect.bottom - padding;
      const mouseY = clientOffset.y;

      let targetIndex;

      const isSameArray = draggedItem.parentId === parentId;

      if (isSameArray) {
        if (mouseY < hoverUpperY) {
          targetIndex = Math.max(
            draggedItem.index! > index ? index : index - 1,
            0,
          );
          moveItem(draggedItem.id, targetIndex, parentId);
        } else if (mouseY > hoverLowerY) {
          targetIndex = Math.max(
            draggedItem.index! < index ? index : index + 1,
            0,
          );
          moveItem(draggedItem.id, targetIndex, parentId);
        } else {
          targetIndex = index;
          moveItem(draggedItem.id, targetIndex, parentId);
        }
      } else {
        if (mouseY < hoverUpperY) {
          targetIndex = Math.max(index, 0);
          moveItem(draggedItem.id, targetIndex, parentId);
        } else if (mouseY > hoverLowerY) {
          targetIndex = Math.max(index + 1, 0);
          moveItem(draggedItem.id, targetIndex, parentId);
        } else {
          targetIndex = index;
          moveItem(draggedItem.id, targetIndex, parentId);
        }
      }
    },
  });
  drag(drop(ref));

  return (
    <li
      ref={ref}
      onClick={handleAddDevice}
      onDragStart={(e) => {
        if (isEditing || isDetail) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      className={`group/item flex items-center rounded py-0.5 ${isDragging && "opacity-30"}`}
    >
      <div
        className={`flex flex-1 flex-col rounded hover:bg-zinc-800 ${isEditing && "bg-zinc-800"} ${isConnected && "border border-violet-500"} `}
      >
        {isDetail && <DeviceListItemInformation information={information} />}
        <div className="flex items-center">
          {isAdded && (
            <DeviceListItemPlay
              name={name}
              isStreaming={isStreaming}
              fetchStreamPort={fetchStreamPort}
              resetStreamPort={resetStreamPort}
            />
          )}
          <DeviceListItemInputs
            name={name}
            id={id}
            isEditing={isEditing}
            setEditing={setEditing}
            updateDevice={updateDevice}
            connectDevice={connectDevice}
            handleAddDevice={handleAddDevice}
          />
          {!isEditing && (
            <DeviceListItemButtons
              id={id}
              name={name}
              isConnected={isConnected}
              setDetail={setDetail}
              removeDevice={removeDevice}
              deleteItem={deleteItem}
            />
          )}
        </div>
        {isDetail && <DeviceListItemCapabilities capabilities={capabilities} />}
      </div>
    </li>
  );
};

const DeviceListItemInputs = ({
  name,
  id,
  isEditing,
  setEditing,
  updateDevice,
  connectDevice,
}: {
  name: string;
  id: string;
  isEditing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  updateDevice: (id: string, host: string) => void;
  connectDevice: (host: string, username: string, password: string) => void;
  handleAddDevice: () => void;
}) => {
  const [hostInput, setHostInput] = React.useState<string>(name);
  const usernameRef = React.useRef<HTMLInputElement | null>(null);
  const passwordRef = React.useRef<HTMLInputElement | null>(null);

  const handleConnect = () => {
    setEditing(false);
    if (hostInput !== "") {
      connectDevice(
        hostInput,
        usernameRef.current?.value!,
        passwordRef.current?.value!,
      );
      updateDevice(id, hostInput);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-1">
      <input
        type="text"
        name="host"
        placeholder="Host"
        defaultValue={hostInput || ""}
        autoComplete="one-time-code"
        readOnly={!isEditing}
        onChange={(e) => setHostInput(e.target.value)}
        className={clsx(
          "w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded bg-transparent px-2 py-1 text-sm placeholder:text-zinc-500 focus:outline-none",
          isEditing && "cursor-text bg-zinc-700",
        )}
      />
      {isEditing && (
        <>
          <input
            type="text"
            name="username"
            placeholder="Username"
            defaultValue=""
            autoComplete="one-time-code"
            onClick={(e) => e.stopPropagation()}
            ref={usernameRef}
            className={clsx(
              "w-full overflow-hidden text-ellipsis whitespace-nowrap rounded bg-transparent px-2 py-1 text-sm placeholder:text-zinc-500 focus:outline-none",
              isEditing && "bg-zinc-700",
            )}
          />
          <input
            type="password"
            name="onvif-password"
            placeholder="Password"
            defaultValue=""
            autoComplete="one-time-code"
            onClick={(e) => e.stopPropagation()}
            ref={passwordRef}
            className={clsx(
              "w-full overflow-hidden text-ellipsis whitespace-nowrap rounded bg-transparent px-2 py-1 text-sm placeholder:text-zinc-500 focus:outline-none",
              isEditing && "bg-zinc-700",
            )}
          />
          <div className="flex w-full items-center justify-between">
            <button
              className={`rounded bg-zinc-700 px-7 py-0.5 text-center text-xs hover:text-violet-500`}
              onClick={(e) => {
                e.stopPropagation();
                handleConnect();
              }}
            >
              CONNECT
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(false);
              }}
              className="rounded bg-zinc-700 p-0.5 hover:text-red-500"
            >
              <TbArrowBackUp />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const DeviceListItemCapabilities = ({
  capabilities,
}: {
  capabilities: any;
}) => {
  const [dragging, setDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const container = e.currentTarget;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1; // 스크롤 속도 조정
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div className="w-0 min-w-full overflow-x-scroll overflow-y-scroll whitespace-nowrap px-1 scrollbar-hide">
      <div
        className="space-x-1 overflow-y-hidden scrollbar-hide"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {[
          capabilities.PTZ && "PTZSupported",
          capabilities.media?.streamingCapabilities?.RTP_TCP && "RTPTCP",
          capabilities.media?.streamingCapabilities?.RTP_RTSP_TCP &&
            "RTSPOverTCP",
          capabilities.media?.streamingCapabilities?.RTPMulticast &&
            "RTPMulticast",
          capabilities.events?.WSSubscriptionPolicySupport &&
            "EventSubscription",
          capabilities.events?.WSPullPointSupport && "PullPointSupport",
          capabilities.events?.WSPausableSubscriptionManagerInterfaceSupport &&
            "PausableSubscriptionSupport",
          capabilities.analytics?.ruleSupport && "RuleSupport",
          capabilities.analytics?.analyticsModuleSupport &&
            "AnalyticsModuleSupport",
          capabilities.device?.network?.IPFilter && "IPFilter",
          capabilities.device?.network?.zeroConfiguration &&
            "ZeroConfiguration",
          capabilities.device?.network?.IPVersion6 && "IPv6Support",
          capabilities.device?.network?.dynDNS && "DynamicDNS",
          capabilities.device?.system?.discoveryResolve && "DiscoveryResolve",
          capabilities.device?.system?.discoveryBye && "DiscoveryBye",
          capabilities.device?.system?.remoteDiscovery && "RemoteDiscovery",
          capabilities.device?.system?.systemBackup && "SystemBackup",
          capabilities.device?.system?.systemLogging && "SystemLogging",
          capabilities.device?.system?.firmwareUpgrade && "FirmwareUpgrade",
          capabilities.device?.security?.TLS1_1 && "TLS1.1",
          capabilities.device?.security?.TLS1_2 && "TLS1.2",
          capabilities.device?.security?.onboardKeyGeneration &&
            "OnboardKeyGeneration",
          capabilities.device?.security?.accessPolicyConfig &&
            "AccessPolicyConfig",
          capabilities.device?.security?.X_509Token && "X.509Token",
          capabilities.device?.security?.SAMLToken && "SAMLToken",
          capabilities.device?.security?.kerberosToken && "KerberosToken",
          capabilities.device?.security?.RELToken && "RELToken",
          capabilities.device?.IO?.relayOutputs &&
            `RelayOutputs(${capabilities.device.IO.relayOutputs})`,
        ]
          .filter(Boolean)
          .map((tag, index) => (
            <span
              key={index}
              className="rounded-lg bg-violet-500 px-1 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
      </div>
    </div>
  );
};

const DeviceListItemButtons = ({
  id,
  name,
  isConnected,
  setDetail,
  removeDevice,
  deleteItem,
}: {
  id: string;
  name: string;
  isConnected: boolean;
  setDetail: React.Dispatch<React.SetStateAction<boolean>>;
  removeDevice: (key: string) => void;
  deleteItem: (itemId: string) => void;
}) => {
  const handleRemove = () => {
    deleteItem?.(id);
    removeDevice(name);
  };
  return (
    <div className="mx-1 hidden group-hover/item:flex">
      {isConnected && (
        <button
          className="text-lg text-zinc-500 hover:text-violet-500"
          onClick={(e) => {
            e.stopPropagation();
            setDetail((prevState) => !prevState);
          }}
        >
          <TiInfoLarge />
        </button>
      )}

      <button
        className="text-lg text-zinc-500 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
      >
        <TiTimes />
      </button>
    </div>
  );
};

const DeviceListItemPlay = ({
  isStreaming,
  fetchStreamPort,
  resetStreamPort,
  name,
}: {
  name: string;
  isStreaming: boolean;
  fetchStreamPort: (host: string) => void;
  resetStreamPort: (host: string) => void;
}) => {
  const handleToggleClick = () => {
    if (isStreaming) {
      resetStreamPort(name);
    } else {
      fetchStreamPort(name);
    }
  };
  return (
    <button
      className={clsx("ml-1 text-violet-500")}
      onClick={handleToggleClick}
    >
      {isStreaming ? <TbPlayerPauseFilled /> : <TbPlayerPlayFilled />}
    </button>
  );
};

const DeviceListItemInformation = ({ information }: { information: any }) => {
  return (
    <div className={`w-0 min-w-full rounded px-2 py-1 text-sm font-bold`}>
      {information.manufacturer} - {information.model}
    </div>
  );
};

export default DeviceListItem;
