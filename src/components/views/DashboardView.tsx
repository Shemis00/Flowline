import type { ReactNode } from "react";
import type { Card, Column, Member } from "../../types";
import { unassignedCards } from "../../lib/board";
import { isOverdue, todayISO, formatFriendlyDate } from "../../lib/date";
import { Avatar } from "../ui/Avatar";
import { ViewShell } from "../ui/ViewShell";

interface Props {
  cards: Card[];
  columns: Column[];
  /** Members pre-sorted by join date. */
  members: Member[];
  onOpenCard: (cardId: string) => void;
}

type StatTone = "accent" | "danger" | "amber" | "teal" | "neutral";

const STAT_TONES: Record<StatTone, { box: string; value: string }> = {
  accent: { box: "border-accent/40 bg-accent/5", value: "text-accent" },
  danger: { box: "border-danger/50 bg-danger/5", value: "text-danger-text" },
  amber: { box: "border-amber/40 bg-amber/5", value: "text-amber" },
  teal: { box: "border-teal/40 bg-teal/5", value: "text-teal" },
  neutral: { box: "border-line bg-surface", value: "" },
};

function Stat({ value, label, tone = "neutral" }: { value: number; label: string; tone?: StatTone }) {
  const t = STAT_TONES[tone];
  return (
    <div className={`border rounded-xl p-4 flex flex-col gap-1 ${t.box}`}>
      <span className={`text-[26px] font-bold leading-none ${t.value}`}>{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">{label}</span>
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  dim = false,
}: {
  label: ReactNode;
  count: number;
  max: number;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-[92px] sm:w-[130px] shrink-0 text-[13px] truncate ${dim ? "text-dim" : ""}`}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            dim ? "bg-surface3" : "bg-gradient-to-r from-accent to-accent2"
          }`}
          style={{ width: `${(count / max) * 100}%` }}
        />
      </div>
      <span className="w-7 text-right text-[13px] font-semibold text-dim">{count}</span>
    </div>
  );
}

const PANEL = "bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5";
const PANEL_HEADING = "m-0 mb-1 text-xs font-semibold uppercase tracking-wider text-dim";

/** Board overview: headline stats, tasks per column, workload, upcoming deadlines. */
export function DashboardView({ cards, columns, members, onOpenCard }: Props) {
  const today = todayISO();
  const overdue = cards.filter((c) => c.dueDate && isOverdue(c.dueDate));
  const dueToday = cards.filter((c) => c.dueDate === today);

  const perColumn = columns.map((col) => ({
    column: col,
    count: cards.filter((c) => c.columnId === col.id).length,
  }));
  const maxColumnCount = Math.max(1, ...perColumn.map((p) => p.count));

  const workload = members.map((member) => ({
    member,
    count: cards.filter((c) => c.assigneeId === member.id).length,
  }));
  const unassignedCount = unassignedCards(cards, members).length;
  const maxWorkload = Math.max(1, ...workload.map((w) => w.count), unassignedCount);

  const upcoming = cards
    .filter((c) => c.dueDate && c.dueDate >= today)
    .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string))
    .slice(0, 6);

  return (
    <ViewShell>
      <div
        data-tour="dashboard-stats"
        className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3"
      >
        <Stat value={cards.length} label="Total tasks" tone="accent" />
        <Stat value={overdue.length} label="Overdue" tone={overdue.length > 0 ? "danger" : "neutral"} />
        <Stat value={dueToday.length} label="Due today" tone={dueToday.length > 0 ? "amber" : "neutral"} />
        <Stat value={members.length} label="Team members" tone="teal" />
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
        <section className={PANEL}>
          <h3 className={PANEL_HEADING}>Tasks per column</h3>
          {perColumn.map(({ column, count }) => (
            <BarRow key={column.id} label={column.title} count={count} max={maxColumnCount} />
          ))}
          {columns.length === 0 && <p className="m-0 text-xs text-dim">No columns yet.</p>}
        </section>

        <section className={PANEL}>
          <h3 className={PANEL_HEADING}>Workload</h3>
          {workload.map(({ member, count }) => (
            <BarRow
              key={member.id}
              label={
                <span className="flex items-center gap-2">
                  <Avatar member={member} size={20} />
                  <span className="truncate">{member.name}</span>
                </span>
              }
              count={count}
              max={maxWorkload}
            />
          ))}
          <BarRow label="Unassigned" count={unassignedCount} max={maxWorkload} dim />
        </section>

        <section className={`${PANEL} col-span-full max-md:col-span-1`}>
          <h3 className={PANEL_HEADING}>Upcoming deadlines</h3>
          {upcoming.length > 0 ? (
            <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
              {upcoming.map((card) => (
                <li key={card.id}>
                  <button
                    className="w-full flex items-center justify-between gap-3 text-[13.5px] text-ink bg-surface2 border border-line rounded-[10px] px-3 py-2 cursor-pointer hover:border-accent transition-colors"
                    onClick={() => onOpenCard(card.id)}
                  >
                    <span className="truncate">{card.title}</span>
                    <span
                      className={`text-[11px] font-semibold rounded-md px-2 py-0.5 whitespace-nowrap ${
                        card.dueDate === today
                          ? "text-danger-text bg-danger-soft"
                          : "text-dim bg-surface3"
                      }`}
                    >
                      {formatFriendlyDate(card.dueDate as string)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-xs text-dim">No upcoming due dates.</p>
          )}
        </section>
      </div>
    </ViewShell>
  );
}
