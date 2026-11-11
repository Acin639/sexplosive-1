const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MenuIcon() {
  return (
    <svg {...base}>
      <path d="M4 6.5h16" />
      <path d="M4 12h11" />
      <path d="M4 17.5h7" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg {...base} width={28} height={28} strokeWidth={2.4}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" />
    </svg>
  );
}

export function ProfileIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}
