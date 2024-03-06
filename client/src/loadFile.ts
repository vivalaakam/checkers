export async function loadFile(file: Blob): Promise<Float32Array> {
  let contents = await file.arrayBuffer();
  return new Float32Array(contents);
}
