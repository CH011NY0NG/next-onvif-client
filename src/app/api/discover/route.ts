import { NextResponse } from "next/server";
import onvif from "onvif";

export async function GET() {
  return new Promise((resolve) => {
    const devices: string[] = [];

    onvif.Discovery.on("device", (cam) => {
      devices.push(cam.xaddrs[0].host);
    });

    onvif.Discovery.on("error", (error) => {
      console.error("Discovery error:", error);
      resolve(new NextResponse("Error during discovery", { status: 500 }));
    });

    onvif.Discovery.probe((err) => {
      if (err) {
        console.error("Probe error:", err);
        resolve(new NextResponse("Error during probe", { status: 500 }));
      } else {
        if (devices.length === 0) {
          resolve(new NextResponse("No devices found", { status: 404 }));
        } else {
          resolve(NextResponse.json({ devices }));
        }
      }
    });
  });
}
