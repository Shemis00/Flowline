import { isOverdue } from "../../lib/date";

/** Due-date pill; highlighted when the date is in the past. */
export function DueChip({ date, label }: { date: string; label?: string }) {
  const overdue = isOverdue(date);
  return (
    <span
      title={`Due ${date}`}
      className={`text-[11px] font-semibold rounded-md px-2 py-0.5 whitespace-nowrap ${
        overdue ? "text-danger-text bg-danger-soft" : "text-dim bg-surface3"
      }`}
    >
      {label ?? date}
    </span>
  );
}

/** Column-name pill used in the non-Kanban views. */
export function StatusChip({ children }: { children: string }) {
  return (
    <span className="text-[11px] font-semibold text-accent bg-accent-soft rounded-md px-2 py-0.5 whitespace-nowrap">
      {children}
    </span>
  );
}
