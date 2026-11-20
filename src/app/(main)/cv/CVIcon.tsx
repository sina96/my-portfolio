const ICONS = {
  home: "M2 8 8 2l6 6M4 7v7h8V7M7 14v-4h2v4",
  print: "M4 6V2h8v4M4 11H2V6h12v5h-2M4 9h8v5H4zM11 7.5h1",
  save: "M2 2h10l2 2v10H2zM5 2v4h6V2M5 14v-5h6v5",
  open: "M1 4h5l2 2h6l-2 7H1zM1 4V2h5l2 2h5v2",
  copy: "M6 5h7v9H6zM3 11V2h7v2",
  email: "M2 4h12v9H2zM2 4l6 5 6-5",
  github: "m5 4-4 4 4 4m6-8 4 4-4 4m-2-9-2 10",
  site: "M8 1a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 0c-4 4-4 10 0 14 4-4 4-10 0-14ZM1 8h14",
} as const;

export function CVIcon({ kind }: Readonly<{ kind: keyof typeof ICONS }>) {
  return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d={ICONS[kind]} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
  </svg>;
}
