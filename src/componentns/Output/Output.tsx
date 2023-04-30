import { ForwardedRef, RefObject, forwardRef } from "react";

import "./styles.css";

export function OutputVideo({
  videoRef,
  debugOverlayRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  debugOverlayRef: RefObject<HTMLCanvasElement>;
  id?: string;
}) {
  return (
    <>
      <video
        className="output-video"
        playsInline
        autoPlay
        ref={videoRef}
        onCanPlay={(e) => {
          const video = e.target as HTMLVideoElement;
          const { height, width } = video.getBoundingClientRect();
          video.height = height;
          video.width = width;

          // resize overlay canvas to full video size
          if (debugOverlayRef.current) {
            debugOverlayRef.current.width = video.videoWidth;
            debugOverlayRef.current.height = video.videoHeight;
          }

          video.removeAttribute("controls");
        }}
      />
      <canvas ref={debugOverlayRef} className="overlay-canvas" />
    </>
  );
}

export const OutputCanvas = forwardRef(
  ({ hidden }: { hidden: boolean }, ref: ForwardedRef<HTMLCanvasElement>) => {
    return (
      <canvas
        ref={ref}
        className="overlay-canvas"
        style={{ visibility: hidden ? "hidden" : "visible" }}
      />
    );
  }
);
