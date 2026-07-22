import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card, Member } from "../../types";
import { Avatar } from "../ui/Avatar";
import { DueChip } from "../ui/Chips";
import { formatShortDate } from "../../lib/date";

// touch-manipulation (not touch-none) so swiping on a card still scrolls the
// column on phones; the TouchSensor's long-press delay handles drag activation.
const CARD_BASE =
  "relative bg-surface2 border rounded-[10px] px-3 py-2.5 shadow-card touch-manipulation select-none";

function CardContent({ card, assignee }: { card: Card; assignee?: Member }) {
  const hasFooter = Boolean(card.dueDate || assignee);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-sm leading-[1.45] break-words whitespace-pre-wrap pr-4">
        {card.title}
      </div>
      {card.description && (
        <div className="text-xs leading-[1.45] text-dim break-words line-clamp-2">
          {card.description}
        </div>
      )}
      {hasFooter && (
        <div className="flex items-center gap-2 mt-0.5">
          {card.dueDate && <DueChip date={card.dueDate} label={formatShortDate(card.dueDate)} />}
          <span className="flex-1" />
          {assignee && <Avatar member={assignee} size={22} />}
        </div>
      )}
    </div>
  );
}

interface Props {
  card: Card;
  assignee?: Member;
  onOpen: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, assignee, onOpen, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    // The card being dragged is rendered in the DragOverlay; in the list we
    // leave a ghost placeholder that doubles as the drop indicator.
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${CARD_BASE} border-dashed border-accent bg-accent-soft shadow-none [&>*]:invisible`}
      >
        <CardContent card={card} assignee={assignee} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-tour="card"
      className={`${CARD_BASE} group border-line cursor-grab hover:border-[#3a4152] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2`}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card.id)}
    >
      <CardContent card={card} assignee={assignee} />
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 pointer-coarse:opacity-60 bg-transparent border-none text-dim hover:text-danger-text text-base leading-none cursor-pointer transition-opacity"
        aria-label={`Delete card ${card.title}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
      >
        &times;
      </button>
    </div>
  );
}

/** Static clone rendered inside the DragOverlay while dragging. */
export function CardGhost({ card, assignee }: { card: Card; assignee?: Member }) {
  return (
    <div className={`${CARD_BASE} border-accent cursor-grabbing shadow-lift rotate-2`}>
      <CardContent card={card} assignee={assignee} />
    </div>
  );
}
