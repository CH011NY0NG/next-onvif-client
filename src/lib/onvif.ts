import onvif from "onvif";

const globalCamStore = global as typeof global & {
  camStore?: { [key: string]: onvif.Cam };
  timeoutStore?: { [key: string]: NodeJS.Timeout };
};

if (!globalCamStore.camStore) {
  globalCamStore.camStore = {};
}

if (!globalCamStore.timeoutStore) {
  globalCamStore.timeoutStore = {};
}

export const camStore = globalCamStore.camStore;
export const timeoutStore = globalCamStore.timeoutStore;

export function setCamInstance(
  key: string,
  cam: onvif.Cam,
  ttl: number = 6000000
): void {
  if (timeoutStore[key]) {
    clearTimeout(timeoutStore[key]);
  }

  camStore[key] = cam;

  timeoutStore[key] = setTimeout(() => {
    setRemoveInstance(key);
  }, ttl);
}

export function getCamInstance(key: string): onvif.Cam | undefined {
  const cam = camStore[key];
  return cam;
}

export function setRemoveInstance(key: string): void {
  if (camStore[key]) {
    delete camStore[key];
  }

  if (timeoutStore[key]) {
    clearTimeout(timeoutStore[key]);
    delete timeoutStore[key];
  }
}
