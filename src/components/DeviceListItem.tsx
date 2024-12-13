"use client";

import React from "react";
import { ItemType } from "@/types/react-dnd";
import { useDrag, useDrop } from "react-dnd";
import { TbPlayerPlayFilled } from "react-icons/tb";
import { TiTick, TiTimes } from "react-icons/ti";

export const DeviceListItem = ({
  id,
  index,
  type,
  name,
  parentId,
  moveItem,
  isParentChildRelationship,
  deleteItem,
  updateDevice,
  addStreamingDevice,
  removeStreamingDevice,
  isSelected,
  isStreaming,
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
  isSelected: boolean;
  isStreaming: boolean;
}) => {
  const [onAuth, setAuth] = React.useState<boolean>(false);
  const [hostInput, setHostInput] = React.useState<string>(name);
  const usernameRef = React.useRef<HTMLInputElement | null>(null);
  const passwordRef = React.useRef<HTMLInputElement | null>(null);

  const connectDevice = async () => {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    const { hostname, port } = new URL(`http://${hostInput}`);
    const response = await fetch(`/api/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hostname, port, username, password }),
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();

      setAuth(false);
    } else {
    }
  };

  const removeInstance = async (key: string) => {
    try {
      const response = await fetch("/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.key);
        removeStreamingDevice(data.key);
      } else {
      }
    } catch (error) {}
  };

  const checkInstance = async (key: string) => {
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (response.ok) {
        addStreamingDevice(data.key);
      } else {
        setAuth(true);
      }
    } catch (error) {}
  };

  const ref = React.useRef<HTMLLIElement | null>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "ITEM",
    item: { id: id, type: "ITEM", parentId: parentId, index: index },
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
            0
          );
          moveItem(draggedItem.id, targetIndex, parentId);
        } else if (mouseY > hoverLowerY) {
          targetIndex = Math.max(
            draggedItem.index! < index ? index : index + 1,
            0
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

  React.useEffect(() => {
    if (onAuth) {
      drag(null);
      drop(null);
    } else {
      drag(drop(ref));
    }
  }, [onAuth]);

  return (
    <li
      ref={ref}
      onClick={() => {
        if (!onAuth && hostInput !== "") {
          if (!isSelected) {
            checkInstance(hostInput);
          }
        } else {
          setAuth(true);
        }
      }}
      className={`group/item flex items-center  py-0.5 rounded   ${
        isDragging && "opacity-30"
      } ${onAuth && "bg-zinc-800"}`}
    >
      <div
        className={`flex-1 flex items-center hover:bg-zinc-800  rounded py-0.5 ${
          isSelected && "border border-violet-500"
        }`}
      >
        {isStreaming && (
          <TbPlayerPlayFilled className="ml-1 text-lg text-violet-500" />
        )}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="text"
            name="host"
            placeholder="Host"
            defaultValue={hostInput || ""}
            autoComplete="one-time-code"
            readOnly={!onAuth}
            onChange={(e) => setHostInput(e.target.value)}
            className={`w-full rounded px-2 py-1 text-sm focus:outline-none text-ellipsis whitespace-nowrap overflow-hidden placeholder:text-zinc-500 ${
              onAuth ? " bg-zinc-700 " : "cursor-pointer bg-transparent"
            }`}
          />

          {onAuth && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                defaultValue=""
                autoComplete="one-time-code"
                onClick={(e) => e.stopPropagation()}
                ref={usernameRef}
                className={`w-full rounded px-2 py-1 text-sm focus:outline-none placeholder:text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis   ${
                  onAuth ? "bg-zinc-700" : "bg-transparent"
                }`}
              />
              <input
                type="password"
                name="onvif-password"
                placeholder="Password"
                defaultValue=""
                autoComplete="one-time-code"
                onClick={(e) => e.stopPropagation()}
                ref={passwordRef}
                className={`w-full rounded px-2 py-1 text-sm focus:outline-none  placeholder:text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis  ${
                  onAuth ? "bg-zinc-700" : "bg-transparent"
                }`}
              />
            </>
          )}
        </div>

        {onAuth ? (
          <button
            className="text-lg ml-2 text-zinc-500 hover:text-green-500 mx-1"
            onClick={(e) => {
              e.stopPropagation();

              setAuth(false);
              if (hostInput !== "") {
                connectDevice();
                updateDevice(id, hostInput);
              }
            }}
          >
            <TiTick />
          </button>
        ) : (
          <div className="hidden group-hover/item:flex mx-1">
            {/*  <button
              className="text-lg text-zinc-500 hover:text-zinc-400"
              onClick={(e) => {
               
                e.stopPropagation();
                setAuth((prevState) => !prevState);
                setError(false);
              }}
            >
              <TiCog />
            </button> */}

            {deleteItem && (
              <button
                className="text-lg text-zinc-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(id);
                  removeInstance(name);
                }}
              >
                <TiTimes />
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
};
