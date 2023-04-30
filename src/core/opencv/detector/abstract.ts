import {
  AssetGetterFn,
  FaceDetectionResult,
  FaceDetectionStatus,
  LogError,
  LogInfo,
} from "./types";

export abstract class FaceDetector {
  /** boolean to hold the openCV module's loading state */
  public moduleInitialized = false;

  /** boolean to hold the `faceClassifier` & `eyeClassifier` initialization state */
  public modelInitialized = false;

  /** boolean to hold the matrixes & canvases intialization state, as those need to be freed */
  public dataInitialized = false;

  abstract detectHaarFace(
    data: ImageData,
    debugCtx?: CanvasRenderingContext2D | null
  ): FaceDetectionResult;

  abstract validate(input: FaceDetectionResult): FaceDetectionStatus;

  abstract init(): Promise<boolean>;

  /** Initializes all matrixes and classifiers necessary for processing */
  abstract initData(): Promise<boolean>;
  // eslint-disable-next-line no-useless-constructor
  constructor(
    /** a function that will provide the full path to retrieve the assets from */
    public getAssetPath: AssetGetterFn,
    /** logger function to the info channel */
    public logInfo: LogInfo,
    /** logger function to the error channel */
    public logError: LogError,
    /** function that should retrieve a given full path and return it as an ArrayBuffer  */
    public fetchAsset: (path: string) => Promise<ArrayBuffer>
  ) {}
}
