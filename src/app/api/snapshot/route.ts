import { NextRequest, NextResponse } from "next/server";
import { getCamSnapshot } from "@/lib/onvif";

export async function POST(request: NextRequest) {
  try {
    const { host } = await request.json();

    if (!host) {
      return NextResponse.json(
        { error: "Key is required in the request body." },
        { status: 400 },
      );
    }

    const snapshot = getCamSnapshot(host);

    if (snapshot) {
      return NextResponse.json({ snapshot });
    } else {
      return NextResponse.json(
        { error: `No snapshot found for the key: ${host}` },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while processing the request." },
      { status: 500 },
    );
  }
}
