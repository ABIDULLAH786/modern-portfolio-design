import { Home } from "lucide-react";
import Link from "next/link";
import { SiteChrome } from "@/components/site/site-chrome";
import { getProfile, getSettings } from "@/server/queries/public";
import { getPublishedTheme } from "@/server/queries/theme";

export default async function NotFound() {
  const [theme, settings, profile] = await Promise.all([getPublishedTheme(), getSettings(), getProfile()]);
  return (
    <SiteChrome theme={theme} settings={settings} profile={profile}>
      <section className="center-page">
        <div className="glow glow-primary" style={{ width: 420, height: 420, top: "10%", left: "20%" }} aria-hidden="true" />
        <div style={{ position: "relative" }}>
          <p className="big-code grad-text">404</p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", margin: "10px 0 12px" }}>Game over: page not found</h1>
          <p style={{ color: "var(--muted)", marginBottom: 28 }}>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <Link href="/" className="btn btn-primary">
            <Home aria-hidden="true" /> Back home
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
