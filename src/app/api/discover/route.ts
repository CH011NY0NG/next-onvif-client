import { NextResponse } from "next/server";
import onvif from "onvif";

export async function GET() {
  return new Promise((resolve, reject) => {
    const devices: string[] = [];

    onvif.Discovery.on("device", (cam) => {
      devices.push(cam.xaddrs[0].host);
    });

    onvif.Discovery.on("error", (error) => {
      reject(new NextResponse("Error during discovery", { status: 500 }));
    });

    onvif.Discovery.probe((err) => {
      if (err) {
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
