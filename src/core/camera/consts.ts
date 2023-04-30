export enum CameraFacing {
  BackCamera,
  FrontCamera,
}

export const DEFAULT_VIDEO_CONSTRAINTS = {
  width: {
    min: 640,
    ideal: 640,
    max: 1920,
  },
  height: {
    min: 480,
    ideal: 480,
    max: 1080,
  },
};

export const HIGH_RES_VIDEO_CONSTRAINTS = {
  width: {
    min: 640,
    ideal: 1920,
    max: 1920,
  },
  height: {
    min: 480,
    ideal: 1080,
    max: 1080,
  },
};
