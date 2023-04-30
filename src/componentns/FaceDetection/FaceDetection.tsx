import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAssetPath } from "../../core/assets";
import {
  CameraFacing,
  HIGH_RES_VIDEO_CONSTRAINTS,
} from "../../core/camera/consts";
import {
  AUTO_CAPTURE_DELAY,
  CAPTURE_CONFIRMATION_DELAY,
  CaptureStatus,
  FACE_DETECTION_INTERVAL,
  MANUAL_CAPTURE_GLOBAL_TIMEOUT,
  MANUAL_CAPTURE_TIMEOUT,
} from "../../core/consts";
import { fetchAsset } from "../../core/fetcher";
import { logError, logInfo } from "../../core/logger";
import { FaceDetectionStatus } from "../../core/opencv/detector/types";
import { useCamera } from "../../hooks/useCamera";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { OutputCanvas, OutputVideo } from "../Output";

import "./styles.css";

export function FaceDetection() {
  const [selfieCaptured, setSelfieCaptured] = useState<boolean>(false);
  const [showManualCapture, setShowManualCapture] = useState<boolean>(false);
  const [firstFaceDetection, setFirstFaceDetection] = useState<boolean>(false);
  const [status, setStatus] = useState(CaptureStatus.Idle);

  const videoRef = useRef<HTMLVideoElement>(null);
  const debugOverlayRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const loopDestroyerRef = useRef<boolean>(false);

  const { camera, pauseMediaStream, resumeMediaStream, getScreenshot } =
    useCamera({
      videoRef,
      facing: CameraFacing.FrontCamera,
      videoConstraints: HIGH_RES_VIDEO_CONSTRAINTS,
      onError: () => logError({ message: "useCamera error" }),
    });

  const readyToShoot = camera?.stream?.active;

  const { init, initialized, initializing, detectFaces, validateFaces } =
    useFaceDetection({
      logInfo,
      logError,
      getAssetPath,
      fetchAsset,
    });

  const captureSelfie = useCallback(
    (data: ImageData, canvas: HTMLCanvasElement) => {
      if (data && data.width && data.height && canvas) {
        canvas.width = data.width;
        canvas.height = data.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.putImageData(data, 0, 0);
        }

        setSelfieCaptured(true);
      }
    },
    []
  );

  const proceedToConfirmation = useCallback(() => {
    setStatus(CaptureStatus.Confirmation);
    pauseMediaStream();
  }, [pauseMediaStream]);

  const handleManualCapture = useCallback(() => {
    loopDestroyerRef.current = true;

    const data = getScreenshot();

    if (!data || !outputCanvasRef.current) return;

    captureSelfie(data, outputCanvasRef.current);
    proceedToConfirmation();
  }, [captureSelfie, getScreenshot, proceedToConfirmation]);

  const handleReset = useCallback(() => {
    loopDestroyerRef.current = false;

    setSelfieCaptured(false);
    setShowManualCapture(true);
    setStatus(CaptureStatus.Idle);

    resumeMediaStream();
  }, [resumeMediaStream]);

  const showManualCaptureBtn = useMemo(
    () => readyToShoot && showManualCapture && !selfieCaptured,
    [readyToShoot, selfieCaptured, showManualCapture]
  );

  const showConfirmation = useMemo(
    () =>
      readyToShoot && selfieCaptured && status === CaptureStatus.Confirmation,
    [readyToShoot, selfieCaptured, status]
  );

  const processScreenshot = useCallback(
    (data: ImageData): FaceDetectionStatus => {
      const ctx = debugOverlayRef.current?.getContext("2d");

      const faces = detectFaces(data, ctx);
      return validateFaces(faces);
    },
    [detectFaces, validateFaces]
  );

  // initialize face detector
  useEffect(() => {
    if (camera?.stream && !initializing && !initialized) {
      init()
        .then(() => {
          console.info("Face detector initialized");
        })
        .catch((e) => {
          console.error("Face detector initialization failed", e);
        });
    }
  }, [init, initialized, initializing, camera]);

  // run face detection loop
  useEffect(() => {
    if (
      !initialized ||
      !readyToShoot ||
      selfieCaptured ||
      status === CaptureStatus.Ready ||
      status === CaptureStatus.Done ||
      status === CaptureStatus.Confirmation
    )
      return;

    let timeout: ReturnType<typeof setTimeout>;
    let result!: FaceDetectionStatus;

    const processVideo = () => {
      // it is a way to exit from the loop
      // when manual capture destroys effect and clears timeout but function has already started
      if (!!loopDestroyerRef.current) return;

      const begin = performance.now();

      const data = getScreenshot();
      if (data) {
        result = processScreenshot(data);
      }

      if (result !== FaceDetectionStatus.FaceNotFound && !firstFaceDetection) {
        setFirstFaceDetection(true);
      }

      let nextStatus: CaptureStatus;

      if (result === FaceDetectionStatus.Success) {
        nextStatus = CaptureStatus.Ready;
      } else if (result === FaceDetectionStatus.FaceNotFound) {
        nextStatus = CaptureStatus.FaceNotFound;
      } else {
        nextStatus = CaptureStatus.Pending;
      }

      setStatus(nextStatus);

      if (result !== FaceDetectionStatus.Success) {
        const delay = FACE_DETECTION_INTERVAL - (performance.now() - begin);
        timeout = setTimeout(processVideo, delay);
      }
    };

    if (result !== FaceDetectionStatus.Success) {
      processVideo();
    }

    return () => clearTimeout(timeout);
  }, [
    processScreenshot,
    getScreenshot,
    initialized,
    readyToShoot,
    selfieCaptured,
    status,
    firstFaceDetection,
  ]);

  // set delay for the final capture
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (status === CaptureStatus.Ready) {
      timeout = setTimeout(() => {
        const data = getScreenshot();

        if (!data || !outputCanvasRef.current) return CaptureStatus.Pending;

        const result = processScreenshot(data);

        if (result === FaceDetectionStatus.Success) {
          captureSelfie(data, outputCanvasRef.current);
          setStatus(CaptureStatus.Done);
        } else {
          setStatus(
            result === FaceDetectionStatus.FaceNotFound
              ? CaptureStatus.FaceNotFound
              : CaptureStatus.Pending
          );
        }
      }, AUTO_CAPTURE_DELAY);
    }

    return () => clearTimeout(timeout);
  }, [captureSelfie, processScreenshot, getScreenshot, status]);

  // set delay for confirmation screen
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (status === CaptureStatus.Done) {
      timeout = setTimeout(proceedToConfirmation, CAPTURE_CONFIRMATION_DELAY);
    }

    return () => clearTimeout(timeout);
  }, [proceedToConfirmation, status]);

  // show button for manual capture after global timeout
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (readyToShoot) {
      timeout = setTimeout(
        () => setShowManualCapture(true),
        MANUAL_CAPTURE_GLOBAL_TIMEOUT
      );
    }

    return () => clearTimeout(timeout);
  }, [readyToShoot]);

  // show button for manual capture after timeout after the first face detection
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (firstFaceDetection) {
      timeout = setTimeout(
        () => setShowManualCapture(true),
        MANUAL_CAPTURE_TIMEOUT
      );
    }

    return () => clearTimeout(timeout);
  }, [firstFaceDetection]);

  return (
    <div>
      <div className="video-box">
        <OutputVideo videoRef={videoRef} debugOverlayRef={debugOverlayRef} />
        <OutputCanvas ref={outputCanvasRef} hidden={!showConfirmation} />
      </div>

      {showManualCaptureBtn && (
        <button disabled={initializing} onClick={handleManualCapture}>
          Take selfie
        </button>
      )}

      {showConfirmation && (
        <div>
          <button onClick={handleReset}>Retake</button>
        </div>
      )}
    </div>
  );
}
