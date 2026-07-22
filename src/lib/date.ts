/** Today's date as a local-time ISO string (YYYY-MM-DD). */
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** True when the due date (YYYY-MM-DD) is before today, local time. */
export function isOverdue(dueDate: string): boolean {
  return dueDate < todayISO();
}

function parseISO(iso: string): Date | null {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Jul 22" — compact form for card chips. */
export function formatShortDate(iso: string): string {
  const date = parseISO(iso);
  return date
    ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : iso;
}

/** "Wed, Jul 22" — friendlier form for the dashboard deadline list. */
export function formatFriendlyDate(iso: string): string {
  const date = parseISO(iso);
  return date
    ? date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    : iso;
}
