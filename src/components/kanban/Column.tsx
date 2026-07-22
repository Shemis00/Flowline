import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column as ColumnType, Member } from "../../types";
import { CardItem } from "./CardItem";
import { Composer } from "../ui/Composer";

interface Props {
  column: ColumnType;
  cards: Card[];
  membersById: Map<string, Member>;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenCard: (cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function Column({
  column,
  cards,
  membersById,
  onAddCard,
  onDeleteCard,
  onOpenCard,
  onDeleteColumn,
}: Props) {
  // Registering the column itself as a droppable lets cards be dropped into
  // an empty column (where there are no sortable items to collide with).
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  return (
    <section
      data-tour="column"
      className={`group/col flex flex-col w-[272px] sm:w-[292px] shrink-0 max-h-full bg-surface border rounded-xl transition-[border-color,box-shadow] duration-150 ${
        isOver
          ? "border-accent shadow-[0_0_0_1px_var(--color-accent),0_0_18px_rgb(91_141_239/0.25)]"
          : "border-line"
      }`}
      aria-label={column.title}
    >
      <header className="flex items-center gap-2 px-3.5 pt-3 pb-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-dim m-0">
          {column.title}
        </h2>
        <span className="ml-auto text-[11px] font-semibold text-dim bg-surface2 rounded-full px-2 py-0.5">
          {cards.length}
        </span>
        <button
          className="bg-transparent border-none text-base leading-none p-0 pl-1 text-dim transition-opacity opacity-0 enabled:group-hover/col:opacity-100 enabled:cursor-pointer enabled:hover:text-danger-text disabled:cursor-not-allowed disabled:group-hover/col:opacity-35"
          disabled={cards.length > 0}
          aria-label={`Delete column ${column.title}`}
          title={
            cards.length > 0
              ? "Move or delete its tasks first — only empty columns can be deleted"
              : "Delete this column"
          }
          onClick={() => onDeleteColumn(column.id)}
        >
          &times;
        </button>
      </header>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex-1 min-h-[60px] overflow-y-auto px-2.5 py-1 flex flex-col gap-2"
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              assignee={card.assigneeId ? membersById.get(card.assigneeId) : undefined}
              onOpen={onOpenCard}
              onDelete={onDeleteCard}
            />
          ))}
          {cards.length === 0 && (
            <div className="border border-dashed border-line rounded-[10px] text-dim text-xs text-center py-[18px]">
              Drop cards here
            </div>
          )}
        </div>
      </SortableContext>
      <div className="px-2.5 pt-2 pb-2.5">
        <Composer
          triggerLabel="+ Add a card"
          triggerClassName="w-full text-left text-[13px] text-dim bg-transparent border-none rounded-lg px-2.5 py-2 cursor-pointer hover:bg-surface2 hover:text-ink transition-colors"
          containerClassName="flex flex-col gap-2"
          placeholder="Enter a title…"
          submitLabel="Add card"
          maxLength={500}
          multiline
          keepOpenOnSubmit
          onSubmit={(title) => onAddCard(column.id, title)}
        />
      </div>
    </section>
  );
}
