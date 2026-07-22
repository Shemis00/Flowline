# Flowline — Kanban Board with Drag & Drop and Persistent Ordering

A Kanban board built with **React 19 + TypeScript + Vite + Tailwind CSS**, featuring
smooth drag & drop reordering (within and across columns), drop indicators, auto-scroll
near edges, and persistence of card order backed by **Firebase Realtime Database**
(with an automatic localStorage fallback so the app runs with zero setup).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

- With a `.env.local` present (see below), the board persists to **Firebase Realtime
  Database** and syncs live across browsers/devices — the header badge shows
  "Firebase Realtime DB".
- With no configuration, the app falls back to **localStorage** automatically, so it
  works out of the box (including cross-tab sync via the `storage` event).

### Firebase configuration

Copy `.env.example` to `.env.local` and fill in the values from your Firebase web app:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_DATABASE_URL=https://<project>-default-rtdb.firebaseio.com
VITE_FIREBASE_AUTH_DOMAIN=...   # optional, derived from project id if omitted
VITE_FIREBASE_APP_ID=...        # optional
```

Security rules for the database live in `database.rules.json`. Deploy them with:

```bash
npx -y firebase-tools@latest deploy --only database
```

### Production build

```bash
npm run build && npm run preview
```

## Features

- **Drag & drop** cards within a column and across columns ([dnd-kit](https://dndkit.com/))
- **Smooth animations** — neighbors slide out of the way; the dragged card floats
  in an overlay with a lift shadow, and settles with a drop animation
- **Drop indicators** — a dashed highlighted placeholder marks the exact drop slot;
  the hovered column lights up
- **Auto-scroll** — dragging near the top/bottom of a column scrolls the card list;
  dragging near the left/right edge of the board scrolls horizontally
- **Persistence of order** — every drop is written immediately; order survives
  reload and syncs live across clients
- **Four views** — switch in the collapsible sidebar (open by default, remembered
  across reloads) between **Dashboard** (the initial view:
  headline stats, tasks per column, workload per member, upcoming deadlines),
  **Kanban** (drag & drop board), **List** (flat table of all tasks in board
  order), and **By assignee** (tasks grouped per team member, plus an Unassigned
  bucket); the chosen view is remembered across reloads, and cards open the same
  editor from any view
- **Rich cards** — title, description, due date (overdue dates highlighted), and
  assignee; click a card to open the editor
- **Team members** — manage members from the header ("Members" button) and assign
  them to cards; each member gets a colored initials avatar
- **Add / delete columns** — "+ Add column" at the end of the board; a column can
  be deleted (× in its header) only when it holds no tasks
- Add cards (Enter to submit), delete (× on hover)
- Keyboard drag & drop: focus a card, `Space` to lift, arrows to move, `Space` to drop
- **Guided walkthrough** — a step-by-step tour opens on first visit, switching to
  each view as it explains it; close it anytime and reopen it with the ? button
  in the header
- **Responsive** — works from phones to large desktops: the header wraps and view
  tabs go full-width on small screens, the list view swaps its table for stacked
  cards on phones, dialogs cap at 90% of the viewport height, and on touch screens
  a long-press lifts a card while a plain swipe scrolls (mouse drags start after
  6px of movement as before)

## Design decisions & trade-offs

### Ordering: fractional keys, not array indexes

Each card stores a numeric `order` key; a column is the set of cards sorted by it.
Dropping a card writes the **midpoint** of its new neighbors' keys — a
**single-node write** per drop, instead of rewriting every card below the drop
position. Fewer writes means fewer conflicts when two clients reorder concurrently,
and less data churn over the wire.

Trade-off: repeated inserts into the same gap converge toward float precision limits.
When two keys get closer than `1e-6`, the column is **rebalanced** — re-spaced with
fresh keys in one atomic multi-path update. This is rare (needs ~50 consecutive
inserts into the same slot) and invisible to the user.

### Store abstraction: Realtime Database + localStorage behind one interface

The UI talks to a tiny `BoardStore` interface with two implementations:

- `RtdbStore` — realtime `onValue` subscription with latency compensation
  (local writes reflected instantly, then confirmed by the server). Used when
  Firebase env vars are present.
- `LocalStore` — localStorage + the `storage` event for cross-tab sync.
  Used otherwise, so a reviewer can run the project with zero setup.

Trade-off: two code paths to maintain, but the fallback guarantees "a working
version" regardless of credentials, and the interface keeps the UI backend-agnostic
(swapping in Firestore or a REST API later means implementing five methods).

### Optimistic UI with snapshot buffering

Drops render instantly from local state; the database write happens in the
background. While a drag is in progress, incoming remote snapshots are **buffered
and applied after the drop** — otherwise a sync from another client mid-drag would
yank cards out from under the pointer.

### Tailwind CSS for styling

Styling uses Tailwind v4 (via the `@tailwindcss/vite` plugin). Design tokens
(colors, shadows, font) are defined once in an `@theme` block in `src/index.css`;
components use utility classes. A handful of repeated patterns (`.btn`,
`.field-input`, `.field-label`) are composed with `@apply`, and themed scrollbar
styling lives in the base layer since scrollbars have no utility equivalent.

### dnd-kit over HTML5 drag & drop / react-beautiful-dnd

Native HTML5 DnD has poor animation control, no touch support, and inconsistent
ghost images. `react-beautiful-dnd` is deprecated. dnd-kit is actively maintained,
headless (full styling control), accessible (keyboard sensor, screen-reader
announcements), and ships collision detection + auto-scroll.

## Edge cases handled

| Case | Behavior |
| --- | --- |
| Drop outside any column | Card animates back; nothing is persisted |
| Press `Escape` mid-drag | Drag cancels, preview reverts |
| Drop into an empty column | Column body is itself a drop target |
| Drop in the original position | Harmless single write, no visual jump |
| Remote update arrives mid-drag | Buffered, applied after the drop |
| Two tabs/clients reorder concurrently | Fractional keys: writes touch different nodes; ties broken deterministically by `createdAt`, then id |
| Order keys converge (many inserts in one gap) | Automatic column rebalance in one atomic multi-path update |
| Brief disconnect (Firebase mode) | Writes queue in memory and flush on reconnect; UI stays responsive via latency compensation |
| Two clients on an empty board | Seeding runs in a transaction, so default columns are created exactly once |
| Click vs drag | 6px pointer activation distance, so clicking edit/delete never starts a drag |
| Long card titles / whitespace-only input | Wrapped + length-capped (500 chars); empty titles rejected |
| Corrupt localStorage payload | Detected, falls back to a fresh seeded board |
| Column overflow | Card list scrolls; auto-scroll engages while dragging near edges |
| Deleting an assigned member | Assignments on their cards are cleared, never dangling |
| Deleting a non-empty column | Blocked: the button is disabled with a tooltip, and re-checked against the latest snapshot on click |
| Due date in the past | Rejected: the picker's `min` is today and saving validates; existing overdue cards can still be edited without changing their date |
| Duplicate member names | Rejected case-insensitively in the members dialog |
| Click right after a drop | Suppressed, so finishing a drag never opens the card editor |

## Project structure

```
src/
  types.ts                Card / Column / Member / BoardState models
  lib/
    order.ts              Fractional ordering math (midpoints, rebalancing)
    board.ts              Pure board helpers (sorting, lookups, grouping)
    date.ts               Date helpers (today, overdue check, formatting)
  store/
    types.ts              BoardStore interface
    rtdb.ts               Firebase Realtime Database implementation
    local.ts              localStorage implementation (zero-setup fallback)
    seed.ts               Default columns
    index.ts              Backend selection from env vars
  hooks/useBoard.ts       Store subscription + optimistic drag state
  components/
    Board.tsx             App shell: derives shared data, hosts views + dialogs
    AppHeader.tsx         Title, backend badge, members button
    Sidebar.tsx           Collapsible view navigation (icons + labels)
    Footer.tsx            Credit + contact links
    Walkthrough.tsx       Step-by-step feature tour (auto-opens on first visit)
    CardModal.tsx         Card editor dialog (all fields + assignee picker)
    MembersDialog.tsx     Team member management
    ui/                   Reusable presentational primitives
      Avatar.tsx          Colored initials avatar
      Chips.tsx           Due-date and status pills
      Composer.tsx        Inline "click to add" input (cards & columns)
      EmptyState.tsx      Centered empty-view placeholder
      Modal.tsx           Dialog shell (overlay, Escape handling)
      ViewShell.tsx       Scrollable width-constrained view container
    kanban/               Drag & drop feature
      KanbanView.tsx      DndContext, sensors, drop/order computation
      Column.tsx          Droppable column + sortable card list
      CardItem.tsx        Sortable card + drag placeholder/ghost
    views/                Read-only projections of the same data
      ListView.tsx        Table (desktop) / stacked cards (mobile)
      AssigneeView.tsx    Tasks grouped per team member
      DashboardView.tsx   Stats, per-column/workload bars, deadlines
  index.css               Tailwind theme tokens + scrollbars + shared classes
database.rules.json       Schema-validating security rules
```

## Known limitations

- Single shared board (`boards/default`), no authentication — the task scope is
  ordering + persistence. The rules in `database.rules.json` validate document
  shape and sizes, but anyone with the config can read/write the demo board.
  Production would add Firebase Auth and per-user boards.
- Columns can be added and deleted (when empty) but not renamed or reordered;
  the data model supports reordering (`order` field) but no UI was built for it.
- No automated tests — with the 48h scope I prioritized manual edge-case
  hardening; the ordering math in `lib/order.ts` is pure and would be the first
  unit-test target.
