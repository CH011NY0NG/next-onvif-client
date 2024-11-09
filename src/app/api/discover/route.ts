// app/api/discovery/route.ts
import { deviceType } from "@/types/device";
import { NextResponse } from "next/server";
import onvif, { Cam } from "onvif";

export async function GET() {
  return new Promise((resolve, reject) => {
    const devices: deviceType[] = [];

    onvif.Discovery.on("device", (cam) => {
      const device = {
        host: cam.xaddrs[0].host,
      };
      devices.push(device);
    });

    onvif.Discovery.on("error", (error) => {
      console.error("Discovery error:", error);
      reject(new NextResponse("Error during discovery", { status: 500 }));
    });

    onvif.Discovery.probe((err) => {
      if (err) {
        console.error("Probe error:", err);
        reject(new NextResponse("Error during discovery", { status: 500 }));
      } else {
        if (devices.length === 0) {
          reject(new NextResponse("No devices found", { status: 404 }));
        } else {
          resolve(NextResponse.json({ devices }));
        }
      }
    });
  });
}
