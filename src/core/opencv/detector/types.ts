import { OpenCV } from "../types";

export type Dimensions = {
  height: number;
  width: number;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type Rect = Coordinates & Dimensions;

export type AssetGetterFn = (assetPath: string) => string;

export type MetaData = { [attribute: string]: MetaDataValue };

export declare type MetaDataValue =
  | string
  | number
  | boolean
  | MetaData
  | undefined;

export type UseFaceDetectionProps = {
  logInfo: LogInfo;
  logError: LogError;
  getAssetPath: AssetGetterFn;
  fetchAsset: (path: string) => Promise<ArrayBuffer>;
};

type LogArg = { message: string; console?: boolean } & MetaData;

export type LogInfo = (args: LogArg) => void;
export type LogError = (args: LogArg) => void;

export enum FaceDetectionStatus {
  FaceNotFound = "FaceNotFound",
  EyesNotFound = "EyesNotFound",
  TooSmall = "TooSmall",
  TooBig = "TooBig",
  TooCloseToTopBorder = "TooCloseToTopBorder",
  TooCloseToLeftBorder = "TooCloseToLeftBorder",
  TooCloseToRightBorder = "TooCloseToRightBorder",
  TooCloseToBottomBorder = "TooCloseToBottomBorder",
  Success = "Success",
  Failure = "Failure",
}

export type FaceDetectionResult = {
  faces: OpenCV.RectVector;
  eyes: OpenCV.RectVector;
};
