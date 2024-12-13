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

    constructor(
      options: {
        hostname: string;
        port: number;
        username: string;
        password: string;
      },
      callback?: (err: Error | null) => void // 에러 콜백 타입 명확히 지정
    );

    connect(callback?: (error?: Error) => void): void;

    getStreamUri(
      options: { protocol: string; profileToken?: string },
      callback: (error: Error | null, uri: { uri: string }) => void
    ): void;

    getDeviceInformation(
      callback: (
        error: Error | null,
        info: { model: string; manufacturer: string; serialNumber: string }
      ) => void
    ): void;

    getProfiles(
      callback: (
        error: Error | null,
        profiles: { $: { token: string } }[]
      ) => void
    ): void;
    continuousMove(
      options: { x?: number; y?: number; zoom?: number },
      callback?: (error: Error | null) => void
    ): void;

    stop(
      options: { panTilt?: boolean; zoom?: boolean },
      callback?: (error: Error | null) => void
    ): void;
  }

  export namespace Discovery {
    function probe(callback?: (error: Error | null, cams: Cam[]) => void): void;
    function on(event: "device", listener: (cam: Cam) => void): void;
    function on(event: "error", listener: (error: Error) => void): void;
  }
}
