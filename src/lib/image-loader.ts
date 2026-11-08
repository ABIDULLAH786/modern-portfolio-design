/** next/image loader: ImageKit URLs get on-the-fly resizing (format is auto-negotiated by ImageKit). */
export default function imageKitLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const isImageKit = src.startsWith("https://ik.imagekit.io/") || (!!endpoint && src.startsWith(endpoint));
  if (!isImageKit) return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  return `${src}${src.includes("?") ? "&" : "?"}tr=w-${width},q-${quality ?? 80}`;
}
