import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { BoardState, Card, Column as ColumnType, Member } from "../../types";
import type { BoardStore } from "../../store";
import { byOrder } from "../../lib/board";
import { orderBetween, needsRebalance, rebalancedOrders, ORDER_GAP } from "../../lib/order";
import { Column, ColumnGhost } from "./Column";
import { CardGhost } from "./CardItem";
import { Composer } from "../ui/Composer";

type Lists = Record<string, string[]>;

/** Prefer whatever is directly under the pointer; fall back to rectangle overlap.
 *  Column drags only collide with other columns so cards don't steal the drop. */
const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const collisions = pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);

  if (args.active.data.current?.type === "column") {
    return collisions.filter((collision) => {
      const container = args.droppableContainers.find((c) => c.id === collision.id);
      return container?.data.current?.type === "column";
    });
  }
  return collisions;
};

const findColumnOf = (cardId: string, lists: Lists): string | undefined =>
  Object.keys(lists).find((colId) => lists[colId].includes(cardId));

interface Props {
  store: BoardStore;
  /** Columns pre-sorted by order. */
  columns: ColumnType[];
  cards: Card[];
  cardsById: Map<string, Card>;
  membersById: Map<string, Member>;
  beginDrag: () => void;
  endDrag: (mutate?: (base: BoardState) => BoardState) => void;
  onOpenCard: (cardId: string) => void;
}

