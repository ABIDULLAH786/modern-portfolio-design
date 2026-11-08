import { ServiceIconView } from "@/components/site/icon";
import { SectionHeader } from "@/components/site/section-header";
import type { ServiceDTO, SettingsDTO } from "@/lib/types";

export function Services({ items, copy }: { items: ServiceDTO[]; copy: SettingsDTO["copy"]["services"] }) {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <SectionHeader id="services-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <ul className="svc-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items.map((s) => (
            <li className="card svc reveal" key={s.id}>
              <div className="svc-ico">
                <ServiceIconView name={s.icon} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
