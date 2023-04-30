/**
 * create a file in openCV's virtual file system
 * @param path path to which the file should be saved
 * @param data the data typed as ArrayBuffer to be assigned in the FS
 */
export function createFileFromUrl(path: string, data: ArrayBuffer) {
  const uint = new Uint8Array(data);
  cv.FS_createDataFile("/", path, uint, true, false, false);
}