/** The drag & drop board: owns all DnD interaction and order persistence. */
export function KanbanView({
  store,
  columns,
  cards,
  cardsById,
  membersById,
  beginDrag,
  endDrag,
  onOpenCard,
}: Props) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  // While dragging, column contents render from this id-list preview so
  // cross-column moves animate without touching persisted order keys.
  // A ref mirrors the state because dnd-kit fires drag events faster than
  // React commits, and drop handling must see the latest preview.
  const [preview, setPreview] = useState<Lists | null>(null);
  const previewRef = useRef<Lists | null>(null);
  // Same pattern for horizontal column order while a column is dragged.
  const [columnOrder, setColumnOrder] = useState<string[] | null>(null);
  const columnOrderRef = useRef<string[] | null>(null);
  // A click event fires on the card right after a drop; this suppresses it
  // so finishing a drag doesn't accidentally open the card editor.
  const lastDragEndRef = useRef(0);

  const updatePreview = (value: Lists | null) => {
    previewRef.current = value;
    setPreview(value);
  };

  const updateColumnOrder = (value: string[] | null) => {
    columnOrderRef.current = value;
    setColumnOrder(value);
  };

  const listsFromState = useMemo(() => {
    const lists: Lists = {};
    for (const col of columns) lists[col.id] = [];
    for (const card of [...cards].sort(byOrder)) {
      lists[card.columnId]?.push(card.id);
    }
    return lists;
  }, [columns, cards]);

  const lists = preview ?? listsFromState;

  const columnsById = useMemo(() => {
    const map = new Map<string, ColumnType>();
    for (const col of columns) map.set(col.id, col);
    return map;
  }, [columns]);

  const orderedColumns = useMemo(() => {
    if (!columnOrder) return columns;
    return columnOrder
      .map((id) => columnsById.get(id))
      .filter((c): c is ColumnType => c !== undefined);
  }, [columnOrder, columns, columnsById]);

  const sensors = useSensors(
    // Small activation distance so plain clicks (open editor, delete) don't start a drag.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // On touch screens, long-press lifts a card; a plain swipe scrolls the column.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.data.current?.type === "column") {
      const column = columnsById.get(String(active.id));
      if (!column) return;
      setActiveColumn(column);
      updateColumnOrder(columns.map((c) => c.id));
      beginDrag();
      return;
    }

    const card = cardsById.get(String(active.id));
    if (!card) return;
    setActiveCard(card);
    updatePreview(structuredClone(listsFromState));
    beginDrag();
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    if (active.data.current?.type === "column") {
      if (over.data.current?.type !== "column") return;
      const current = columnOrderRef.current;
      if (!current) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;
      const oldIndex = current.indexOf(activeId);
      const newIndex = current.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;
      updateColumnOrder(arrayMove(current, oldIndex, newIndex));
      return;
    }

    const current = previewRef.current;
    if (!current) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeColumnId = findColumnOf(activeId, current);
    const overColumnId =
      over.data.current?.type === "column" ? overId : findColumnOf(overId, current);
    // Within-column hover animation is handled by the sortable context; only
    // cross-column moves need the preview lists updated.
    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) return;

    const next: Lists = {
      ...current,
      [activeColumnId]: current[activeColumnId].filter((id) => id !== activeId),
      [overColumnId]: [...current[overColumnId]],
    };

    let insertIndex = next[overColumnId].length;
    const overIndex = next[overColumnId].indexOf(overId);
    if (overIndex !== -1) {
      const activeRect = active.rect.current.translated;
      const isBelow = activeRect ? activeRect.top > over.rect.top + over.rect.height / 2 : false;
      insertIndex = overIndex + (isBelow ? 1 : 0);
    }
    next[overColumnId].splice(insertIndex, 0, activeId);
    updatePreview(next);
  };

  const finishColumnDrag = (activeId: string) => {
    const order = columnOrderRef.current;
    setActiveColumn(null);
    updateColumnOrder(null);
    lastDragEndRef.current = Date.now();

    if (!order) {
      endDrag();
      return;
    }

    const index = order.indexOf(activeId);
    if (index === -1) {
      endDrag();
      return;
    }

    const before = index > 0 ? columnsById.get(order[index - 1]) : undefined;
    const after = index < order.length - 1 ? columnsById.get(order[index + 1]) : undefined;
    let newOrder = orderBetween(before?.order, after?.order);

    if (needsRebalance(newOrder, before?.order, after?.order)) {
      const orders = rebalancedOrders(order.length);
      newOrder = orders[index];
      const entries = order.map((columnId, i) => ({ columnId, order: orders[i] }));
      void store.moveColumn(activeId, newOrder).then(() => store.rebalanceColumns(entries));
      endDrag((base) => ({
        ...base,
        columns: base.columns.map((c) => {
          const entry = entries.find((e) => e.columnId === c.id);
          return entry ? { ...c, order: entry.order } : c;
        }),
      }));
      return;
    }

    void store.moveColumn(activeId, newOrder);
    endDrag((base) => ({
      ...base,
      columns: base.columns.map((c) => (c.id === activeId ? { ...c, order: newOrder } : c)),
    }));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.data.current?.type === "column") {
      finishColumnDrag(String(active.id));
      return;
    }

    const activeId = String(active.id);
    const snapshot = previewRef.current;
    setActiveCard(null);
    updatePreview(null);
    lastDragEndRef.current = Date.now();

    // Dropped outside any droppable: discard the preview and revert.
    if (!over || !snapshot) {
      endDrag();
      return;
    }

    const overId = String(over.id);
    const targetColumn =
      over.data.current?.type === "column" ? overId : findColumnOf(overId, snapshot);
    const sourceColumn = findColumnOf(activeId, snapshot);
    const card = cardsById.get(activeId);
    if (!targetColumn || !sourceColumn || !card) {
      endDrag();
      return;
    }

    // Build the final ordered id list for the target column.
    let finalList: string[];
    if (sourceColumn === targetColumn) {
      finalList = [...snapshot[sourceColumn]];
      const from = finalList.indexOf(activeId);
      let to =
        over.data.current?.type === "column" ? finalList.length - 1 : finalList.indexOf(overId);
      if (to === -1) to = finalList.length - 1;
      finalList.splice(from, 1);
      finalList.splice(to, 0, activeId);
    } else {
      // Cross-column: onDragOver already placed the card in the target list.
      finalList = snapshot[targetColumn];
    }

    const index = finalList.indexOf(activeId);
    if (index === -1) {
      endDrag();
      return;
    }
    const beforeCard = index > 0 ? cardsById.get(finalList[index - 1]) : undefined;
    const afterCard =
      index < finalList.length - 1 ? cardsById.get(finalList[index + 1]) : undefined;

    let newOrder = orderBetween(beforeCard?.order, afterCard?.order);

    if (needsRebalance(newOrder, beforeCard?.order, afterCard?.order)) {
      // Fractional keys converged after many inserts at the same spot:
      // re-space the whole column with fresh evenly-distributed keys.
      const orders = rebalancedOrders(finalList.length);
      newOrder = orders[index];
      const entries = finalList.map((cardId, i) => ({ cardId, order: orders[i] }));
      void store
        .moveCard(activeId, targetColumn, newOrder)
        .then(() => store.rebalanceColumn(entries));
      endDrag((base) => ({
        ...base,
        cards: base.cards.map((c) => {
          const entry = entries.find((e) => e.cardId === c.id);
          const order = entry ? entry.order : c.order;
          return c.id === activeId ? { ...c, columnId: targetColumn, order } : { ...c, order };
        }),
      }));
      return;
    }

    void store.moveCard(activeId, targetColumn, newOrder);
    endDrag((base) => ({
      ...base,
      cards: base.cards.map((c) =>
        c.id === activeId ? { ...c, columnId: targetColumn, order: newOrder } : c,
      ),
    }));
  };

  const handleDragCancel = () => {
    setActiveCard(null);
    setActiveColumn(null);
    updatePreview(null);
    updateColumnOrder(null);
    lastDragEndRef.current = Date.now();
    endDrag();
  };

  const openCard = (cardId: string) => {
    if (Date.now() - lastDragEndRef.current < 250) return;
    onOpenCard(cardId);
  };

  const addColumn = (title: string) => {
    const maxOrder = columns.reduce((max, c) => Math.max(max, c.order), 0);
    void store.addColumn(title, maxOrder + ORDER_GAP);
  };

  const deleteColumn = (columnId: string) => {
    // Guard again here (the button is disabled in the UI, but a remote client
    // may have added a card since the last snapshot rendered).
    if (cards.some((c) => c.columnId === columnId)) return;
    void store.deleteColumn(columnId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      autoScroll={{ threshold: { x: 0.15, y: 0.15 } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 sm:gap-4 h-full p-3 sm:p-5 overflow-x-auto items-start">
        <SortableContext
          items={orderedColumns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {orderedColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={(lists[column.id] ?? [])
                .map((id) => cardsById.get(id))
                .filter((c): c is Card => c !== undefined)}
              membersById={membersById}
              onAddCard={(columnId, title) => void store.addCard(columnId, title)}
              onDeleteCard={(id) => void store.deleteCard(id)}
              onOpenCard={openCard}
              onDeleteColumn={deleteColumn}
            />
          ))}
        </SortableContext>
        <div data-tour="add-column" className="shrink-0">
          <Composer
            triggerLabel="+ Add column"
            triggerClassName="w-[260px] text-left text-[13px] text-dim bg-white/[0.02] border border-dashed border-line rounded-xl p-3.5 cursor-pointer hover:bg-surface hover:text-ink hover:border-accent transition-colors"
            containerClassName="w-[260px] flex flex-col gap-2 bg-surface border border-line rounded-xl p-2.5"
            placeholder="Column name…"
            submitLabel="Add"
            maxLength={60}
            onSubmit={addColumn}
          />
        </div>
      </div>
      <DragOverlay>
        {activeColumn ? (
          <ColumnGhost
            column={activeColumn}
            cardCount={(lists[activeColumn.id] ?? []).length}
          />
        ) : activeCard ? (
          <CardGhost
            card={activeCard}
            assignee={activeCard.assigneeId ? membersById.get(activeCard.assigneeId) : undefined}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
