import type { Card, Column, Member } from "../../types";
import { byId } from "../../lib/board";
import { Avatar } from "../ui/Avatar";
import { DueChip, StatusChip } from "../ui/Chips";
import { EmptyState } from "../ui/EmptyState";

interface Props {
  /** Cards pre-sorted in board order (column position, then order). */
  cards: Card[];
  columns: Column[];
  membersById: Map<string, Member>;
  onOpenCard: (cardId: string) => void;
}

const TH = "text-left text-[11px] font-semibold uppercase tracking-wider text-dim px-4 py-3";
const TD = "px-4 py-3 align-top text-sm";

/** Flat list of every task: a table on wide screens, stacked cards on phones. */
export function ListView({ cards, columns, membersById, onOpenCard }: Props) {
  const columnsById = byId(columns);

  if (cards.length === 0) {
    return <EmptyState>No tasks yet — add one from the Kanban view.</EmptyState>;
  }

  return (
    <div className="h-full overflow-auto p-3 sm:p-5" data-tour="view-list">
      {/* Stacked cards on phones */}
      <div className="md:hidden flex flex-col gap-2.5">
        {cards.map((card) => {
          const assignee = card.assigneeId ? membersById.get(card.assigneeId) : undefined;
          return (
            <button
              key={card.id}
              className="text-left font-sans text-ink bg-surface border border-line rounded-xl px-3.5 py-3 cursor-pointer hover:border-accent transition-colors flex flex-col gap-2"
              onClick={() => onOpenCard(card.id)}
            >
              <div className="text-sm break-words">{card.title}</div>
              {card.description && (
                <div className="text-xs text-dim line-clamp-1 break-words">{card.description}</div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusChip>{columnsById.get(card.columnId)?.title ?? "—"}</StatusChip>
                {card.dueDate && <DueChip date={card.dueDate} />}
                <span className="flex-1" />
                {assignee && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-dim">
                    <Avatar member={assignee} size={20} />
                    {assignee.name}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Full table on tablets and up */}
      <div className="hidden md:block max-w-[980px] xl:max-w-[1200px] mx-auto bg-surface border border-line rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={TH}>Task</th>
              <th className={TH}>Status</th>
              <th className={TH}>Due date</th>
              <th className={TH}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => {
              const assignee = card.assigneeId ? membersById.get(card.assigneeId) : undefined;
              return (
                <tr
                  key={card.id}
                  className="border-b border-line last:border-b-0 cursor-pointer hover:bg-surface2 transition-colors"
                  onClick={() => onOpenCard(card.id)}
                >
                  <td className={TD}>
                    <div className="break-words">{card.title}</div>
                    {card.description && (
                      <div className="text-xs text-dim mt-0.5 line-clamp-1 break-words">
                        {card.description}
                      </div>
                    )}
                  </td>
                  <td className={TD}>
                    <StatusChip>{columnsById.get(card.columnId)?.title ?? "—"}</StatusChip>
                  </td>
                  <td className={TD}>
                    {card.dueDate ? (
                      <DueChip date={card.dueDate} />
                    ) : (
                      <span className="text-dim text-[13px]">—</span>
                    )}
                  </td>
                  <td className={TD}>
                    {assignee ? (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <Avatar member={assignee} size={22} />
                        {assignee.name}
                      </span>
                    ) : (
                      <span className="text-dim text-[13px]">Unassigned</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
