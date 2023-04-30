export type Modules = Partial<{
  asm: string;
  wasm: string;
  simd: string;
  threads: string;
  threadsSimd: string;
}>;

declare type MatType = number;

declare class OpenCV {
  static CV_8U: MatType;
  static CV_8UC1: MatType;
  static CV_8UC2: MatType;
  static CV_8UC3: MatType;
  static CV_8UC4: MatType;
  static CV_8S: MatType;
  static CV_8SC1: MatType;
  static CV_8SC2: MatType;
  static CV_8SC3: MatType;
  static CV_8SC4: MatType;

  static CV_16U: MatType;
  static CV_16UC1: MatType;
  static CV_16UC2: MatType;
  static CV_16UC3: MatType;
  static CV_16UC4: MatType;
  static CV_16S: MatType;
  static CV_16SC1: MatType;
  static CV_16SC2: MatType;
  static CV_16SC3: MatType;
  static CV_16SC4: MatType;

  static CV_32S: MatType;
  static CV_32SC1: MatType;
  static CV_32SC2: MatType;
  static CV_32SC3: MatType;
  static CV_32SC4: MatType;
  static CV_32F: MatType;
  static CV_32FC1: MatType;
  static CV_32FC2: MatType;
  static CV_32FC3: MatType;
  static CV_32FC4: MatType;

  static CV_64F: MatType;
  static CV_64FC1: MatType;
  static CV_64FC2: MatType;
  static CV_64FC3: MatType;
  static CV_64FC4: MatType;
  static COLOR_RGBA2GRAY: MatType;

  static matFromImageData(imgData: ImageData): OpenCV.Mat;

  static matFromArray(
    rows: number,
    cols: number,
    type: MatType,
    array: ArrayBuffer
  ): OpenCV.Mat;

  static imshow(cvs: HTMLCanvasElement | string, dst: OpenCV.Mat): void;

  static imread(
    source: string | HTMLCanvasElement | HTMLImageElement
  ): OpenCV.Mat;

  static getBuildInformation(): string;

  static onRuntimeInitialized: () => void;

  static pyrDown(src: OpenCV.Mat, dst: OpenCV.Mat): void;

  static cvtColor(src: OpenCV.Mat, dst: OpenCV.Mat, type: MatType): void;

  static FS_createDataFile(
    rootPath: string,
    filePath: string,
    data: Uint8Array,
    _: boolean, // unknown
    _: boolean, // unknown
    _: boolean // unknown
  ): void;
}

declare namespace OpenCV {
  class NativeObject {
    size(): Size;

    get(index: number): Rect;

    delete: () => void;

    isDeleted: () => boolean;
  }

  class MatData {
    set: (data: ArrayBuffer) => void;
  }

  class CascadeClassifier {
    public cc: Ptr;

    /**
     *
     */
    constructor();

    /**
     * @brief Loads a classifier from a file.
     *
     * @param filename Name of the file from which the classifier is loaded.
     */
    constructor(filename: string);

    /**
     * @param filename Name of the file from which the classifier is loaded.
     */
    public constructor(filename: string);

    /**
     *   The function is parallelized with the TBB library.
     *
     * (Python) A face detection example using cascade classifiers can be found at
     * opencv_source_code/samples/python/facedetect.py
     *
     * @param image Matrix of the type CV_8U containing an image where objects are detected.
     *
     * @param objects Vector of rectangles where each rectangle contains the detected object, the
     * rectangles may be partially outside the original image.
     *
     * @param scaleFactor Parameter specifying how much the image size is reduced at each image scale.
     *
     * @param minNeighbors Parameter specifying how many neighbors each candidate rectangle should have
     * to retain it.
     *
     * @param flags Parameter with the same meaning for an old cascade as in the function
     * cvHaarDetectObjects. It is not used for a new cascade.
     *
     * @param minSize Minimum possible object size. Objects smaller than that are ignored.
     *
     * @param maxSize Maximum possible object size. Objects larger than that are ignored. If maxSize ==
     * minSize model is evaluated on single scale.
     */
    public detectMultiScale(
      image: InputArray,
      objects: any,
      scaleFactor?: double,
      minNeighbors?: int,
      flags?: int,
      minSize?: Size,
      maxSize?: Size
    ): InputArray;

