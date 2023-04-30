export enum CaptureStatus {
  Idle = "idle",
  Pending = "pending",
  Ready = "ready",
  Done = "done",
  Confirmation = "confirmation",
  FaceNotFound = "face_not_found",
}

export const AUTO_CAPTURE_DELAY = 100;
export const MANUAL_CAPTURE_GLOBAL_TIMEOUT = 20000;
export const MANUAL_CAPTURE_TIMEOUT = 10000;
export const CAPTURE_CONFIRMATION_DELAY = 1500;
export const FACE_DETECTION_INTERVAL = 300;

export const ASSETS_PATH = "/assets";
