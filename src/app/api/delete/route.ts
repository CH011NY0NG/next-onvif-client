import { NextRequest, NextResponse } from "next/server";
import { setRemoveInstance } from "@/lib/onvif";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "The key to be removed was not provided." },
        { status: 400 },
      );
    }

    setRemoveInstance(key);

    return NextResponse.json(
      { message: `Cam instance successfully removed: ${key}`, key },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error occurred while removing Cam instance:", error);
    return NextResponse.json(
      { error: "An error occurred while removing the Cam instance." },
      { status: 500 },
    );
  }
}
