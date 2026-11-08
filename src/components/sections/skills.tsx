import { SectionHeader } from "@/components/site/section-header";
import type { SettingsDTO, SkillGroup } from "@/lib/types";

export function Skills({ groups, copy, showPercent }: { groups: SkillGroup[]; copy: SettingsDTO["copy"]["skills"]; showPercent: boolean }) {
  const visible = groups.filter((g) => g.skills.length);
  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeader id="skills-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <div className="skills-grid">
          {visible.map((g) => (
            <div className="card skill-cat reveal" key={g.id}>
              <h3>
                <i aria-hidden="true" />
                {g.name}
              </h3>
              {showPercent ? (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {g.skills.map((s) => {
                    const level = Math.max(0, Math.min(100, s.level));
                    return (
                      <li className="skill" key={s.id}>
                        <div className="skill-top">
                          {s.name}
                          <span>{level}%</span>
                        </div>
                        <div className="bar" role="meter" aria-label={s.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={level}>
                          <i style={{ "--w": `${level}%` } as React.CSSProperties} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="skill-chips" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {g.skills.map((s) => (
                    <li className="skill-chip" key={s.id}>
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
