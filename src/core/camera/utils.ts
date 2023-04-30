import { Camera } from "./class";
import { CameraFacing, DEFAULT_VIDEO_CONSTRAINTS } from "./consts";
import { isBackCameraLabel } from "./helpers";
import { ActiveCamera, CameraDevice, CameraDevices } from "./types";

export async function getCameraDevices(): Promise<CameraDevices> {
  const frontCameras: CameraDevice[] = [];
  const backCameras: CameraDevice[] = [];

  let devices = await navigator.mediaDevices.enumerateDevices();

  // if permission is not given, label of video devices will be empty string
  if (
    devices
      .filter((device) => device.kind === "videoinput")
      .every((device) => device.label === "")
  ) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true, // No need for constraints we just need all videoinput devices
      audio: false,
    });

    // enumerate devices again - now the label field should be non-empty, as we have a stream active
    // (even if we didn't get persistent permission for camera)
    devices = await navigator.mediaDevices.enumerateDevices();

    // close the stream, as we don't need it anymore
    stream.getTracks().forEach((track) => track.stop());
  }

  const cameras = devices.filter((device) => device.kind === "videoinput");
  for (const camera of cameras) {
    if (isBackCameraLabel(camera.label)) {
      // De-dupe camera devices that have 2-in-1, duplicate deviceIds which does nothing
      // To switch camera devices deviceId must be provided within getUserMedia constraints
      // This means we don't care about duplicate devices that some browsers and/or os'es sometimes provide
      if (backCameras.every((c) => c.deviceId !== camera.deviceId)) {
        backCameras.push(new Camera(camera, CameraFacing.BackCamera));
      }
    } else {
      // De-dupe camera devices that have 2-in-1, duplicate deviceIds which does nothing
      if (frontCameras.every((c) => c.deviceId !== camera.deviceId)) {
        frontCameras.push(new Camera(camera, CameraFacing.FrontCamera));
      }
    }
  }

  return {
    frontCameras,
    backCameras,
  };
}

export async function selectCamera(
  preferredCameraType: CameraFacing,
  cameraId?: string | null
): Promise<Camera | null> {
  const { frontCameras, backCameras } = await getCameraDevices();

  if (frontCameras.length > 0 || backCameras.length > 0) {
    // decide from which array the camera will be selected
    let cameraPool: Camera[] =
      frontCameras.length > 0 ? frontCameras : backCameras;
    // if there is at least one back facing camera and user prefers back facing camera, use that as a selection pool
    if (
      preferredCameraType === CameraFacing.BackCamera &&
      backCameras.length > 0
    ) {
      cameraPool = backCameras;
    }
    // if there is at least one front facing camera and is preferred by user, use that as a selection pool
    if (
      preferredCameraType === CameraFacing.FrontCamera &&
      frontCameras.length > 0
    ) {
      cameraPool = frontCameras;
    }
    // otherwise use whichever pool is non-empty

    // sort camera pool by label
    cameraPool = cameraPool.sort((camera1, camera2) =>
      camera1.label.localeCompare(camera2.label)
    );

    // check if cameras are labeled with resolution information, take the higher-resolution one in that case
    // otherwise pick the first camera
    {
      let selectedCameraIndex = 0;

      const cameraResolutions: number[] = cameraPool.map((camera) => {
        const regExp = RegExp(/\b([0-9]+)MP?\b/, "i");
        const match = regExp.exec(camera.label);
        if (match !== null) {
          return parseInt(match[1], 10);
        } else {
          return NaN;
        }
      });
      if (
        !cameraResolutions.some((cameraResolution) => isNaN(cameraResolution))
      ) {
        selectedCameraIndex = cameraResolutions.lastIndexOf(
          Math.max(...cameraResolutions)
        );
      }
      if (cameraId) {
        let cameraDevice = null;

        cameraDevice = frontCameras.filter(
          (device) => device.deviceId === cameraId
        )[0];
        if (!cameraDevice) {
          cameraDevice = backCameras.filter(
            (device) => device.deviceId === cameraId
          )[0];
        }

        return cameraDevice || null;
      }

      return cameraPool[selectedCameraIndex];
    }
  }

  // no cameras available
  return null;
}

export async function getCameraStream(
  camera: Camera,
  videoConstraints?: MediaStreamConstraints["video"]
): Promise<MediaStream | null> {
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: videoConstraints || DEFAULT_VIDEO_CONSTRAINTS,
  };

  if (camera.deviceId === "") {
    const isPreferredBackFacing = camera.facing === CameraFacing.BackCamera;

    if (typeof constraints.video === "object") {
      constraints.video = {
        ...constraints.video,
        facingMode: {
          ideal: isPreferredBackFacing ? "environment" : "user",
        },
      };
    }
  } else {
    if (typeof constraints.video === "object") {
      constraints.video = {
        ...constraints.video,
        deviceId: {
          exact: camera.deviceId,
        },
      };
    }
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * Bind camera stream to video feed (HTMLVideoElement).
 *
 * This function will return `true` in case that video feed of camera device has been flipped,
 * and `false` otherwise.
 *
 * @param stream Camera stream which should be binded with the video element.
 * @param videoFeed HTMLVideoElement to which camera stream should be binded.
 * @param preferredCameraType Enum representing whether to use front facing or back facing camera.
 */
export async function bindCameraStreamToVideoFeed(
  stream: MediaStream,
  videoFeed: HTMLVideoElement,
  preferredCameraType: CameraFacing
): Promise<boolean> {
  videoFeed.controls = false;
  videoFeed.srcObject = stream;

  let cameraFlipped = false;
  if (preferredCameraType === CameraFacing.FrontCamera) {
    videoFeed.style.transform = "scaleX(-1)";
    cameraFlipped = true;
  }

  return cameraFlipped;
}

export async function setupCamera({
  facing,
  video,
  deviceId,
  videoConstraints,
}: {
  video: HTMLVideoElement;
  deviceId?: string | null;
  facing: CameraFacing;
  videoConstraints?: MediaStreamConstraints["video"];
}): Promise<ActiveCamera | null> {
  const device = await selectCamera(facing, deviceId);

  if (!device) return null;

  const stream = await getCameraStream(device, videoConstraints);

  if (!stream) return null;

  await bindCameraStreamToVideoFeed(stream, video, device.facing);

  return { device, stream };
}

export function takeScreenshot(
  videoElement: HTMLVideoElement
): ImageData | null {
  let imageData: ImageData | null = null;

  const screenshotCanvas = document.createElement("canvas");
  const screenshotCtx = screenshotCanvas.getContext("2d");

  if (!screenshotCtx) return null;

  const w = videoElement.videoWidth;
  const h = videoElement.videoHeight;

  screenshotCanvas.width = w;
  screenshotCanvas.height = h;

  try {
    screenshotCtx.drawImage(videoElement, 0, 0, w, h);
    imageData = screenshotCtx.getImageData(0, 0, w, h);
  } catch (e) {
    console.error(e);
  } finally {
    screenshotCanvas.remove();
  }

  return imageData;
}
