import { useEffect, useRef, useState } from "react";
import type { Card, CardUpdate, Member } from "../types";
import { todayISO } from "../lib/date";
import { Modal } from "./ui/Modal";

interface Props {
  card: Card;
  members: Member[];
  onSave: (updates: CardUpdate) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function CardModal({ card, members, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState(card.assigneeId ?? "");
  const [dateError, setDateError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const today = todayISO();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const save = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      titleRef.current?.focus();
      return;
    }
    // Past due dates are rejected, except when the card already had that date
    // (so an overdue card can still be edited without touching the date).
    if (dueDate && dueDate < today && dueDate !== card.dueDate) {
      setDateError("Due date can't be in the past.");
      return;
    }
    onSave({
      title: trimmedTitle,
      description: description.trim() || null,
      dueDate: dueDate || null,
      assigneeId: assigneeId || null,
    });
    onClose();
  };

  return (
    <Modal label="Edit card" onClose={onClose}>
      <label className="flex flex-col gap-[5px]">
        <span className="field-label">Title</span>
        <input
          ref={titleRef}
          className="field-input"
          value={title}
          maxLength={500}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
      </label>

      <label className="flex flex-col gap-[5px]">
        <span className="field-label">Description</span>
        <textarea
          className="field-input"
          rows={4}
          maxLength={2000}
          placeholder="Add more detail…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-3">
        <label className="flex flex-col gap-[5px] flex-1">
          <span className="field-label">Due date</span>
          <input
            type="date"
            className="field-input"
            value={dueDate}
            min={today}
            onChange={(e) => {
              setDueDate(e.target.value);
              setDateError(null);
            }}
          />
          {dateError && <span className="text-xs text-danger-text">{dateError}</span>}
        </label>

        <label className="flex flex-col gap-[5px] flex-1">
          <span className="field-label">Assignee</span>
          <select
            className="field-input"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {members.length === 0 && (
        <p className="m-0 text-xs text-dim">
          No team members yet — add some via "Members" in the header.
        </p>
      )}

      <div className="flex gap-2 mt-1">
        <button
          className="btn btn-danger"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          Delete
        </button>
        <span className="flex-1" />
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={save}>
          Save
        </button>
      </div>
    </Modal>
  );
}