    /**
     *   This is an overloaded member function, provided for convenience. It differs from the above
     * function only in what argument(s) it accepts.
     *
     * @param image Matrix of the type CV_8U containing an image where objects are detected.
     *
     * @param objects Vector of rectangles where each rectangle contains the detected object, the
     * rectangles may be partially outside the original image.
     *
     * @param numDetections Vector of detection numbers for the corresponding objects. An object's number
     * of detections is the number of neighboring positively classified rectangles that were joined
     * together to form the object.
     *
     * @param scaleFactor Parameter specifying how much the image size is reduced at each image scale.
     *
     * @param minNeighbors Parameter specifying how many neighbors each candidate rectangle should have
     * to retain it.
     *
     * @param flags Parameter with the same meaning for an old cascade as in the function
     * cvHaarDetectObjects. It is not used for a new cascade.
     *
     * @param minSize Minimum possible object size. Objects smaller than that are ignored.
     *
     * @param maxSize Maximum possible object size. Objects larger than that are ignored. If maxSize ==
     * minSize model is evaluated on single scale.
     */
    public detectMultiScale(
      image: InputArray,
      objects: any,
      numDetections: any,
      scaleFactor?: double,
      minNeighbors?: int,
      flags?: int,
      minSize?: Size,
      maxSize?: Size
    ): InputArray;

    /**
     *   This is an overloaded member function, provided for convenience. It differs from the above
     * function only in what argument(s) it accepts. This function allows you to retrieve the final stage
     * decision certainty of classification. For this, one needs to set `outputRejectLevels` on true and
     * provide the `rejectLevels` and `levelWeights` parameter. For each resulting detection,
     * `levelWeights` will then contain the certainty of classification at the final stage. This value can
     * then be used to separate strong from weaker classifications.
     *
     *   A code sample on how to use it efficiently can be found below:
     *
     *   ```cpp
     *   Mat img;
     *   vector<double> weights;
     *   vector<int> levels;
     *   vector<Rect> detections;
     *   CascadeClassifier model("/path/to/your/model.xml");
     *   model.detectMultiScale(img, detections, levels, weights, 1.1, 3, 0, Size(), Size(), true);
     *   cerr << "Detection " << detections[0] << " with weight " << weights[0] << endl;
     *   ```
     */
    public detectMultiScale(
      image: InputArray,
      objects: any,
      rejectLevels: any,
      levelWeights: any,
      scaleFactor?: double,
      minNeighbors?: int,
      flags?: int,
      minSize?: Size,
      maxSize?: Size,
      outputRejectLevels?: bool
    ): InputArray;

    public getFeatureType(): int;

    public getMaskGenerator(): Ptr;

    public getOldCascade(): any;

    public getOriginalWindowSize(): Size;

    public isOldFormatCascade(): bool;

    /**
     * @brief Checks whether the classifier has been loaded.
     */
    empty(): boolean;

    /**
     * @param filename Name of the file from which the classifier is loaded. The file may contain an old
     * HAAR classifier trained by the haartraining application or a new cascade classifier trained by the
     * traincascade application.
     */
    public load(filename: string): boolean;

    /**
     *   The file may contain a new cascade classifier (trained traincascade application) only.
     */
    public read(node: FileNode): FileNode;

    public setMaskGenerator(maskGenerator: Ptr): Ptr;

    public static convert(oldcascade: string, newcascade: string): string;
  }

  class Mat extends NativeObject {
    constructor(height: number, width: number, type: number);

    constructor(src: Mat, rect: Rect);

    constructor();

    data: MatData;

    copyTo: (dest: Mat) => void;

    roi(rect: Rect): Mat;
  }

  class RectVector extends NativeObject {}

  class Point {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number);
  }

  class Size {
    width: number;
    height: number;

    constructor(width: number, height: number);
  }

  class Rect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;

    constructor();
    constructor(rect: Rect);
    constructor(point: Point, size: Size);
    constructor(x: number, y: number, width: number, height: number);
  }
}

declare global {
  export const cv: typeof OpenCV;
}
