import { Camera } from "./class";
import { CameraFacing } from "./consts";

export interface CameraDevice {
  deviceId: string;
  groupId: string;
  facing: CameraFacing;
  label: string;
}

export interface CameraDevices {
  frontCameras: CameraDevice[];
  backCameras: CameraDevice[];
}

export type ActiveCamera = {
  device: Camera;
  stream: MediaStream;
};

export type ActiveCameraActions = {
  getScreenshot: () => ImageData | null;
  pauseMediaStream: () => void;
  resumeMediaStream: () => void;
  rebind: () => void;
};
