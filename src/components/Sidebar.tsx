import { useState, type ReactNode } from "react";

export type View = "dashboard" | "kanban" | "list" | "assignee";

const COLLAPSE_STORAGE_KEY = "kanban-sidebar-collapsed";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="5" height="18" rx="1.5" />
      <rect x="10" y="3" width="5" height="12" rx="1.5" />
      <rect x="17" y="3" width="5" height="8" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17.5 14.5c2.5.4 4 2.2 4 4.5" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-[18px] h-[18px] shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="14 6 8 12 14 18" />
    </svg>
  );
}

export const VIEWS: { id: View; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "kanban", label: "Kanban", icon: <KanbanIcon /> },
  { id: "list", label: "List", icon: <ListIcon /> },
  { id: "assignee", label: "By assignee", icon: <PeopleIcon /> },
];

interface Props {
  view: View;
  onViewChange: (view: View) => void;
}

/**
 * Collapsible view navigation. Open by default (collapsed on phones where the
 * width matters more); the choice is remembered across reloads.
 */
export function Sidebar({ view, onViewChange }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (saved !== null) return saved === "true";
    return window.innerWidth < 768;
  });

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(!prev));
      return !prev;
    });
  };

  return (
    <aside
      data-tour="sidebar"
      className={`flex flex-col gap-1 border-r border-line bg-surface p-2 shrink-0 transition-[width] duration-200 ${
        collapsed ? "w-[52px]" : "w-44 sm:w-48"
      }`}
    >
      <button
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-dim hover:text-ink hover:bg-surface2 cursor-pointer transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggle}
      >
        <ChevronIcon collapsed={collapsed} />
        {!collapsed && <span className="text-[12px] font-medium">Collapse</span>}
      </button>

      <div className="h-px bg-line my-1" />

      <nav className="flex flex-col gap-1" aria-label="Board views">
        {VIEWS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium cursor-pointer transition-colors ${
              collapsed ? "justify-center" : ""
            } ${
              view === id
                ? "bg-accent-soft text-accent shadow-[inset_2px_0_0_var(--color-accent)]"
                : "text-dim hover:text-ink hover:bg-surface2"
            }`}
            title={label}
            aria-current={view === id ? "page" : undefined}
            onClick={() => onViewChange(id)}
          >
            {icon}
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
