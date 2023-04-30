export async function fetchAsset(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  return response.arrayBuffer();
}
