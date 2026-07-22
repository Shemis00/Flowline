import type { View } from "../Sidebar";
import { ViewShell } from "./ViewShell";

/** Pulsing placeholder block used to sketch layout while the board loads. */
function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden />;
}

function DashboardSkeleton() {
  return (
    <ViewShell>
      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border border-line bg-surface rounded-xl p-4 flex flex-col gap-2.5">
            <Bone className="h-7 w-12" />
            <Bone className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
        {[0, 1].map((panel) => (
          <section key={panel} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <Bone className="h-3 w-28 mb-1" />
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Bone className="h-3.5 w-[92px] sm:w-[130px] shrink-0" />
                <Bone className="flex-1 h-2 rounded-full" />
                <Bone className="h-3.5 w-7 shrink-0" />
              </div>
            ))}
          </section>
        ))}

        <section className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5 col-span-full max-md:col-span-1">
          <Bone className="h-3 w-36 mb-1" />
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 bg-surface2 border border-line rounded-[10px] px-3 py-2.5"
            >
              <Bone className="h-3.5 w-[55%]" />
              <Bone className="h-5 w-16 rounded-md shrink-0" />
            </div>
          ))}
        </section>
      </div>
    </ViewShell>
  );
}

function KanbanSkeleton() {
  const cardsPerColumn = [3, 2, 4];
  return (
    <div className="flex gap-3 sm:gap-4 h-full p-3 sm:p-5 overflow-hidden items-start">
      {cardsPerColumn.map((count, col) => (
        <section
          key={col}
          className="flex flex-col w-[272px] sm:w-[292px] shrink-0 max-h-full bg-surface border border-line rounded-xl"
        >
          <header className="flex items-center gap-2 px-3.5 pt-3 pb-2">
            <Bone className="h-3.5 w-20" />
            <Bone className="ml-auto h-5 w-7 rounded-full" />
          </header>
          <div className="flex-1 px-2.5 py-1 flex flex-col gap-2">
            {Array.from({ length: count }, (_, i) => (
              <div
                key={i}
                className="bg-surface2 border border-line rounded-[10px] px-3 py-2.5 flex flex-col gap-2"
              >
                <Bone className="h-3.5 w-[85%]" />
                <Bone className={`h-3 opacity-70 ${i === 0 ? "w-2/5" : i === 1 ? "w-3/5" : "w-1/2"}`} />
                {i % 2 === 0 && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <Bone className="h-5 w-14 rounded-md" />
                    <span className="flex-1" />
                    <Bone className="h-[22px] w-[22px] rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-2.5 pt-2 pb-2.5">
            <Bone className="h-8 w-24 rounded-lg" />
          </div>
        </section>
      ))}
      <Bone className="w-[260px] h-[52px] shrink-0 rounded-xl" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="h-full overflow-hidden p-3 sm:p-5">
      <div className="md:hidden flex flex-col gap-2.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="bg-surface border border-line rounded-xl px-3.5 py-3 flex flex-col gap-2"
          >
            <Bone className="h-3.5 w-[70%]" />
            <Bone className="h-3 w-[45%] opacity-70" />
            <div className="flex items-center gap-2">
              <Bone className="h-5 w-16 rounded-md" />
              <Bone className="h-5 w-14 rounded-md" />
              <span className="flex-1" />
              <Bone className="h-5 w-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex gap-4 px-4 py-3 border-b border-line">
          <Bone className="h-3 w-16" />
          <Bone className="h-3 w-20" />
          <Bone className="h-3 w-14" />
          <Bone className="h-3 w-16 ml-auto" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-line last:border-b-0">
            <Bone className="h-3.5 w-[28%]" />
            <Bone className="h-5 w-20 rounded-md" />
            <Bone className="h-5 w-16 rounded-md" />
            <div className="ml-auto flex items-center gap-2">
              <Bone className="h-5 w-5 rounded-full" />
              <Bone className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssigneeSkeleton() {
  return (
    <ViewShell>
      {Array.from({ length: 3 }, (_, section) => (
        <section key={section} className="bg-surface border border-line rounded-xl px-4 py-3.5">
          <header className="flex items-center gap-2.5 mb-3">
            <Bone className="h-7 w-7 rounded-full" />
            <Bone className="h-3.5 w-28" />
            <Bone className="h-5 w-7 rounded-full" />
          </header>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
            {Array.from({ length: 2 + (section % 2) }, (_, i) => (
              <div
                key={i}
                className="bg-surface2 border border-line rounded-[10px] px-3 py-2.5 flex flex-col gap-2"
              >
                <Bone className="h-3.5 w-[80%]" />
                <div className="flex items-center gap-2">
                  <Bone className="h-5 w-16 rounded-md" />
                  <Bone className="h-5 w-14 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </ViewShell>
  );
}

/** View-shaped loading placeholders shown until the board store has data. */
export function BoardSkeleton({ view }: { view: View }) {
  return (
    <div className="h-full" role="status" aria-live="polite" aria-busy="true" aria-label="Loading board">
      {view === "dashboard" && <DashboardSkeleton />}
      {view === "kanban" && <KanbanSkeleton />}
      {view === "list" && <ListSkeleton />}
      {view === "assignee" && <AssigneeSkeleton />}
      <span className="sr-only">Loading board…</span>
    </div>
  );
}
