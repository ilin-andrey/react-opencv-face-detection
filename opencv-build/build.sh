#!/bin/sh

docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.26 emcmake python3 ./platforms/js/build_js.py build_asm --disable_wasm
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.26 emcmake python3 ./platforms/js/build_js.py build_wasm --build_wasm
docker run --rm -v $(pwd):/src -u $(id -u):$(id -g) emscripten/emsdk:2.0.26 emcmake python3 ./platforms/js/build_js.py build_threads --build-wasm --threads
