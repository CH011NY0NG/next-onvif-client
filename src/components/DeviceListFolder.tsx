"use client";

import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { TiTimes } from "react-icons/ti";
import {
  TbFolder,
  TbFolderOpen,
  TbPencil,
  TbPencilCheck,
} from "react-icons/tb";
import { ItemType } from "@/types/react-dnd";
import DeviceListItem from "./DeviceListItem";
import clsx from "clsx";

export const DeviceListFolder = ({
  id,
  index,
  name,
  type,
  parentId,
  items,
  moveItem,
  addItemToFolder,
  isParentChildRelationship,
  deleteItem,
  updateDevice,
  updateFolder,
  connectDevice,
  addStreamingDevice,
  removeStreamingDevice,
  streamingDevices,
  connectedDevices,
  addDevice,
  removeDevice,
  fetchStreamPort,
  resetStreamPort,
}: {
  id: string;
  index: number;
  name: string;
  type: string;
  parentId: string | null;
  items: ItemType[];
  moveItem: (draggedId: string, index: number, parentId: string | null) => void;
  addItemToFolder: (draggedId: string, parentId: string | null) => void;
  isParentChildRelationship: (parentId: string, childId: string) => boolean;
  deleteItem: (itemId: string) => void;
  updateDevice: (id: string, host: string) => void;
  updateFolder: (id: string, name: string) => void;
  addStreamingDevice: (host: string) => void;
  connectDevice: (host: string, username: string, password: string) => void;
  addDevice: (key: string) => Promise<boolean>;
  removeDevice: (key: string) => void;
  removeStreamingDevice: (host: string) => void;
  streamingDevices: { host: string; stream: boolean }[];
  connectedDevices: any[];
  fetchStreamPort: (host: string) => void;
  resetStreamPort: (host: string) => void;
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [nameInput, setNameInput] = React.useState<string>(name);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [onAuth, setAuth] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (inputRef.current && onAuth) {
      inputRef.current.focus();
    }
  }, [onAuth]);

  const [{ isDragging }, drag] = useDrag({
    type: "FOLDER",
    item: () => {
      setOpen(false);
      return { id: id, type: "FOLDER", parentId: parentId, index: index };
    },
    canDrag: () => !onAuth,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [conditionalIsOver, setConditionalIsOver] =
    React.useState<boolean>(false);

  const padding = 4; // px (py-1 = 0.25rem = 4px)

  const [{ isOverItem }, drop] = useDrop({
    accept: ["FOLDER", "ITEM"],
    drop: (draggedItem: ItemType, monitor) => {
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!hoverBoundingRect || !clientOffset) return;

      if (isParentChildRelationship(draggedItem.id, id)) {
        console.warn("Cannot drop a parent onto its child!");
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
          addItemToFolder(draggedItem.id, id);

          setOpen(true);
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
          addItemToFolder(draggedItem.id, id);
          setOpen(true);
        }
      }
    },
    hover: (draggedItem, monitor) => {
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!hoverBoundingRect || !clientOffset) return;

      const hoverUpperY = hoverBoundingRect.top + padding;
      const hoverLowerY = hoverBoundingRect.bottom - padding;
      const mouseY = clientOffset.y;
      if (mouseY >= hoverUpperY && mouseY <= hoverLowerY) {
        setConditionalIsOver(true);
      } else {
        setConditionalIsOver(false);
      }
    },
    collect: (monitor) => ({
      isOverItem: monitor.isOver({ shallow: true }) && conditionalIsOver,
    }),
  });

  React.useEffect(() => {
    if (items.length === 0) {
      setOpen(false);
    }
  }, [items.length]);

  drag(drop(ref));
  return (
    <div ref={ref} className="py-1">
      <div
        className={clsx(
          "rounded",
          isDragging && "opacity-30",
          isOverItem ? "bg-zinc-800" : "bg-zinc-900",
          isOpen ? "border border-zinc-800" : "border border-transparent",
        )}
      >
        <div className={`group flex cursor-move items-center justify-between`}>
          <div className={`flex items-center`}>
            {isOpen ? (
              <TbFolderOpen
                className={clsx(
                  "text-xl",
                  items.length > 0 ? "text-zinc-500" : "text-zinc-700",
                )}
              />
            ) : (
              <TbFolder
                className={clsx(
                  "text-xl",
                  items.length > 0 ? "text-zinc-500" : "text-zinc-700",
                )}
              />
            )}
            <input
              type="text"
              name="host"
              placeholder="Folder"
              defaultValue={nameInput || ""}
              autoComplete="one-time-code"
              readOnly={!onAuth}
              ref={inputRef}
              onClick={(e) => {
                e.stopPropagation();
                if (!onAuth && items.length > 0) {
                  setOpen((prevState) => !prevState);
                }
              }}
              onChange={(e) => setNameInput(e.target.value)}
              className={`w-full overflow-hidden text-ellipsis whitespace-nowrap rounded py-1 pl-1 pr-2 text-sm font-bold placeholder:text-zinc-500 focus:outline-none ${
                onAuth ? "bg-zinc-800" : "cursor-pointer bg-transparent"
              }`}
            />
          </div>

          <div className="mx-1 flex items-center">
            {onAuth ? (
              <button
                className="text-xl text-zinc-500 hover:text-green-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setAuth(false);
                  updateFolder(id, nameInput);
                }}
              >
                <TbPencilCheck />
              </button>
            ) : (
              <button
                onClick={() => setAuth((prevState) => !prevState)}
                className="hidden group-hover:block"
              >
                <TbPencil className="text-xl text-zinc-500 hover:text-zinc-400" />
              </button>
            )}
            <button
              className={`group-hover:block ${onAuth ? "block" : "hidden"}`}
              onClick={() => deleteItem(id)}
            >
              <TiTimes className="text-xl text-zinc-500 hover:text-red-600" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="px-2 pb-1">
            {items?.map((item, index) =>
              item.type === "FOLDER" ? (
                <DeviceListFolder
                  key={`${item.id}`}
                  id={item.id}
                  index={index}
                  name={item.name}
                  type={item.type}
                  parentId={item.parentId}
                  items={item.items!}
                  moveItem={moveItem}
                  addItemToFolder={addItemToFolder}
                  isParentChildRelationship={isParentChildRelationship}
                  deleteItem={deleteItem}
                  updateDevice={updateDevice}
                  updateFolder={updateFolder}
                  connectDevice={connectDevice}
                  addDevice={addDevice}
                  removeDevice={removeDevice}
                  addStreamingDevice={addStreamingDevice}
                  removeStreamingDevice={removeStreamingDevice}
                  streamingDevices={streamingDevices}
                  connectedDevices={connectedDevices}
                  fetchStreamPort={fetchStreamPort}
                  resetStreamPort={resetStreamPort}
                />
              ) : item.type === "ITEM" ? (
                <DeviceListItem
                  key={`${item.id}`}
                  id={item.id}
                  index={index}
                  name={item.name}
                  type={item.type}
                  parentId={item.parentId}
                  moveItem={moveItem}
                  addItemToFolder={addItemToFolder}
                  isParentChildRelationship={isParentChildRelationship}
                  deleteItem={deleteItem}
                  updateDevice={updateDevice}
                  addStreamingDevice={addStreamingDevice}
                  removeStreamingDevice={removeStreamingDevice}
                  addDevice={addDevice}
                  removeDevice={removeDevice}
                  connectDevice={connectDevice}
                  fetchStreamPort={fetchStreamPort}
                  resetStreamPort={resetStreamPort}
                  isConnected={connectedDevices.some(
                    (device: { host: string }) => device.host === item.name,
                  )}
                  isAdded={streamingDevices.some(
                    (device) => device.host === item.name,
                  )}
                  capabilities={
                    connectedDevices.find(
                      (device: { host: string }) => device.host === item.name,
                    )?.capabilities
                  }
                  information={
                    connectedDevices.find(
                      (device: { host: string }) => device.host === item.name,
                    )?.deviceInformation
                  }
                  isStreaming={
                    streamingDevices.find((device) => device.host === item.name)
                      ?.stream ?? false
                  }
                />
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceListFolder;
