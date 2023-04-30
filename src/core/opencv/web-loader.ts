// File generated by openCV js build script
// Enhanced for sdk usage
import { simd, threads } from "wasm-feature-detect";

import { insertScript } from "../mount";
import { LogInfo } from "./detector/types";
import { Modules } from "./types";

export async function loadOpenCV({
  paths,
  onloadCallback,
  onerrorCallback,
  logInfo,
}: {
  paths: Modules;
  onloadCallback: (path: string) => void;
  onerrorCallback: (path: string) => void;
  logInfo: LogInfo;
}) {
  const startedAt = Date.now();

  let OPENCV_URL = "";
  let asmPath = "";
  let wasmPath = "";
  let simdPath = "";
  let threadsPath = "";
  let threadsSimdPath = "";

  if (!(paths instanceof Object)) {
    onerrorCallback(
      "The first input should be a object that points the path to the OpenCV.js"
    );
  }

  if (paths.asm) {
    asmPath = paths.asm;
  }

  if (paths.wasm) {
    wasmPath = paths.wasm;
  }

  if (paths.threads) {
    threadsPath = paths.threads;
  }

  if (paths.simd) {
    simdPath = paths.simd;
  }

  if (paths.threadsSimd) {
    threadsSimdPath = paths.threadsSimd;
  }

  const wasmSupported = !(typeof WebAssembly === "undefined");
  if (!wasmSupported && OPENCV_URL === "" && asmPath !== "") {
    OPENCV_URL = asmPath;
    logInfo({
      message: "The OpenCV.js for Asm.js is loaded now",
    });
  } else if (!wasmSupported && asmPath === "") {
    onerrorCallback(
      "The browser supports the Asm.js only, but the path of OpenCV.js for Asm.js is empty"
    );
  }

  const simdSupported = wasmSupported ? await simd() : false;
  const threadsSupported = wasmSupported ? await threads() : false;

  if (simdSupported && threadsSupported && threadsSimdPath !== "") {
    OPENCV_URL = threadsSimdPath;
    logInfo({
      message: "The OpenCV.js with simd and threads optimization is loaded now",
    });
  } else if (simdSupported && simdPath !== "") {
    if (threadsSupported && threadsSimdPath === "") {
      logInfo({
        message:
          "The browser supports simd and threads, but the path of OpenCV.js with simd and threads optimization is empty",
      });
    }
    OPENCV_URL = simdPath;
    logInfo({
      message: "The OpenCV.js with simd optimization is loaded now.",
    });
  } else if (threadsSupported && threadsPath !== "") {
    if (simdSupported && threadsSimdPath === "") {
      logInfo({
        message:
          "The browser supports simd and threads, but the path of OpenCV.js with simd and threads optimization is empty",
      });
    }
    OPENCV_URL = threadsPath;
    logInfo({
      message: "The OpenCV.js with threads optimization is loaded now",
    });
  } else if (wasmSupported && wasmPath !== "") {
    if (simdSupported && threadsSupported) {
      logInfo({
        message:
          "The browser supports simd and threads, but the path of OpenCV.js with simd and threads optimization is empty",
      });
    }

    if (simdSupported) {
      logInfo({
        message:
          "The browser supports simd optimization, but the path of OpenCV.js with simd optimization is empty",
      });
    }

    if (threadsSupported) {
      logInfo({
        message:
          "The browser supports threads optimization, but the path of OpenCV.jslet threads optimization is empty",
      });
    }

    OPENCV_URL = wasmPath;
    logInfo({
      message: "The OpenCV.js for wasm is loaded now",
    });
  } else if (wasmSupported) {
    logInfo({
      message:
        "The browser supports wasm, but the path of OpenCV.js for wasm is empty",
    });
  }

  if (OPENCV_URL === "") {
    onerrorCallback("No available OpenCV.js, please check your paths");
  }

  async function onLoaded() {
    logInfo({
      message: "OpenCV.js module loaded",
      duration: Date.now() - startedAt,
    });
    onloadCallback(OPENCV_URL);
  }

  insertScript(OPENCV_URL)
    .then(async (result) => {
      if (result === "present") onLoaded();
      else if (typeof cv.getBuildInformation === "function") {
        onLoaded();
      } else if (cv instanceof Promise) {
        // @ts-ignore
        cv = await cv;
        onLoaded();
      } else {
        // WASM w/o promise
        cv.onRuntimeInitialized = () => {
          onLoaded();
        };
      }
    })
    .catch(onerrorCallback);
}