import { useCallback, useRef, useState } from "react";

import { FaceDetector } from "../core/opencv/detector/abstract";
import { OpenCvFaceDetector } from "../core/opencv/detector/detector";
import {
  FaceDetectionResult,
  FaceDetectionStatus,
  UseFaceDetectionProps,
} from "../core/opencv/detector/types";

export function useFaceDetection({
  logInfo,
  logError,
  fetchAsset,
  getAssetPath,
}: UseFaceDetectionProps) {
  const FaceDetectorInstance = useRef<FaceDetector>();

  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const init = useCallback(async () => {
    setInitializing(true);

    const faceDetector = new OpenCvFaceDetector(
      getAssetPath,
      logInfo,
      logError,
      fetchAsset
    );

    FaceDetectorInstance.current = faceDetector;

    try {
      await faceDetector.init();

      logInfo({
        message: "Initialize face detector data",
      });

      await faceDetector.initData();
    } catch (e) {
      logError({ message: e as string });
      throw new Error("Failed to initialize the face detection service");
    } finally {
      setInitializing(false);
      setInitialized(true);
    }
  }, [fetchAsset, getAssetPath, logError, logInfo]);

  const detectFaces = useCallback(
    (
      imgData: ImageData,
      debugCtx?: CanvasRenderingContext2D | null
    ): FaceDetectionResult | null => {
      let result = null;

      if (!FaceDetectorInstance.current) {
        return result;
      }

      try {
        // OpenCV raises an exception if browser doesn't support any of features
        return FaceDetectorInstance.current.detectHaarFace(imgData, debugCtx);
      } catch (e) {
        logError({ message: e as string });
      }

      return result;
    },
    []
  );

  const validateFaces = useCallback((input: FaceDetectionResult | null) => {
    if (input == null || input.faces == null || input.eyes == null)
      return FaceDetectionStatus.Failure;

    if (!FaceDetectorInstance.current) {
      return FaceDetectionStatus.Failure;
    }

    return FaceDetectorInstance.current.validate(input);
  }, []);

  return {
    init,
    detectFaces,
    validateFaces,
    initializing,
    initialized,
  };
}
