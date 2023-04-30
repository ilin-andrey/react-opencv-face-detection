## Overview

This repository is an example of how OpenCV `js` bundles and React can be utilized for real-time face detection from a device camera.

### Build / Test / Lint / Typecheck

```bash
# Install dependencies
$ pnpm install

# Run the project locally
$ pnpm dev

# Run linter
$ pnpm lint

# Run build
$ pnpm build
```

### Folder Structure

`assets/` - static files and opencv bundles + models  
`opencv-build/` - everything to build opencv packages  
`src/`  
⋅⋅⋅`components/` - react components  
⋅⋅⋅`hooks/` - utility and/or app configuration hooks  
⋅⋅⋅`core/` - core functions

### OpenCV

OpenCV provides a real-time optimized Computer Vision library, tools, and hardware.

#### Warning

There are some discrepancies between OpenCV code and build tools, which are known issues. Please do the following to fix them:

- use `emscripten/emsdk:2.0.26` Docker container which is the latest stable version which can build everything
- replace build script `build_js.py` in repositpory by `opencv-build/platforms/js/build_js.py`
- replace header file `intrin_wasm.hpp` in repositpory by `opencv-build/modules/core/include/opencv2/core/hal/intrin_wasm.hpp`

#### Build

Run the following commands to build javascript libraries:

```
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.26 emcmake python3 ./platforms/js/build_js.py build_asm --disable_wasm
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.26 emcmake python3 ./platforms/js/build_js.py build_wasm --build_wasm
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.26 emcmake python3 ./platforms/js/build_js.py build_threads --build-wasm --threads
```

After all that copy **opencv.js**, **opencv_js.js** & **opencv_js.worker.js** (if available) from each **build_X/bin/** folder into their **public/assets/opencv/X/** folder at the root of the project.

#### SIMD optimizations

OpenCV.js version with SIMD optimizations doesn't work in Firefox 104 and below. Threads + SIMD version works only through HTTPS and doesn't work in Firefox 104 and below too.

### Links

- [OpenCV repository](https://github.com/opencv/opencv)
- [Build OpenCV.js](https://docs.opencv.org/3.4/d4/da1/tutorial_js_setup.html)
- [Building OpenCV.js using Docker fails on macOS 11.3 #20313](https://github.com/opencv/opencv/issues/20313)
