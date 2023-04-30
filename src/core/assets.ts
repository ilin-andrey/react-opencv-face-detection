import { ASSETS_PATH } from "./consts";

export function getAssetPath(path: string): string {
  return `${ASSETS_PATH}/${path}`;
}
