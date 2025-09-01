// src/utils/imageCompression.ts

/**
 * Compress and resize an image Blob/File so its height ≤ maxHeight,
 * preserving aspect ratio. Width will auto-scale.
 * Supports PNG transparency by outputting PNG when the input is PNG.
 *
 * @param file      The input image Blob or File.
 * @param maxHeight The max height in pixels (default: 800).
 * @param quality   JPEG quality between 0 and 1 (default: 0.85).
 * @returns         A Promise resolving to the compressed Blob.
 */
export async function compressFile(
  file: Blob,
  maxHeight = 800,
  quality = 0.85,
): Promise<Blob> {
  // 1) Load into a Data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(
      file instanceof File ? file : new File([file], "image"),
    );
  });

  // 2) Create an HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = dataUrl;
  });

  // 3) Calculate target dimensions (only cap height)
  let { width, height } = img;
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  // 4) Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // 5) Choose output format: PNG if original was PNG, else JPEG
  const isPng = file.type === "image/png";
  const mimeType = isPng ? "image/png" : "image/jpeg";
  const outputQuality = isPng ? undefined : quality;

  // 6) Export blob
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob!), mimeType, outputQuality),
  );
}
