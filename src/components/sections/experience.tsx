import { Markdown } from "@/components/site/markdown";
import { SectionHeader } from "@/components/site/section-header";
import { EXPERIENCE_LABELS } from "@/lib/constants";
import type { ExperienceDTO, SettingsDTO } from "@/lib/types";
import { formatPeriod, periodSortKey } from "@/lib/utils/formatPeriod";
import { safeHttpUrl } from "@/lib/utils/text";

export function Experience({ items, copy, sort }: { items: ExperienceDTO[]; copy: SettingsDTO["copy"]["experience"]; sort: "manual" | "newest" }) {
  const list = sort === "newest" ? [...items].sort((a, b) => periodSortKey(b) - periodSortKey(a)) : items;
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeader id="experience-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <ol className="timeline">
          {list.map((e) => {
            const url = safeHttpUrl(e.url);
            const period = formatPeriod(e);
            return (
              <li className="tl-item reveal" key={e.id}>
                <div className="card tl-card">
                  <div className="tl-top">
                    {period ? <span className="period">{period}</span> : null}
                    <span className="type-badge">{EXPERIENCE_LABELS[e.type] ?? e.type}</span>
                  </div>
                  <h3>{e.role}</h3>
                  <div className="co">
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {e.organization}
                      </a>
                    ) : (
                      e.organization
                    )}
                    {e.location ? ` · ${e.location}` : ""}
                  </div>
                  {e.description ? <Markdown>{e.description}</Markdown> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
