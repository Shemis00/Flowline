import { useEffect, type ReactNode } from "react";

interface Props {
  label: string;
  onClose: () => void;
  children: ReactNode;
}

/** Shared dialog shell: dark overlay, centered panel, Escape to close. */
export function Modal({ label, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-[2px] grid place-items-center z-50 p-3 sm:p-5"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[440px] max-h-[90dvh] overflow-y-auto bg-surface border border-line rounded-[14px] shadow-lift p-4 sm:p-5 flex flex-col gap-3.5"
        role="dialog"
        aria-label={label}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 text-[15px] font-semibold">{label}</h3>
        {children}
      </div>
    </div>
  );
}
