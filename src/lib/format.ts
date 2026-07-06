/** Date formatting for a reader, not a log file: "Today 14:45", "Yesterday 09:12", "Tue 1 Jul, 14:45". */

const TIME = new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
const DAY = new Intl.DateTimeFormat("en-ZA", { weekday: "short", day: "numeric", month: "short" });
const DAY_YEAR = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function startOfDay(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown time";

  const now = new Date();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (dayDiff === 0) return `Today ${TIME.format(d)}`;
  if (dayDiff === 1) return `Yesterday ${TIME.format(d)}`;
  if (d.getFullYear() === now.getFullYear()) return `${DAY.format(d)}, ${TIME.format(d)}`;
  return DAY_YEAR.format(d);
}
