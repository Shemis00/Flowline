interface Props {
  membersCount: number;
  onOpenMembers: () => void;
  onOpenHelp: () => void;
}

export function AppHeader({ membersCount, onOpenMembers, onOpenHelp }: Props) {
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-5 py-3 border-b border-line bg-surface">
      <h1 className="flex items-center gap-2 text-base sm:text-[17px] font-semibold m-0 tracking-wide">
        <span
          aria-hidden
          className="w-6 h-6 sm:w-7 sm:h-7 grid place-items-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-white shadow-[0_2px_10px_rgb(157_123_255/0.4)]"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 7h13" />
            <path d="M4 12h9" />
            <path d="M4 17h13" />
            <path d="M17 4l3 3-3 3" />
            <path d="M17 14l3 3-3 3" />
          </svg>
        </span>
        <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
          Flowline
        </span>
        <span className="hidden sm:inline text-[12px] font-normal text-dim ml-0.5">
          your work, in motion
        </span>
      </h1>
      <span className="flex-1" />
      <button className="btn" data-tour="members" onClick={onOpenMembers}>
        Members ({membersCount})
      </button>
      <button
        className="w-7 h-7 grid place-items-center rounded-full border border-line bg-surface2 text-dim hover:text-accent hover:border-accent text-[13px] font-bold cursor-pointer transition-colors"
        title="Show walkthrough"
        aria-label="Show walkthrough"
        data-tour="help"
        onClick={onOpenHelp}
      >
        ?
      </button>
    </header>
  );
}
