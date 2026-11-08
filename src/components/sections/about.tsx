import { Markdown } from "@/components/site/markdown";
import { SectionHeader } from "@/components/site/section-header";
import type { ProfileDTO, SettingsDTO } from "@/lib/types";
import { safeHttpUrl } from "@/lib/utils/text";

export function About({ profile, copy, contactVisible }: { profile: ProfileDTO; copy: SettingsDTO["copy"]["about"]; contactVisible: boolean }) {
  const ext = safeHttpUrl(profile.aboutExternal.url);
  const meta = [
    ["Location", profile.location],
    ["Status", profile.availabilityText],
    ["Focus", profile.role],
    ["Email", profile.email],
    ...(profile.languages.length ? [["Languages", profile.languages.join(" · ")]] : []),
  ].filter(([, v]) => v);
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeader id="about-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <div className={`about-grid${profile.stats.length ? "" : " solo"}`}>
          <div className="card about-text reveal">
            <Markdown>{profile.bio}</Markdown>
            {meta.length ? (
              <dl className="about-meta" style={{ margin: "30px 0 0" }}>
                {meta.map(([k, v]) => (
                  <div className="meta" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="btn-row">
              {contactVisible ? (
                <a className="btn btn-primary btn-sm" href="#contact">
                  Get in touch
                </a>
              ) : null}
              {ext && profile.aboutExternal.label ? (
                <a className="btn btn-ghost btn-sm" href={ext} target="_blank" rel="noopener noreferrer">
                  {profile.aboutExternal.label} <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>
          {profile.stats.length ? (
            <ul className="stats" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {profile.stats.map((s) => (
                <li className="card stat reveal" key={s.id}>
                  <b className="grad-text">{s.value}</b>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
