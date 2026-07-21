// Villa photos routinely arrive as multi-MB, multi-thousand-pixel PNG
// screenshots/exports. Nothing on the site displays a photo wider than
// ~1600px, so we resize + re-encode to WebP client-side before upload —
// keeps Storage (and page weight) small no matter what gets dragged in.
export async function compressImage(file: File, opts: { maxDim?: number; quality?: number } = {}) {
  const maxDim = opts.maxDim ?? 2000;
  const quality = opts.quality ?? 0.82;

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas desteklenmiyor.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (webp) return { blob: webp, ext: 'webp' };

  // Older Safari etc. without WebP encode support.
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (jpeg) return { blob: jpeg, ext: 'jpg' };

  throw new Error('Tarayıcı resim sıkıştırmayı desteklemiyor.');
}
