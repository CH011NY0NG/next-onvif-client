declare module "rtsp-ffmpeg" {
  export default class FFMpeg {
    static FFMpeg: any;
    constructor(options: FFMpegOptions);
    on(event: string, callback: (data: Buffer) => void): void;
    removeListener(event: string, callback: (data: Buffer) => void): void;
  }

  interface FFMpegOptions {
    input: string;
    resolution?: string;
    quality?: number;
    arguments?: string[];
  }
}
