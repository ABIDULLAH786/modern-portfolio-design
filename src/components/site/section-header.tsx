import { GradientHeading } from "./gradient-heading";

export function SectionHeader({ eyebrow, title, subtitle, id }: { eyebrow: string; title: string; subtitle?: string; id: string }) {
  return (
    <div className="sec-head reveal">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <GradientHeading text={title} id={id} />
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
