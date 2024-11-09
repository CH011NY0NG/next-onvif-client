"use client";

import React from "react";
import io from "socket.io-client";

export const StreamViewer = ({ port }: { port: number }) => {
  const [image, setImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (port) {
      const socket = io(
        `${window.location.protocol}//${window.location.hostname}:${port}`,
        {
          transports: ["websocket"],
        }
      );

      socket.on("connect", () => {
        /* console.log("WebSocket 연결 성공"); */
      });

      socket.on("data", (data: string) => {
        setImage(`data:image/jpeg;base64,${data}`);
      });

      socket.on("disconnect", () => {
        /* console.log("WebSocket 연결 끊김"); */
      });

      return () => {
        socket.disconnect();
        setImage(null);
      };
    }
  }, [port]);

  return (
    <div className="aspect-[4/3] w-full bg-zinc-700">
      {image && <img src={image} alt="RTSP Stream" className="w-full h-full" />}
    </div>
  );
};
