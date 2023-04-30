import { CameraFacing } from "./consts";
import { CameraDevice } from "./types";

export class Camera implements CameraDevice {
  readonly deviceId: string;
  readonly groupId: string;
  readonly facing: CameraFacing;
  readonly label: string;

  constructor(mdi: MediaDeviceInfo, facing: CameraFacing) {
    this.deviceId = mdi.deviceId;
    this.facing = facing;
    this.groupId = mdi.groupId;
    this.label = mdi.label;
  }
}
