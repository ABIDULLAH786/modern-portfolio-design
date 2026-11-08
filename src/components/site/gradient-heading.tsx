import { splitGradient } from "@/lib/utils/text";

/** Section heading where the last two words get the gradient (Design §5). */
export function GradientHeading({ text, as: Tag = "h2", className, id }: { text: string; as?: "h1" | "h2" | "h3"; className?: string; id?: string }) {
  const { lead, tail } = splitGradient(text);
  return (
    <Tag className={className} id={id}>
      {lead ? `${lead} ` : null}
      <span className="grad-text">{tail}</span>
    </Tag>
  );
}
