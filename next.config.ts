import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const ikEndpoint =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io";
const ikOrigin = (() => {
  try {
    return new URL(ikEndpoint).origin;
  } catch {
    return "https://ik.imagekit.io";
  }
})();

const csp = [
  "default-src 'self'",
  `img-src 'self' data: blob: ${ikOrigin} https://ik.imagekit.io https://i.ytimg.com`,
  "media-src 'self' https://ik.imagekit.io",
  "frame-src 'self' https://www.youtube-nocookie.com",
  `connect-src 'self' https://upload.imagekit.io https://vitals.vercel-insights.com`,
  // 'unsafe-inline' is needed for the theme pre-paint script (see DECISIONS.md)
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // We use unstable_cache + tag revalidation instead of Cache Components (see DECISIONS.md).
  cacheComponents: false,
  poweredByHeader: false,
  // Expose the ImageKit endpoint to the next/image loader in the browser.
  env: { NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: ikEndpoint },
  serverExternalPackages: ["mongoose", "bcryptjs"],
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/((?!preview).*)",
        headers: [
          ...baseHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: `${csp}; frame-ancestors 'none'` },
        ],
      },
      {
        source: "/preview",
        headers: [
          ...baseHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: `${csp}; frame-ancestors 'self'` },
        ],
      },
    ];
  },
};

export default nextConfig;
