import { Quote } from "lucide-react";
import Image from "next/image";
import { SectionHeader } from "@/components/site/section-header";
import type { SettingsDTO, TestimonialDTO } from "@/lib/types";
import { initials, safeHttpUrl } from "@/lib/utils/text";

export function Testimonials({ items, copy }: { items: TestimonialDTO[]; copy: SettingsDTO["copy"]["testimonials"] }) {
  return (
    <section className="section" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <SectionHeader id="testimonials-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <ul className="quote-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((t) => {
            const url = safeHttpUrl(t.url);
            const sub = [t.role, t.company].filter(Boolean).join(", ");
            return (
              <li className="card quote-card reveal" key={t.id}>
                <Quote className="grad-text" style={{ color: "var(--primary)" }} aria-hidden="true" />
                <blockquote>{t.quote}</blockquote>
                <div className="who">
                  {t.avatar ? (
                    <Image src={t.avatar.url} alt={t.avatar.alt || t.name} width={44} height={44} />
                  ) : (
                    <span className="avatar-fallback" aria-hidden="true">
                      {initials(t.name)}
                    </span>
                  )}
                  <div>
                    <b>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {t.name}
                        </a>
                      ) : (
                        t.name
                      )}
                    </b>
                    {sub ? <small>{sub}</small> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
