import type { Card, Column, Member } from "../../types";
import { byId, unassignedCards } from "../../lib/board";
import { Avatar } from "../ui/Avatar";
import { DueChip, StatusChip } from "../ui/Chips";
import { EmptyState } from "../ui/EmptyState";
import { ViewShell } from "../ui/ViewShell";

interface Props {
  /** Cards pre-sorted in board order; members pre-sorted by join date. */
  cards: Card[];
  columns: Column[];
  members: Member[];
  onOpenCard: (cardId: string) => void;
}

function AssigneeCard({
  card,
  columnTitle,
  onOpen,
}: {
  card: Card;
  columnTitle: string;
  onOpen: (cardId: string) => void;
}) {
  return (
    <button
      className="text-left font-sans text-ink bg-surface2 border border-line rounded-[10px] px-3 py-2.5 shadow-card cursor-pointer hover:border-accent transition-colors"
      onClick={() => onOpen(card.id)}
    >
      <div className="flex flex-col gap-1.5">
        <div className="text-sm leading-[1.45] break-words">{card.title}</div>
        <div className="flex items-center gap-2">
          <StatusChip>{columnTitle}</StatusChip>
          {card.dueDate && <DueChip date={card.dueDate} />}
        </div>
      </div>
    </button>
  );
}

/** Tasks grouped per team member, with an Unassigned bucket at the end. */
export function AssigneeView({ cards, columns, members, onOpenCard }: Props) {
  const columnsById = byId(columns);

  const groups: { key: string; member?: Member; cards: Card[] }[] = members.map((member) => ({
    key: member.id,
    member,
    cards: cards.filter((c) => c.assigneeId === member.id),
  }));
  groups.push({ key: "unassigned", cards: unassignedCards(cards, members) });

  if (cards.length === 0 && members.length === 0) {
    return (
      <EmptyState>
        No tasks or members yet — add members from the header and tasks from the Kanban view.
      </EmptyState>
    );
  }

  return (
    <ViewShell dataTour="view-assignee">
      {groups.map(({ key, member, cards: groupCards }) => (
        <section key={key} className="bg-surface border border-line rounded-xl px-4 py-3.5">
          <header className="flex items-center gap-2.5 mb-3">
            {member ? (
              <>
                <Avatar member={member} size={28} />
                <span className="text-sm font-semibold">{member.name}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-dim">Unassigned</span>
            )}
            <span className="text-[11px] font-semibold text-dim bg-surface2 rounded-full px-2 py-0.5">
              {groupCards.length}
            </span>
          </header>
          {groupCards.length > 0 ? (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {groupCards.map((card) => (
                <AssigneeCard
                  key={card.id}
                  card={card}
                  columnTitle={columnsById.get(card.columnId)?.title ?? "—"}
                  onOpen={onOpenCard}
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-dim border border-dashed border-line rounded-[10px] p-3 text-center">
              No tasks assigned
            </div>
          )}
        </section>
      ))}
    </ViewShell>
  );
}
