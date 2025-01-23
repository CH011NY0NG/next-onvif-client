"use client";

import React from "react";
import DeviceListFolder from "./DeviceListFolder";
import { TbFolderPlus, TbPlus } from "react-icons/tb";
import { ItemType } from "@/types/react-dnd";
import { nanoid } from "nanoid";
import DeviceListItem from "./DeviceListItem";

export const DeviceList = ({
  addStreamingDevice,
  removeStreamingDevice,
  streamingDevices,
  fetchStreamPort,
  resetStreamPort,
}: {
  addStreamingDevice: (host: string) => void;
  removeStreamingDevice: (key: string) => void;
  streamingDevices: { host: string; stream: boolean }[];
  fetchStreamPort: (host: string) => void;
  resetStreamPort: (host: string) => void;
}) => {
  const [items, setItems] = React.useState<ItemType[]>([]);
  const [connectedDevices, setConnectedDevices] = React.useState<any>([]);
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const connectDevice = async (
    host: string,
    username: string,
    password: string,
  ) => {
    const { hostname, port } = new URL(`http://${host}`);
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

      setConnectedDevices((prevDevices: any[]) => [
        ...prevDevices.filter((device) => device.host !== data.id),
        data,
      ]);
    } else {
      console.error("Failed to connect to the device.");
    }
  };
  const removeDevice = async (key: string) => {
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
        removeStreamingDevice(data.key);
        setConnectedDevices((prevDevices: any[]) =>
          prevDevices.filter((device) => device.host !== data.key),
        );
      } else {
      }
    } catch (error) {}
  };

  const addDevice = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      addStreamingDevice(data.key);
      return true;
    } catch (error) {
      console.error("Error in checkInstance:", error);
      return false;
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(false);
      try {
        const response = await fetch("/api/discover");
        const data = await response.json();

        const folderId = nanoid(10);

        const discoveredFolder: ItemType = {
          id: folderId,
          name: "Discovered",
          type: "FOLDER",
          parentId: null,
          items: [],
        };

        const newItems = data.devices.map((device: string) => ({
          id: nanoid(10),
          name: device,
          type: "ITEM",
          parentId: folderId,
        }));

        discoveredFolder.items = newItems;

        setItems((prevItems) => [...prevItems, discoveredFolder]);
        setLoading(true);
      } catch (error) {
        setLoading(true);
      }
    };

    fetchData();
  }, []);

  const addListItem = () => {
    const uid = nanoid(10);
    const newItem: ItemType = {
      id: uid,
      name: "",
      type: "ITEM",
      parentId: null,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const addListFolder = () => {
    const uid = nanoid(10);
    const newFolder: ItemType = {
      id: uid,
      name: "",
      type: "FOLDER",
      parentId: null,
      items: [],
    };
    setItems((prevItems) => [...prevItems, newFolder]);
  };

  const moveItem = (
    draggedItemId: string,
    targetIndex: number,
    targetParentId: string | null,
  ) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];

      const findArrayByParentId = (
        array: ItemType[],
        parentId: string | null,
      ): ItemType[] | null => {
        if (parentId === null) return array;
        for (const item of array) {
          if (item.id === parentId && item.type === "FOLDER") {
            return item.items || [];
          }
          if (item.type === "FOLDER" && item.items) {
            const foundArray = findArrayByParentId(item.items, parentId);
            if (foundArray) return foundArray;
          }
        }
        return null;
      };

      const removeItemById = (
        array: ItemType[],
        itemId: string,
      ): ItemType | null => {
        const index = array.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          return array.splice(index, 1)[0];
        }
        for (const item of array) {
          if (item.type === "FOLDER" && item.items) {
            const removedItem = removeItemById(item.items, itemId);
            if (removedItem) return removedItem;
          }
        }
        return null;
      };

      const draggedItem = removeItemById(updatedItems, draggedItemId);
      if (!draggedItem) {
        return updatedItems;
      }

      const targetArray = findArrayByParentId(updatedItems, targetParentId);
      if (!targetArray) {
        return updatedItems;
      }

      draggedItem.parentId = targetParentId;

      targetIndex = Math.min(targetIndex, targetArray.length);
      targetIndex = Math.max(targetIndex, 0);

      targetArray.splice(targetIndex, 0, draggedItem);

      return updatedItems;
    });
  };

  const addItemToFolder = (draggedItemId: string, folderId: string | null) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];

      const removeItemById = (
        array: ItemType[],
        itemId: string,
      ): ItemType | null => {
        const index = array.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          return array.splice(index, 1)[0];
        }
        for (const item of array) {
          if (item.type === "FOLDER" && item.items) {
            const removedItem = removeItemById(item.items, itemId);
            if (removedItem) return removedItem;
          }
        }
        return null;
      };

      const findFolderById = (
        array: ItemType[],
        folderId: string | null,
      ): any | null => {
        for (const item of array) {
          if (item.id === folderId && item.type === "FOLDER") {
            return item;
          }
          if (item.type === "FOLDER" && item.items) {
            const foundFolder = findFolderById(item.items, folderId);
            if (foundFolder) return foundFolder;
          }
        }
        return null;
      };

      const draggedItem = removeItemById(updatedItems, draggedItemId);
      if (!draggedItem) {
        return updatedItems;
      }

      draggedItem.parentId = folderId;

      if (folderId !== null) {
        const targetFolder = findFolderById(updatedItems, folderId);
        if (targetFolder && targetFolder.items) {
          targetFolder.items.push(draggedItem);
        } else {
        }
      }

      return updatedItems;
    });
  };

  const isParentChildRelationship = (
    parentId: string,
    childId: string,
  ): boolean => {
    const findItemById = (array: ItemType[], id: string): ItemType | null => {
      for (const item of array) {
        if (item.id === id) return item;
        if (item.type === "FOLDER" && item.items) {
          const foundItem = findItemById(item.items, id);
          if (foundItem) return foundItem;
        }
      }
      return null;
    };

    const draggedItem = findItemById(items, childId);
    if (!draggedItem) return false;

    let currentParentId = draggedItem.parentId;

    while (currentParentId !== null) {
      if (currentParentId === parentId) {
        return true;
      }
      const parentItem = findItemById(items, currentParentId);
      currentParentId = parentItem?.parentId || null;
    }

    return false;
  };

  const deleteItem = (itemId: string) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];

      const removeItemById = (array: ItemType[], itemId: string): boolean => {
        const index = array.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          array.splice(index, 1);
          return true;
        }

        for (const item of array) {
          if (item.type === "FOLDER" && item.items) {
            const found = removeItemById(item.items, itemId);
            if (found) return true;
          }
        }

        return false;
      };

      removeItemById(updatedItems, itemId);

      return updatedItems;
    });
  };

  const updateDevice = (id: string, host: string) => {
    setItems((prevItems) => {
      const updateDeviceRecursively = (array: ItemType[]): ItemType[] => {
        return array.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              name: host,
            };
          }
          if (item.type === "FOLDER" && item.items) {
            return {
              ...item,
              items: updateDeviceRecursively(item.items),
            };
          }
          return item;
        });
      };

      return updateDeviceRecursively(prevItems);
    });
  };
  const updateFolder = (id: string, name: string) => {
    setItems((prevItems) => {
      const updateNameRecursively = (array: ItemType[]): ItemType[] => {
        return array.map((item) => {
          if (item.id === id && item.type === "FOLDER") {
            return {
              ...item,
              name,
            };
          }
          if (item.type === "FOLDER" && item.items) {
            return {
              ...item,
              items: updateNameRecursively(item.items),
            };
          }
          return item;
        });
      };

      return updateNameRecursively(prevItems);
    });
  };

  const Loading = () => (
    <div className="mt-2 flex justify-center space-x-2">
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
        className="bounce-animation h-3 w-3 rounded-full bg-zinc-800"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="bounce-animation h-3 w-3 rounded-full bg-zinc-800"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="bounce-animation h-3 w-3 rounded-full bg-zinc-800"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );

  return (
    <aside className="flex w-[280px] flex-col space-y-3 overflow-y-auto bg-zinc-900 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-2xl font-bold">Device</p>
        </div>

        <div>
          <button
            disabled={!isLoading}
            onClick={addListItem}
            className={`text-2xl ${
              isLoading
                ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400"
                : "text-zinc-700"
            } rounded-2xl p-1`}
          >
            <TbPlus />
          </button>
          <button
            disabled={!isLoading}
            onClick={addListFolder}
            className={`text-2xl ${
              isLoading
                ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400"
                : "text-zinc-700"
            } rounded-2xl p-1`}
          >
            <TbFolderPlus />
          </button>
        </div>
      </div>
      {!isLoading && <Loading />}

      <div className="flex flex-1 flex-col">
        {items.map((item, index) =>
          item.type === "FOLDER" ? (
            <DeviceListFolder
              key={`${item.id}`}
              id={item.id}
              index={index}
              name={item.name!}
              type={item.type}
              parentId={item.parentId}
              items={item.items!}
              moveItem={moveItem}
              addItemToFolder={addItemToFolder}
              isParentChildRelationship={isParentChildRelationship}
              deleteItem={deleteItem}
              updateDevice={updateDevice}
              updateFolder={updateFolder}
              removeDevice={removeDevice}
              addDevice={addDevice}
              connectDevice={connectDevice}
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
              isStreaming={
                streamingDevices.find((device) => device.host === item.name)
                  ?.stream ?? false
              }
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
            />
          ) : null,
        )}
      </div>
    </aside>
  );
};
