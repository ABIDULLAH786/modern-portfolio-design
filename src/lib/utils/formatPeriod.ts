const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface PeriodInput {
  start?: { month?: number | null; year?: number | null } | null;
  end?: { month?: number | null; year?: number | null } | null;
  current?: boolean;
  periodOverride?: string | null;
}

function part(d?: { month?: number | null; year?: number | null } | null): string {
  if (!d?.year) return "";
  const m = d.month && d.month >= 1 && d.month <= 12 ? `${MONTHS[d.month - 1]} ` : "";
  return `${m}${d.year}`;
}

export function formatPeriod(p: PeriodInput): string {
  if (p.periodOverride && p.periodOverride.trim()) return p.periodOverride.trim();
  const start = part(p.start);
  const end = p.current ? "Present" : part(p.end);
  if (start && end) return start === end ? start : `${start} – ${end}`;
  return start || end || "";
}

/** Sort key used for "newest first" ordering. */
export function periodSortKey(p: PeriodInput): number {
  const d = p.current ? { year: 9999, month: 12 } : (p.end ?? p.start);
  return (d?.year ?? 0) * 100 + (d?.month ?? 0);
}

export { MONTHS };
