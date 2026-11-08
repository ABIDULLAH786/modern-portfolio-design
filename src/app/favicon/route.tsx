import { ImageResponse } from "next/og";
import { initials } from "@/lib/utils/text";
import { getProfile } from "@/server/queries/public";
import { getPublishedTheme } from "@/server/queries/theme";

export const revalidate = 86400;

/** Generated initials favicon (used when no favicon is uploaded in SEO settings). */
export async function GET() {
  const [profile, theme] = await Promise.all([getProfile(), getPublishedTheme()]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: theme.vars["--gradient"], color: theme.vars["--on-primary"], fontSize: 28, fontWeight: 800 }}>
        {initials(profile.name)}
      </div>
    ),
    { width: 64, height: 64 },
  );
}
