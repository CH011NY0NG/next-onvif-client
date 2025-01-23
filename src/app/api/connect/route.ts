import { NextRequest, NextResponse } from "next/server";
import { setCamInstance } from "@/lib/onvif";
import onvif from "onvif";

export async function POST(req: NextRequest) {
  const { hostname, port, username, password } = await req.json();

  if (!hostname || !port) {
    return NextResponse.json(
      { error: "Hostname and port are required." },
      { status: 400 },
    );
  }

  const key = `${hostname}:${port}`;

  return new Promise((resolve) => {
    const cam = new onvif.Cam({ hostname, port, username, password }, (err) => {
      if (err) {
        console.error("Failed to initialize camera:", err);
        return resolve(
          NextResponse.json(
            { error: "Failed to connect to the camera." },
            { status: 500 },
          ),
        );
      }

      cam.getDeviceInformation((deviceErr, deviceInfo) => {
        if (deviceErr) {
          console.error("Failed to get device information:", deviceErr);
          return resolve(
            NextResponse.json(
              { error: "Failed to retrieve device information." },
              { status: 500 },
            ),
          );
        }

        cam.getCapabilities((capErr, capabilities) => {
          if (capErr) {
            console.error("Failed to get capabilities:", capErr);
            return resolve(
              NextResponse.json(
                { error: "Failed to retrieve capabilities." },
                { status: 500 },
              ),
            );
          }

          cam.getProfiles((profileErr, profiles) => {
            if (profileErr) {
              console.error("Error fetching profiles:", profileErr);
              return resolve(
                NextResponse.json(
                  { error: "Failed to retrieve profiles." },
                  { status: 500 },
                ),
              );
            }

            if (!profiles.length) {
              console.error("No profiles available on camera");
              return resolve(
                NextResponse.json(
                  { error: "No profiles available on camera." },
                  { status: 500 },
                ),
              );
            }

            const profileToken = profiles[0].$.token;

            cam.getSnapshotUri(
              { profileToken },
              async (snapshotErr, snapshot) => {
                let snapshotImage = null;

                if (snapshotErr || !snapshot?.uri) {
                  console.error(
                    "Failed to fetch snapshot URI or no valid URI found:",
                    snapshotErr || "No URI",
                  );
                } else {
                  try {
                    const response = await fetch(snapshot.uri, {
                      headers: {
                        Authorization: `Basic ${Buffer.from(
                          `${username}:${password}`,
                        ).toString("base64")}`,
                      },
                    });

                    const arrayBuffer = await response.arrayBuffer();
                    const imageBuffer = Buffer.from(arrayBuffer);
                    snapshotImage = `data:image/jpeg;base64,${imageBuffer.toString(
                      "base64",
                    )}`;
                  } catch (fetchErr) {
                    console.error("Failed to fetch snapshot image:", fetchErr);
                  }
                }

                setCamInstance(key, cam, snapshotImage!);

                const filteredData = {
                  hostname: cam.hostname,
                  port: cam.port,
                  host: `${cam.hostname}:${cam.port}`,
                  deviceInformation: cam.deviceInformation,
                  capabilities: cam.capabilities,
                };

                resolve(NextResponse.json(filteredData));
              },
            );
          });
        });
      });
    });
  });
}
