import { Modules, OpenCV } from "../types";
import { createFileFromUrl } from "../utils";
import { loadOpenCV } from "../web-loader";
import { FaceDetector } from "./abstract";
import {
  CENTER_THRESHOLD,
  MAX_HEIGHT_THRESHOLD,
  MIN_HEIGHT_THRESHOLD,
} from "./consts";
import { FaceDetectionResult, FaceDetectionStatus } from "./types";
import { getBiggestFaceRect, showDebugFrames } from "./utils";

export class OpenCvFaceDetector extends FaceDetector {
  /** paths from which to load several opencv build types */
  private modulePaths: Modules = {};

  /** filename of classifier for front face detection */
  // private faceClassifierFilename = "haarcascade_frontalface_alt.xml";
  // private faceClassifierFilename = "haarcascade_frontalface_alt_tree.xml";
  private faceClassifierFilename = "haarcascade_frontalface_default.xml";
  // private eyeClassifierFilename = "haarcascade_eye_tree_eyeglasses.xml";
  private eyeClassifierFilename = "haarcascade_eye.xml";

  /** front face classifier instance */
  private faceClassifier: OpenCV.CascadeClassifier | undefined;
  private eyeClassifier: OpenCV.CascadeClassifier | undefined;

  private scaleFactor = 2.5;
  private scaleFactorX = 1;
  private scaleFactorY = 1;

  private srcSize!: OpenCV.Size;

  public async init(): Promise<boolean> {
    this.modulePaths = {
      asm: this.getAssetPath("opencv/asm/opencv.js"),
      wasm: this.getAssetPath("opencv/wasm/opencv.js"),
      threads: this.getAssetPath("opencv/threads/opencv.js"),
    };

    return new Promise((resolve, reject) => {
      if (this.moduleInitialized) {
        this.logInfo({
          message: `OpenCV already loaded`,
        });
        resolve(true);
      } else {
        loadOpenCV({
          paths: this.modulePaths,
          logInfo: this.logInfo,
          onloadCallback: async (loadedPath: string) => {
            this.logInfo({
              message: `OpenCV loaded from ${loadedPath}`,
            });
            this.moduleInitialized = true;
            resolve(true);
          },
          onerrorCallback: (message: string) => {
            reject(new Error(`OpenCV failed to load: ${message}`));
          },
        });
      }
    });
  }

  /**
   * Will try to load the file first, if not possible, create the file and load or exit */
  public async initClassifiers(): Promise<boolean> {
    const loadClassifiers = () => {
      if (!this.faceClassifier)
        throw new Error("Face classifier was not properly initialized");

      const faceLoaded = this.faceClassifier.load(this.faceClassifierFilename);

      if (!this.eyeClassifier)
        throw new Error("Eye classifier was not properly initialized");

      const eyeLoaded = this.eyeClassifier.load(this.eyeClassifierFilename);

      this.modelInitialized = faceLoaded && eyeLoaded;
      return this.modelInitialized;
    };

    const loadFiles = async (callback: () => void) => {
      createFileFromUrl(
        this.faceClassifierFilename,
        await this.fetchAsset(
          this.getAssetPath(`opencv/${this.faceClassifierFilename}`)
        )
      );

      createFileFromUrl(
        this.eyeClassifierFilename,
        await this.fetchAsset(
          this.getAssetPath(`opencv/${this.eyeClassifierFilename}`)
        )
      );

      callback();
    };

    return new Promise<boolean>((resolve) => {
      // try to load the classifiers
      if (loadClassifiers()) {
        resolve(true);
      } else if (this.modelInitialized) {
        // either the file is already loaded and something unexpected happened
        this.logError({
          message: `Classifiers exist in FS but could not be loaded`,
        });
        resolve(false);
      } else {
        // or we need to load them
        loadFiles(() => {
          resolve(loadClassifiers());
        });
      }
    });
  }

