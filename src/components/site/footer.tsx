import type { ProfileDTO } from "@/lib/types";
import { safeHttpUrl } from "@/lib/utils/text";

export function Footer({ profile }: { profile: ProfileDTO }) {
  return (
    <footer className="site-footer">
      <div className="container foot">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.role}
        </p>
        {profile.socials.length ? (
          <ul className="foot-links" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {profile.socials.map((s) => {
              const href = safeHttpUrl(s.url);
              return href ? (
                <li key={s.id}>
                  <a href={href} target="_blank" rel="noopener noreferrer me">
                    {s.label}
                  </a>
                </li>
              ) : null;
            })}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}
