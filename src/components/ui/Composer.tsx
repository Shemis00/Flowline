import { useEffect, useRef, useState } from "react";

interface Props {
  /** Text of the collapsed trigger button. */
  triggerLabel: string;
  triggerClassName: string;
  /** Classes for the expanded editor container. */
  containerClassName: string;
  placeholder: string;
  submitLabel: string;
  maxLength: number;
  /** Multi-line textarea (cards) vs single-line input (columns). */
  multiline?: boolean;
  /** Keep the editor open after submitting, ready for the next entry. */
  keepOpenOnSubmit?: boolean;
  onSubmit: (value: string) => void;
}

/**
 * Inline "click to add" composer shared by the card and column creators:
 * a trigger button that expands into an input with submit/cancel actions.
 * Enter submits, Escape closes.
 */
export function Composer({
  triggerLabel,
  triggerClassName,
  containerClassName,
  placeholder,
  submitLabel,
  maxLength,
  multiline = false,
  keepOpenOnSubmit = false,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setValue("");
  };

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
    setValue("");
    if (keepOpenOnSubmit) inputRef.current?.focus();
    else setOpen(false);
  };

  if (!open) {
    return (
      <button className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
    );
  }

  const sharedProps = {
    ref: inputRef,
    placeholder,
    value,
    maxLength,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      } else if (e.key === "Escape") {
        close();
      }
    },
  };

  return (
    <div className={containerClassName}>
      {multiline ? (
        <textarea className="field-input resize-none" rows={2} {...sharedProps} />
      ) : (
        <input className="field-input" {...sharedProps} />
      )}
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={submit}>
          {submitLabel}
        </button>
        <button className="btn" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