  public async initData(): Promise<boolean> {
    if (this.dataInitialized) {
      this.logError({
        message: "Trying to load OpenCV data multiple times, free them before",
      });
      return false;
    }

    this.faceClassifier = new cv.CascadeClassifier();
    this.eyeClassifier = new cv.CascadeClassifier();

    await this.initClassifiers();

    if (this.modelInitialized) {
      this.dataInitialized = true;
      return true;
    }

    this.logError({
      message: "Failed to load the necessary sets for opencv",
    });
    return false;
  }

  public detectHaarFace(
    imgData: ImageData,
    debugCtx?: CanvasRenderingContext2D | null
  ): FaceDetectionResult {
    const srcMat = new cv.Mat(imgData.height, imgData.width, cv.CV_8UC4);
    srcMat.data.set(imgData.data);

    const grayMat = new cv.Mat(imgData.height, imgData.width, cv.CV_8UC4);
    const scaledMat = new cv.Mat();

    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
    // @ts-ignore
    cv.resize(
      grayMat,
      scaledMat,
      new cv.Size(
        imgData.width / this.scaleFactor,
        imgData.height / this.scaleFactor
      ),
      0,
      0,
      // @ts-ignore
      cv.INTER_AREA
    );
    cv.pyrDown(scaledMat, scaledMat);

    const faces = new cv.RectVector();
    this.faceClassifier?.detectMultiScale(scaledMat, faces, 1.1, 4, 0);

    const eyes = new cv.RectVector();
    //@ts-ignore
    for (let i = 0; i < faces.size(); i++) {
      const face = faces.get(i);
      const faceRect = scaledMat.roi(face);
      this.eyeClassifier?.detectMultiScale(faceRect, eyes, 1.05, 4, 0);
    }

    // define final scaling
    this.srcSize = srcMat.size();
    const scaledSize = scaledMat.size();
    this.scaleFactorX = this.srcSize.width / scaledSize.width;
    this.scaleFactorY = this.srcSize.height / scaledSize.height;

    srcMat.delete();
    grayMat.delete();
    scaledMat.delete();

    // draw debug frames
    if (debugCtx) {
      showDebugFrames(
        debugCtx,
        faces,
        eyes,
        this.scaleFactorX,
        this.scaleFactorY
      );
    }

    return { faces, eyes };
  }

  public validate(input: FaceDetectionResult): FaceDetectionStatus {
    const { faces, eyes } = input;

    // opencv makes many mistakes, number of faces is unstable
    const face = getBiggestFaceRect(faces);

    if (!face) {
      return FaceDetectionStatus.FaceNotFound;
    }

    // @ts-ignore
    if (eyes.size() < 1) {
      return FaceDetectionStatus.EyesNotFound;
    }

    // check position of the centers

    // face square center
    const faceCenterX =
      face.x * this.scaleFactorX + (face.width * this.scaleFactorX) / 2;
    const faceCenterY =
      face.y * this.scaleFactorY + (face.height * this.scaleFactorY) / 2;
    // target center
    const targetCenterX = this.srcSize.width / 2;
    const targetCenterY = this.srcSize.height / 2;

    if (faceCenterY > targetCenterY + targetCenterY * CENTER_THRESHOLD)
      return FaceDetectionStatus.TooCloseToBottomBorder;
    if (faceCenterY < targetCenterY - targetCenterY * CENTER_THRESHOLD)
      return FaceDetectionStatus.TooCloseToTopBorder;
    if (faceCenterX < targetCenterX - targetCenterX * CENTER_THRESHOLD)
      return FaceDetectionStatus.TooCloseToRightBorder;
    if (faceCenterX > targetCenterX + targetCenterX * CENTER_THRESHOLD)
      return FaceDetectionStatus.TooCloseToLeftBorder;

    // check relation between detected face and original image
    if (
      face.height * this.scaleFactorY <
      this.srcSize.height * MIN_HEIGHT_THRESHOLD
    )
      return FaceDetectionStatus.TooSmall;
    if (
      face.height * this.scaleFactorY >
      this.srcSize.height * MAX_HEIGHT_THRESHOLD
    )
      return FaceDetectionStatus.TooBig;

    return FaceDetectionStatus.Success;
  }
}
