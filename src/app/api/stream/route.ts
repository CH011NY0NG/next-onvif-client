import { NextRequest, NextResponse } from "next/server";
import http from "http";
import { Server as SocketIO } from "socket.io";
import rtsp from "rtsp-ffmpeg";
import { getCamInstance } from "@/lib/onvif";

interface StreamInfo {
  port: number;
  stream: InstanceType<typeof rtsp.FFMpeg>;
  server: http.Server;
  io: SocketIO;
}

const streams: { [key: string]: StreamInfo } = {};

export async function POST(request: NextRequest) {
  try {
    const { host } = await request.json();

    if (!host) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const cam = getCamInstance(host);
    if (!cam) {
      return NextResponse.json(
        { error: "Camera instance not found for the provided key" },
        { status: 404 }
      );
    }

    const rtspUrl = await new Promise<string>((resolve, reject) => {
      cam.getProfiles((error, profiles) => {
        if (error) {
          reject(new Error("Failed to retrieve profiles"));
          return;
        }
        if (!profiles.length) {
          reject(new Error("No profiles available on camera"));
          return;
        }

        const profileToken = profiles[0].$.token;

        cam.getStreamUri(
          { protocol: "RTSP", profileToken },
          (error, stream) => {
            if (error) {
              reject(new Error("Failed to retrieve RTSP URL"));
            } else {
              const authenticatedRtspUrl = stream.uri.replace(
                "rtsp://",
                `rtsp://${cam.username}:${cam.password}@`
              );
              resolve(authenticatedRtspUrl);
            }
          }
        );
      });
    });

    const decodedRtspUrl = decodeURIComponent(rtspUrl);
    if (streams[decodedRtspUrl]) {
      return NextResponse.json({ port: streams[decodedRtspUrl].port });
    }

    const server = http.createServer();
    server.listen(0, () => {
      const portNumber = (server.address() as any).port;

      const io = new SocketIO(server, {
        cors: {
          origin: `*`,
          methods: ["GET", "POST"],
        },
      });

      const stream = new rtsp.FFMpeg({
        input: decodedRtspUrl,
        resolution: "640x480",
        arguments: ["-rtsp_transport", "tcp"],
      });

      io.on("connection", (socket) => {
        console.log(
          `Client connected ${decodedRtspUrl} on port, ${portNumber}, now connected ${io.engine.clientsCount}`
        );

        const pipeStream = (data: any) => {
          socket.emit("data", data.toString("base64"));
        };

        stream.on("data", pipeStream);

        socket.on("disconnect", () => {
          stream.removeListener("data", pipeStream);
          console.log(
            `Client disconnected ${decodedRtspUrl}, now connected ${io.engine.clientsCount}`
          );

          setTimeout(() => {
            if (io.sockets.sockets.size === 0) {
              console.log(
                `No clients connected ${decodedRtspUrl}, stopping FFmpeg stream`
              );

              stream.stop();
              io.close();
              server.close();
              delete streams[decodedRtspUrl];
            }
          }, 100);
        });
      });

      streams[decodedRtspUrl] = {
        port: portNumber,
        stream,
        server,
        io,
      };
    });

    return NextResponse.json({
      port: (server.address() as any).port,
      host,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
