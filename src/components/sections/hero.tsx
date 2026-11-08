import { Box, Download, Gamepad2, Send, Smartphone } from "lucide-react";
import Image from "next/image";
import type { ProfileDTO } from "@/lib/types";
import { initials, safeHttpUrl } from "@/lib/utils/text";

export function cvDownloadUrl(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}ik-attachment=true`;
}

export function Hero({ profile, gameCount, gamesVisible, contactVisible, engineFallback }: { profile: ProfileDTO; gameCount: number; gamesVisible: boolean; contactVisible: boolean; engineFallback: string }) {
  const [first = "", ...rest] = profile.name.trim().split(/\s+/);
  const engine = profile.primaryEngine || engineFallback;
  return (
    <section className="section hero" id="home" aria-labelledby="hero-title">
      <div className="glow glow-primary" style={{ width: 500, height: 500, top: -120, left: -160 }} aria-hidden="true" />
      <div className="glow glow-accent" style={{ width: 400, height: 400, bottom: -80, right: -120, opacity: 0.2 }} aria-hidden="true" />
      <div className="container hero-grid">
        <div className="rise">
          <span className="pill">
            <span className={`dot${profile.available ? "" : " off"}`} aria-hidden="true" />
            {profile.available ? profile.heroBadge : profile.busyBadge}
          </span>
          <h1 id="hero-title">
            Hi, I&apos;m {first}
            {rest.length ? (
              <>
                <br />
                <span className="grad-text">{rest.join(" ")}</span>
              </>
            ) : null}
          </h1>
          <p className="role">{profile.role}</p>
          <p className="tagline">{profile.tagline}</p>
          <div className="hero-ctas">
            {gamesVisible ? (
              <a className="btn btn-primary" href="#games">
                <Gamepad2 aria-hidden="true" /> View my games
              </a>
            ) : null}
            {contactVisible ? (
              <a className="btn btn-ghost" href="#contact">
                <Send aria-hidden="true" /> Hire me
              </a>
            ) : null}
            {profile.cv ? (
              <a className="btn btn-ghost" href={cvDownloadUrl(profile.cv.url)} download={profile.cv.fileName} rel="noopener">
                <Download aria-hidden="true" /> Download CV
              </a>
            ) : null}
          </div>
          {profile.socials.length ? (
            <div className="socials">
              {profile.socials.map((s) => {
                const href = safeHttpUrl(s.url);
                return href ? (
                  <a key={s.id} href={href} target="_blank" rel="noopener noreferrer me">
                    {s.label} <span aria-hidden="true">↗</span>
                  </a>
                ) : null;
              })}
            </div>
          ) : null}
        </div>
        <div className="hero-visual rise" style={{ animationDelay: "120ms" }}>
          <div className="avatar-frame">
            <div className="avatar-inner">
              {profile.avatar ? (
                <Image
                  src={profile.avatar.url}
                  alt={profile.avatar.alt || profile.name}
                  fill
                  priority
                  sizes="(max-width: 900px) 340px, 440px"
                  {...(profile.avatar.blurDataUrl ? { placeholder: "blur" as const, blurDataURL: profile.avatar.blurDataUrl } : {})}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span className="initials grad-text" aria-hidden="true">
                  {initials(profile.name)}
                </span>
              )}
            </div>
          </div>
          <div className="float-chip chip-1">
            <span className="ico" aria-hidden="true">
              <Gamepad2 />
            </span>
            <div>
              {gameCount} Games<small>Published</small>
            </div>
          </div>
          {engine ? (
            <div className="float-chip chip-2">
              <span className="ico" aria-hidden="true">
                <Box />
              </span>
              <div>
                {engine}
                <small>Main engine</small>
              </div>
            </div>
          ) : null}
          {profile.heroChip3.title ? (
            <div className="float-chip chip-3">
              <span className="ico" aria-hidden="true">
                <Smartphone />
              </span>
              <div>
                {profile.heroChip3.title}
                <small>{profile.heroChip3.subtitle}</small>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span />
        Scroll
      </div>
    </section>
  );
}
