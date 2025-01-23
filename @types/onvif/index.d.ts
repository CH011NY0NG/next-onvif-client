declare module "onvif" {
  export class Cam {
    hostname: string;
    username?: string;
    password?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    host: string;
    port?: number;
    xaddrs: (Url & { host: string })[];

    deviceInformation?: {
      manufacturer: string;
      model: string;
      serialNumber: string;
      firmwareVersion?: string;
      hardwareId?: string;
    };

    capabilities?: {
      Analytics?: { XAddr: string };
      Device?: { XAddr: string };
      Events?: { XAddr: string };
      Imaging?: { XAddr: string };
      Media?: { XAddr: string };
      PTZ?: { XAddr: string };
      [key: string]: any;
    };

    constructor(
      options: {
        hostname: string;
        port: number;
        username: string;
        password: string;
      },
      callback?: (err: Error | null) => void,
    );

    connect(callback?: (error?: Error) => void): void;

    getStreamUri(
      options: { protocol: string; profileToken?: string },
      callback: (error: Error | null, uri: { uri: string }) => void,
    ): void;

    getDeviceInformation(
      callback: (
        error: Error | null,
        info: {
          model: string;
          manufacturer: string;
          serialNumber: string;
          firmwareVersion?: string;
          hardwareId?: string;
        },
      ) => void,
    ): void;

    getProfiles(
      callback: (
        error: Error | null,
        profiles: {
          $: { token: string };
          name?: string;
          video?: {
            resolution: {
              width: number;
              height: number;
            };
            framerate: number;
          };
          audio?: {
            enabled: boolean;
          };
        }[],
      ) => void,
    ): void;

    getCapabilities(
      callback: (
        error: Error | null,
        capabilities: {
          Analytics?: { XAddr: string };
          Device?: { XAddr: string };
          Events?: { XAddr: string };
          Imaging?: { XAddr: string };
          Media?: { XAddr: string };
          PTZ?: { XAddr: string };
          [key: string]: any;
        },
      ) => void,
    ): void;

    continuousMove(
      options: { x?: number; y?: number; zoom?: number },
      callback?: (error: Error | null) => void,
    ): void;

    stop(
      options: { panTilt?: boolean; zoom?: boolean },
      callback?: (error: Error | null) => void,
    ): void;

    fetchSnapshot(callback: (error: Error | null, data: Buffer) => void): void;

    getSnapshotUri(
      options: { profileToken: string },
      callback: (error: Error | null, uri: { uri: string }) => void,
    ): void; // 추가된 getSnapshotUri 메서드
  }

  export namespace Discovery {
    function probe(callback?: (error: Error | null, cams: Cam[]) => void): void;
    function on(event: "device", listener: (cam: Cam) => void): void;
    function on(event: "error", listener: (error: Error) => void): void;
  }
}
