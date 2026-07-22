import { useMemo, useState } from "react";
import type { BoardStore } from "../store";
import { useBoard } from "../hooks/useBoard";
import { byId, boardOrderedCards, sortColumns, sortMembers } from "../lib/board";
import { AppHeader } from "./AppHeader";
import { Sidebar, VIEWS, type View } from "./Sidebar";
import { Footer } from "./Footer";
import { Walkthrough } from "./Walkthrough";
import { KanbanView } from "./kanban/KanbanView";
import { ListView } from "./views/ListView";
import { AssigneeView } from "./views/AssigneeView";
import { DashboardView } from "./views/DashboardView";
import { CardModal } from "./CardModal";
import { MembersDialog } from "./MembersDialog";
import { BoardSkeleton } from "./ui/BoardSkeleton";

const VIEW_STORAGE_KEY = "kanban-view";
const TOUR_SEEN_KEY = "kanban-tour-seen";

/**
 * App shell: subscribes to the store, derives shared lookups, and hosts the
 * header, the active view, and the dialogs. All drag & drop lives in KanbanView.
 */
export function Board({ store }: { store: BoardStore }) {
  const { state, beginDrag, endDrag } = useBoard(store);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  // The walkthrough opens automatically on the first visit.
  const [tourOpen, setTourOpen] = useState(
    () => localStorage.getItem(TOUR_SEEN_KEY) !== "true",
  );

  const closeTour = () => {
    localStorage.setItem(TOUR_SEEN_KEY, "true");
    setTourOpen(false);
  };
  // The dashboard is the initial view; a previously chosen view is restored.
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    return VIEWS.some((v) => v.id === saved) ? (saved as View) : "dashboard";
  });

  const switchView = (next: View) => {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const columns = useMemo(() => sortColumns(state.columns), [state.columns]);
  const members = useMemo(() => sortMembers(state.members), [state.members]);
  const cardsById = useMemo(() => byId(state.cards), [state.cards]);
  const membersById = useMemo(() => byId(state.members), [state.members]);
  const orderedCards = useMemo(
    () => boardOrderedCards(state.cards, columns),
    [state.cards, columns],
  );

  const removeMember = (memberId: string) => {
    void store.deleteMember(memberId);
    // Clear dangling assignments so cards never point at a deleted member.
    for (const card of state.cards) {
      if (card.assigneeId === memberId) {
        void store.updateCard(card.id, { assigneeId: null });
      }
    }
  };

  const selectedCard = openCardId ? cardsById.get(openCardId) : undefined;

  const renderView = () => {
    if (!state.loaded) {
      return <BoardSkeleton view={view} />;
    }
    switch (view) {
      case "dashboard":
        return (
          <DashboardView
            cards={orderedCards}
            columns={columns}
            members={members}
            onOpenCard={setOpenCardId}
          />
        );
      case "list":
        return (
          <ListView
            cards={orderedCards}
            columns={columns}
            membersById={membersById}
            onOpenCard={setOpenCardId}
          />
        );
      case "assignee":
        return (
          <AssigneeView
            cards={orderedCards}
            columns={columns}
            members={members}
            onOpenCard={setOpenCardId}
          />
        );
      case "kanban":
        return (
          <KanbanView
            store={store}
            columns={columns}
            cards={state.cards}
            cardsById={cardsById}
            membersById={membersById}
            beginDrag={beginDrag}
            endDrag={endDrag}
            onOpenCard={setOpenCardId}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        membersCount={state.members.length}
        onOpenMembers={() => setMembersOpen(true)}
        onOpenHelp={() => setTourOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar view={view} onViewChange={switchView} />
        <main className="flex-1 min-w-0 min-h-0">{renderView()}</main>
      </div>

      <Footer />

      <Walkthrough open={tourOpen} onClose={closeTour} onViewChange={switchView} />

      {selectedCard && (
        <CardModal
          card={selectedCard}
          members={members}
          onSave={(updates) => void store.updateCard(selectedCard.id, updates)}
          onDelete={() => void store.deleteCard(selectedCard.id)}
          onClose={() => setOpenCardId(null)}
        />
      )}

      {membersOpen && (
        <MembersDialog
          members={members}
          onAdd={(name) => void store.addMember(name)}
          onRemove={removeMember}
          onClose={() => setMembersOpen(false)}
        />
      )}
    </div>
  );
}
