import { useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  // useSortable registers the column as both draggable (reorder) and droppable
  // (so cards can land in an empty column). Drag listeners live only on the
  // header so interacting with cards doesn't start a column drag.
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  const { active } = useDndContext();
  const showCardOver = isOver && active?.data.current?.type === "card";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      data-tour="column"
      className={`group/col flex flex-col w-[272px] sm:w-[292px] shrink-0 max-h-full bg-surface border rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ${
        isDragging ? "opacity-40" : ""
      } ${
        showCardOver
          ? "border-accent shadow-[0_0_0_1px_var(--color-accent),0_0_18px_rgb(91_141_239/0.25)]"
          : "border-line"
      }`}
      aria-label={column.title}
    >
      <header
        ref={setActivatorNodeRef}
        className="flex items-center gap-2 px-3.5 pt-3 pb-2 cursor-grab touch-manipulation select-none active:cursor-grabbing"
        title="Drag to reorder column"
        {...attributes}
        {...listeners}
      >
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
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDeleteColumn(column.id)}
        >
          &times;
        </button>
      </header>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 min-h-[60px] overflow-y-auto px-2.5 py-1 flex flex-col gap-2">
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

/** Floating preview shown while a column is dragged. */
export function ColumnGhost({ column, cardCount }: { column: ColumnType; cardCount: number }) {
  return (
    <section className="flex flex-col w-[272px] sm:w-[292px] bg-surface border border-accent rounded-xl shadow-lift opacity-95 rotate-[1.5deg]">
      <header className="flex items-center gap-2 px-3.5 pt-3 pb-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-dim m-0">
          {column.title}
        </h2>
        <span className="ml-auto text-[11px] font-semibold text-dim bg-surface2 rounded-full px-2 py-0.5">
          {cardCount}
        </span>
      </header>
      <div className="px-2.5 py-3 text-xs text-dim">Moving column…</div>
    </section>
  );
}
