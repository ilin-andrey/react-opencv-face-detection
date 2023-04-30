import { useCallback, useEffect, useState } from "react";

import { CameraFacing } from "../core/camera/consts";
import { ActiveCamera, ActiveCameraActions } from "../core/camera/types";
import {
  bindCameraStreamToVideoFeed,
  setupCamera,
  takeScreenshot,
} from "../core/camera/utils";

export function useCamera({
  videoRef,
  facing,
  deviceId,
  videoConstraints,
  onError,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  facing: CameraFacing;
  deviceId?: string | null;
  videoConstraints?: MediaStreamConstraints["video"];
  onError?: () => void;
}): { camera: ActiveCamera | null } & ActiveCameraActions {
  const [camera, setCamera] = useState<ActiveCamera | null>(null);

  const getScreenshot = useCallback(() => {
    if (!videoRef.current || !videoRef.current.videoWidth) return null;
    return takeScreenshot(videoRef.current);
  }, [videoRef]);

  const pauseMediaStream = useCallback(() => {
    camera &&
      camera.stream.getTracks().forEach((track) => (track.enabled = false));
  }, [camera]);

  const resumeMediaStream = useCallback(() => {
    camera &&
      camera.stream.getTracks().forEach((track) => (track.enabled = true));
  }, [camera]);

  const stopMediaStream = useCallback(() => {
    camera && camera.stream.getTracks().forEach((track) => track.stop());
  }, [camera]);

  const rebind = useCallback(async () => {
    if (!videoRef.current || !camera) return;

    await bindCameraStreamToVideoFeed(camera.stream, videoRef.current, facing);
  }, [camera, facing, videoRef]);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    const isInit = !camera;
    const isSwitchingDevice =
      camera && deviceId && camera.device?.deviceId !== deviceId;

    if (isInit || isSwitchingDevice) {
      // stop media stream on change of active device
      if (isSwitchingDevice) stopMediaStream();

      setupCamera({ video: videoElement, deviceId, facing, videoConstraints })
        .then((c) => (c ? setCamera(c) : onError?.()))
        .catch(() => onError?.());
    }
  }, [
    videoRef,
    onError,
    deviceId,
    facing,
    camera,
    videoConstraints,
    stopMediaStream,
  ]);

  // NOTE: we want to close stream only once
  //       meaning when this custom hook is unmounted,
  //       but not when references change in the effect above
  useEffect(() => {
    return () => stopMediaStream();
  }, [stopMediaStream]);

  return {
    camera,
    getScreenshot,
    pauseMediaStream,
    resumeMediaStream,
    rebind,
  };
}
