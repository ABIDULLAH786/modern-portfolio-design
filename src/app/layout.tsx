import type { Metadata, Viewport } from "next";
import { fontVariableClasses } from "@/lib/theme/fonts";
import { themeStyleSheet } from "@/lib/theme/resolve";
import { getProfile, getSettings } from "@/server/queries/public";
import { getPublishedTheme } from "@/server/queries/theme";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  const { seo } = settings;
  const title = seo.siteTitle || `${profile.name} — ${profile.role}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${profile.name}` },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: profile.name }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: profile.name,
      title,
      description: seo.description,
      url: "/",
      images: seo.ogImage ? [{ url: seo.ogImage.url, width: 1200, height: 630, alt: seo.ogImage.alt || title }] : [{ url: "/og", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: seo.description },
    icons: { icon: seo.favicon ? seo.favicon.url : "/favicon" },
    ...(seo.googleVerification ? { verification: { google: seo.googleVerification } } : {}),
  };
}

export async function generateViewport(): Promise<Viewport> {
  const theme = await getPublishedTheme();
  return { themeColor: theme.vars["--bg"], colorScheme: theme.mode };
}

/** Adds `.js` (enables reveal animations) and applies the visitor's saved light/dark choice before paint. */
const PREPAINT = `(function(){var d=document.documentElement;d.classList.add('js');try{var m=localStorage.getItem('visitorMode');if(m&&d.hasAttribute('data-toggle'))d.setAttribute('data-visitor-mode',m)}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getPublishedTheme();
  return (
    <html
      lang="en"
      className={fontVariableClasses}
      data-mode={theme.mode}
      data-scroll-behavior="smooth"
      {...(theme.toggle ? { "data-toggle": "" } : {})}
      suppressHydrationWarning
    >
      <head>
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeStyleSheet(theme) }} />
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
