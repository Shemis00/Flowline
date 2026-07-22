const ICON_CLASS = "w-3.5 h-3.5 shrink-0";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ContactLink({
  href,
  icon,
  label,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      className="inline-flex items-center gap-1.5 text-dim hover:text-accent bg-surface2 hover:bg-surface3 border border-line rounded-full px-3 py-1 transition-colors"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-2 border-t border-line bg-surface px-3 sm:px-5 py-2.5 text-xs">
      <span className="inline-flex items-center gap-1.5 text-dim">
        <CodeIcon />
        Developed by <span className="font-semibold text-ink">Shemies</span>
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ContactLink href="mailto:as.shemies@gmail.com" icon={<MailIcon />} label="as.shemies@gmail.com" />
        <ContactLink href="tel:+201203001600" icon={<PhoneIcon />} label="+20 120 300 1600" />
        <ContactLink
          href="https://www.linkedin.com/in/shemis"
          icon={<LinkedInIcon />}
          label="in/shemis"
          external
        />
      </div>
    </footer>
  );
}
