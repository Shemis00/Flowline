import type { ReactNode } from "react";

/** Centered placeholder for views with no content yet. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-items-center h-full text-dim text-sm p-10 text-center">
      {children}
    </div>
  );
}
