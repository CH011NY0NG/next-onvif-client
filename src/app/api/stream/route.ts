import { NextRequest, NextResponse } from "next/server";
import http from "http";
import { Server as SocketIO } from "socket.io";
import rtsp from "rtsp-ffmpeg";
import onvif from "onvif";

interface StreamInfo {
  port: number;
  stream: InstanceType<typeof rtsp.FFMpeg>;
  server: http.Server;
  io: SocketIO;
}

const streams: { [key: string]: StreamInfo } = {};

export async function POST(request: NextRequest) {
  try {
    const { hostname, port, username, password } = await request.json();
    if (!hostname && !port) {
      return NextResponse.json(
        { error: "Device IP is required" },
        { status: 400 }
      );
    }

    const cam = new onvif.Cam({
      hostname: hostname,
      port: port,
      username: username,
      password: password,
    });

    console.log("Connecting to camera...");

    const rtspUrl = await new Promise<string>((resolve, reject) => {
      cam.connect((err) => {
        if (err) {
          console.error("Connection error:", err.message);
          reject(new Error("Failed to connect to camera"));
          return;
        }

        console.log("Connected to camera, retrieving profiles...");
        cam.getProfiles((error, profiles) => {
          if (error) {
            console.error("Profile retrieval error:", error.message);
            reject(new Error("Failed to retrieve profiles"));
            return;
          }
          if (!profiles.length) {
            reject(new Error("No profiles available on camera"));
            return;
          }

          const profileToken = profiles[0].$.token;
          console.log("Profile token retrieved:", profileToken);

          cam.getStreamUri(
            { protocol: "RTSP", profileToken },
            (error, stream) => {
              if (error) {
                console.error("Stream URI retrieval error:", error.message);
                reject(new Error("Failed to retrieve RTSP URL"));
              } else {
                console.log("RTSP URL retrieved:", stream.uri);
                const authenticatedRtspUrl = stream.uri.replace(
                  "rtsp://",
                  `rtsp://${username}:${password}@`
                );
                resolve(authenticatedRtspUrl);
              }
            }
          );
        });
      });
    });

    const decodedRtspUrl = decodeURIComponent(rtspUrl);
    if (streams[decodedRtspUrl]) {
      console.log(
        `RTSP stream already running on port ${streams[decodedRtspUrl].port}`
      );
      return NextResponse.json({ port: streams[decodedRtspUrl].port });
    }

    const server = http.createServer();
    server.listen(0, () => {
      const portNumber = (server.address() as any).port;
      console.log(
        `New RTSP stream ${decodedRtspUrl} started on port ${portNumber}`
      );

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
      host: `${hostname}:${port}`,
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
