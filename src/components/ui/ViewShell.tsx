import type { ReactNode } from "react";

/**
 * Scrollable, width-constrained container shared by the dashboard, list and
 * assignee views so they all get identical padding and responsive max-width.
 */
export function ViewShell({ children, dataTour }: { children: ReactNode; dataTour?: string }) {
  return (
    <div className="h-full overflow-y-auto p-3 sm:p-5">
      <div
        data-tour={dataTour}
        className="max-w-[980px] xl:max-w-[1200px] mx-auto w-full flex flex-col gap-3.5 sm:gap-[18px]"
      >
        {children}
      </div>
    </div>
  );
}
