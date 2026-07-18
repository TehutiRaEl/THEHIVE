// A control that looks like a button but isn't wired to anything yet.
// Used across the legacy command-center tabs to replace buttons that used
// to render clickable with no onClick at all — they did nothing, silently,
// which is worse than looking disabled. Same "shown honestly, not hidden"
// principle as LeftNav's wired:false items.
export default function PlannedControl({ label, className }: { label: string; className?: string }) {
  return (
    <button
      disabled
      title={`${label} — not yet wired`}
      className={className}
      style={{ opacity: 0.45, cursor: 'not-allowed' }}
    >
      {label}
    </button>
  );
}
