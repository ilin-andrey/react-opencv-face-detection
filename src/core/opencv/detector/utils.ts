import { OpenCV } from "../types";

export function showDebugFrames(
  ctx: CanvasRenderingContext2D,
  faces: OpenCV.RectVector,
  eyes: OpenCV.RectVector,
  scaleFactorX: number,
  scaleFactorY: number
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  //@ts-ignore .size() returns an iterable class
  for (let i = 0; i < faces.size(); ++i) {
    const faceRect = faces.get(i);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.rect(
      faceRect.x * scaleFactorX,
      faceRect.y * scaleFactorY,
      faceRect.width * scaleFactorX,
      faceRect.height * scaleFactorY
    );
    ctx.stroke();

    //@ts-ignore .size() returns an iterable class
    for (let j = 0; j < eyes.size(); ++j) {
      const eyesRect = eyes.get(j);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.rect(
        faceRect.x * scaleFactorX + eyesRect.x * scaleFactorX,
        faceRect.y * scaleFactorY + eyesRect.y * scaleFactorY,
        eyesRect.width * scaleFactorX,
        eyesRect.height * scaleFactorY
      );
      ctx.stroke();
    }
  }
}

export function getBiggestFaceRect(
  faces: OpenCV.RectVector
): OpenCV.Rect | null {
  let result = null;

  //@ts-ignore
  for (let i = 0; i < faces.size(); i++) {
    const faceRect = faces.get(i);

    if (!result || faceRect.width > result.width) {
      result = faceRect;
    }
  }

  return result;
}
