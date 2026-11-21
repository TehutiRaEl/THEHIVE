import { useDisplayPreferences, setTheme, type ThemeChoice } from '../../theme/preference';

// The header's light/dark switch. A real three-way choice: Light, Dark, or
// System (follow the device). It changes the whole app at once and is
// remembered in this browser.
const ICONS: Record<ThemeChoice, JSX.Element> = {
  light: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.8" />
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 2.5a5.5 5.5 0 0 0 0 11z" fill="currentColor" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
      <path d="M13.2 10.1A5.8 5.8 0 0 1 5.9 2.8a5.8 5.8 0 1 0 7.3 7.3z" />
    </svg>
  ),
};

const CHOICES: { id: ThemeChoice; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'system', label: 'System' },
  { id: 'dark', label: 'Dark' },
];

export default function ThemeToggle() {
  const { theme } = useDisplayPreferences();
  return (
    <div role="radiogroup" aria-label="Colour theme" className="inline-flex rounded border border-white/15 overflow-hidden shrink-0">
      {CHOICES.map((c) => {
        const on = theme === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={`${c.label} theme`}
            title={c.id === 'system' ? 'System: follow this device’s light/dark setting' : `${c.label} theme`}
            onClick={() => setTheme(c.id)}
            className={`px-2 py-1 leading-none ${on ? 'bg-cyan-glow/20 text-cyan-glow' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <span aria-hidden="true" className="block">{ICONS[c.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
