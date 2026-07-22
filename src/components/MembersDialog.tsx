import { useEffect, useRef, useState } from "react";
import type { Member } from "../types";
import { Avatar } from "./ui/Avatar";
import { Modal } from "./ui/Modal";

interface Props {
  /** Pre-sorted by join date. */
  members: Member[];
  onAdd: (name: string) => void;
  onRemove: (memberId: string) => void;
  onClose: () => void;
}

export function MembersDialog({ members, onAdd, onRemove, onClose }: Props) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Case-insensitive duplicate guard.
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setName("");
      return;
    }
    onAdd(trimmed);
    setName("");
    inputRef.current?.focus();
  };

  return (
    <Modal label="Team members" onClose={onClose}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          className="field-input"
          placeholder="Member name…"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="btn btn-primary" onClick={submit}>
          Add
        </button>
      </div>

      <ul className="list-none m-0 p-0 flex flex-col gap-2 max-h-[260px] overflow-y-auto">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-2.5 bg-surface2 border border-line rounded-[10px] px-2.5 py-2"
          >
            <Avatar member={member} size={28} />
            <span className="flex-1 text-sm">{member.name}</span>
            <button
              className="bg-transparent border-none text-dim hover:text-danger-text text-base leading-none cursor-pointer"
              aria-label={`Remove ${member.name}`}
              onClick={() => onRemove(member.id)}
            >
              &times;
            </button>
          </li>
        ))}
        {members.length === 0 && (
          <li className="text-xs text-dim">No members yet. Add teammates to assign them to cards.</li>
        )}
      </ul>

      <div className="flex gap-2 mt-1">
        <span className="flex-1" />
        <button className="btn" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
