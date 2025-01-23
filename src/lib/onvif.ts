import onvif from "onvif";

interface CamInstance {
  cam: onvif.Cam;
  snapshot?: string;
}

const globalCamStore = global as typeof global & {
  camStore?: { [key: string]: CamInstance };
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
  snapshot?: string,
  ttl: number = 6000000,
): void {
  if (timeoutStore[key]) {
    clearTimeout(timeoutStore[key]);
  }

  camStore[key] = { cam, snapshot };

  timeoutStore[key] = setTimeout(() => {
    setRemoveInstance(key);
  }, ttl);
}

export function getCamInstance(key: string): onvif.Cam | undefined {
  const camInstance = camStore[key];
  return camInstance?.cam;
}

export function getCamSnapshot(key: string): string | undefined {
  const camInstance = camStore[key];
  return camInstance?.snapshot;
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
