import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

/** Renders admin-authored markdown safely (no raw HTML, sanitised output). */
/** `headingLevel` is the level used for markdown headings (keeps the page outline valid). */
export function Markdown({ children, className = "prose-md", headingLevel = 3 }: { children: string; className?: string; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children: c }) => {
            const external = typeof href === "string" && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {c}
              </a>
            );
          },
          h1: ({ children: c }) => <H>{c}</H>,
          h2: ({ children: c }) => <H>{c}</H>,
          h3: ({ children: c }) => (H === "h2" ? <h3>{c}</h3> : <h4>{c}</h4>),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
