export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Splits a heading so the last two words can get the gradient (Design §5). */
export function splitGradient(text: string): { lead: string; tail: string } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { lead: "", tail: words.join(" ") };
  return { lead: words.slice(0, -2).join(" "), tail: words.slice(-2).join(" ") };
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function youtubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
      if (m) return m[2] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function relativeTime(date: Date | string | number, now = Date.now()): string {
  const d = new Date(date).getTime();
  const s = Math.round((now - d) / 1000);
  if (s < 45) return "just now";
  const units: Array<[number, string]> = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2629800, "month"],
    [31557600, "year"],
  ];
  let unit = "minute";
  let value = Math.round(s / 60);
  for (let i = units.length - 1; i >= 0; i--) {
    const [secs, name] = units[i]!;
    if (s >= secs) {
      unit = name;
      value = Math.round(s / secs);
      break;
    }
  }
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function safeHttpUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}
