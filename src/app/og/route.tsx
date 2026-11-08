import { ImageResponse } from "next/og";
import { initials } from "@/lib/utils/text";
import { getGameBySlug, getProfile } from "@/server/queries/public";
import { getPublishedTheme } from "@/server/queries/theme";

/** Dynamic social share image: name + role (or a game title) on the theme gradient. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const [profile, theme] = await Promise.all([getProfile(), getPublishedTheme()]);
  const v = theme.vars;
  let title = profile.name;
  let subtitle = profile.role;
  if (slug && /^[a-z0-9-]{1,80}$/.test(slug)) {
    const g = await getGameBySlug(slug);
    if (g.kind === "game") {
      title = g.game.title;
      subtitle = `${g.game.genre ? `${g.game.genre} game · ` : ""}by ${profile.name}`;
    }
  }
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: v["--bg"], color: v["--text"] }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 22, background: v["--gradient"], color: v["--on-primary"], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800 }}>
            {initials(profile.name)}
          </div>
          <div style={{ fontSize: 30, color: v["--muted"] }}>{profile.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, backgroundImage: v["--gradient"], backgroundClip: "text", color: "transparent" }}>{title}</div>
          <div style={{ fontSize: 40, marginTop: 18, color: v["--muted"] }}>{subtitle}</div>
        </div>
        <div style={{ height: 10, borderRadius: 10, background: v["--gradient"] }} />
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
