import { NextResponse } from "next/server";
import { getCamInstance } from "@/lib/onvif";

interface PTZControlParams {
  action: "pan" | "tilt" | "zoom";
  speed: number;
  duration?: number;
  key: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, speed, duration = 1000, key }: PTZControlParams = body;

    const cam = getCamInstance(key);
    if (!cam) {
      return NextResponse.json(
        { error: "Camera instance not found for the given key." },
        { status: 404 }
      );
    }

    switch (action) {
      case "pan":
        cam.continuousMove({ x: speed, y: 0, zoom: 0 }, (err: any) => {
          if (err) {
            return NextResponse.json(
              { error: "Failed to execute pan command." },
              { status: 500 }
            );
          }
        });
        break;

      case "tilt":
        cam.continuousMove({ x: 0, y: speed, zoom: 0 }, (err: any) => {
          if (err) {
            return NextResponse.json(
              { error: "Failed to execute tilt command." },
              { status: 500 }
            );
          }
        });
        break;

      case "zoom":
        cam.continuousMove({ x: 0, y: 0, zoom: speed }, (err: any) => {
          if (err) {
            return NextResponse.json(
              { error: "Failed to execute zoom command." },
              { status: 500 }
            );
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid PTZ action." },
          { status: 400 }
        );
    }

    setTimeout(() => {
      cam.stop({ panTilt: true, zoom: true }, (err: any) => {
        if (err) {
        }
      });
    }, duration);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to control PTZ." },
      { status: 500 }
    );
  }
}
