import { NextRequest, NextResponse } from "next/server";
import onvif from "onvif";
import { setCamInstance } from "@/lib/onvif";

export async function POST(req: NextRequest) {
  const { hostname, port, username, password } = await req.json();

  if (!hostname || !port) {
    return NextResponse.json(
      { error: "Hostname and port are required." },
      { status: 400 }
    );
  }

  const key = `${hostname}:${port}`;

  return new Promise((resolve) => {
    const cam = new onvif.Cam(
      {
        hostname,
        port,
        username,
        password,
      },
      (err) => {
        if (err) {
          console.error("Failed to initialize camera:", err);
          return resolve(
            NextResponse.json(
              { error: "Failed to connect to the camera" },
              { status: 500 }
            )
          );
        }

        setCamInstance(key, cam);

        resolve(
          NextResponse.json({
            message: "Successfully connected to the camera",
            key,
          })
        );
      }
    );
  });
}
