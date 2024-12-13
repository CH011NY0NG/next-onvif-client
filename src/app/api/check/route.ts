import { NextRequest, NextResponse } from "next/server";
import { getCamInstance } from "@/lib/onvif";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "The key to check was not provided." },
        { status: 400 }
      );
    }

    const instance = getCamInstance(key);

    if (instance) {
      return NextResponse.json(
        { key, message: `Cam instance exists: ${key}` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Cam instance not found." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error occurred while checking Cam instance:", error);
    return NextResponse.json(
      { error: "An error occurred while checking the Cam instance." },
      { status: 500 }
    );
  }
}
