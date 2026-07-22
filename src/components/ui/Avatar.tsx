import type { Member } from "../../types";

const PALETTE = [
  "#e5645f",
  "#e8923a",
  "#d4b13d",
  "#57ab5a",
  "#39b3a7",
  "#5b8def",
  "#986ee2",
  "#d96ba8",
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function memberColor(memberId: string): string {
  return PALETTE[hashCode(memberId) % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Colored initials avatar; color is derived deterministically from the member id. */
export function Avatar({ member, size = 24 }: { member: Member; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-bold tracking-wide shrink-0"
      title={member.name}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: memberColor(member.id),
      }}
    >
      {initials(member.name)}
    </span>
  );
}
