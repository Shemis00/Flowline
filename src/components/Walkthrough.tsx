import { useEffect, useState } from "react";
import type { View } from "./Sidebar";

interface Step {
  title: string;
  body: string;
  /** View to show while this step is active. */
  view?: View;
  /** Selectors tried in order; the first match gets the spotlight. */
  target?: string[];
}

const STEPS: Step[] = [
  {
    title: "Welcome to Flowline",
    body: "A quick tour of everything on the board. Use Next (or the arrow keys) to walk through, close anytime with Esc — and reopen the tour later with the ? button in the top-right corner.",
    view: "dashboard",
  },
  {
    title: "Navigate with the sidebar",
    body: "Switch between the four views here. The chevron at the top collapses the sidebar into a slim icon rail when you want more room — your choice is remembered.",
    target: ['[data-tour="sidebar"]'],
  },
  {
    title: "Dashboard",
    body: "Headline numbers at a glance — overdue turns red when something slips. Below: tasks per column, each member's workload, and the next deadlines (click one to open that task).",
    view: "dashboard",
    target: ['[data-tour="dashboard-stats"]'],
  },
  {
    title: "Kanban board",
    body: "Drag cards to reorder within a column or move them across columns — every drop is saved instantly and syncs to all open tabs. On touch screens, press and hold a card to lift it.",
    view: "kanban",
    target: ['[data-tour="column"]'],
  },
  {
    title: "Task cards",
    body: "Click a card to edit its title, description, due date, and assignee. Past due dates are rejected, overdue chips glow red, and the × on hover deletes a card.",
    view: "kanban",
    target: ['[data-tour="card"]', '[data-tour="column"]'],
  },
  {
    title: "Add columns",
    body: "Grow the pipeline whenever you need a new stage. A column can be deleted from the × in its header, but only once it's empty — tasks are never lost by accident.",
    view: "kanban",
    target: ['[data-tour="add-column"]'],
  },
  {
    title: "Team members",
    body: "Add teammates here — each gets a colored avatar and shows up in the assignee picker on every card. Removing a member automatically clears them from their tasks.",
    target: ['[data-tour="members"]'],
  },
  {
    title: "List view",
    body: "Every task in one flat table — status, due date, and assignee at a glance (stacked cards on phones). Click any row to edit the task.",
    view: "list",
    target: ['[data-tour="view-list"]'],
  },
  {
    title: "By assignee",
    body: "Tasks grouped per team member, with an Unassigned bucket at the end — the quickest way to spot who's overloaded and what nobody owns yet.",
    view: "assignee",
    target: ['[data-tour="view-assignee"]'],
  },
  {
    title: "You're all set",
    body: "One last thing: this button replays the tour whenever you need it. Bonus tips — drag with the keyboard (focus a card, Space to lift, arrows to move), and brief disconnects are fine: writes sync when you're back.",
    view: "dashboard",
    target: ['[data-tour="help"]'],
  },
];

const SPOT_PAD = 6;

interface Props {
  open: boolean;
  onClose: () => void;
  onViewChange: (view: View) => void;
}

/** Spotlight feature tour: dims the page and rings the element each step
 *  describes. The explanation card never moves — it stays pinned bottom-right
 *  on desktop and becomes a full-width bottom sheet on phones. */
export function Walkthrough({ open, onClose, onViewChange }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  // Switch to the step's view, then find + measure its target element.
  // Re-measured on resize/scroll and again after layout animations settle.
  // Only the spotlight moves — the card is CSS-pinned and never relocates.
  useEffect(() => {
    if (!open) return;
    const step = STEPS[index];
    if (step.view) onViewChange(step.view);

    let cancelled = false;
    const findEl = (): HTMLElement | null => {
      for (const selector of step.target ?? []) {
        const el = document.querySelector<HTMLElement>(selector);
        if (el) return el;
      }
      return null;
    };
    const measure = () => {
      if (cancelled) return;
      const el = findEl();
      setRect(el ? el.getBoundingClientRect() : null);
    };
    const activate = () => {
      if (cancelled) return;
      findEl()?.scrollIntoView({ block: "nearest", inline: "nearest" });
      measure();
    };

    const t1 = setTimeout(activate, 60); // let the view render first
    const t2 = setTimeout(measure, 400); // after sidebar/scroll animations
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, index, onViewChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && index < STEPS.length - 1) setIndex(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, onClose]);

  if (!open) return null;

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  return (
    <>
      {/* Spotlight: highlighted ring + page dim via a huge box-shadow cutout. */}
      {rect ? (
        <div
          className="fixed z-40 rounded-xl border-2 border-accent pointer-events-none transition-all duration-300"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
            boxShadow: "0 0 0 9999px rgb(5 7 12 / 0.62)",
          }}
        />
      ) : (
        <div className="fixed inset-0 z-40 bg-bg/60 pointer-events-none" />
      )}

      {/* Pinned with CSS bottom/right so position never depends on measuring the
          page — earlier we queried `footer`, which matched kanban column footers
          and yanked the card to the top on those steps. */}
      <div
        className="fixed z-50 bottom-14 sm:bottom-16 left-3 right-3 sm:left-auto sm:right-4 sm:w-[370px] rounded-2xl p-[1.5px] bg-gradient-to-br from-accent via-accent2 to-teal shadow-[0_8px_40px_rgb(91_141_239/0.35)]"
      >
        <div className="bg-surface rounded-[15px] p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 max-h-[60vh] overflow-y-auto">
          {/* Tour progress */}
          <div className="h-1 rounded-full bg-surface3 overflow-hidden shrink-0">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-accent2 to-teal transition-[width] duration-300"
              style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                ✦ Step {index + 1} of {STEPS.length}
              </span>
              <h3 className="m-0 text-[15px] font-semibold">{step.title}</h3>
            </div>
            <button
              className="ml-auto bg-transparent border-none text-dim hover:text-ink text-lg leading-none cursor-pointer"
              aria-label="Close walkthrough"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          <p className="m-0 text-[13px] leading-relaxed text-dim">{step.body}</p>

          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to step ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full cursor-pointer border-none p-0 transition-colors ${
                    i === index ? "bg-accent2" : "bg-surface3 hover:bg-dim"
                  }`}
                />
              ))}
            </div>
            <span className="flex-1" />
            {index > 0 && (
              <button className="btn" onClick={() => setIndex(index - 1)}>
                Back
              </button>
            )}
            {isLast ? (
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
