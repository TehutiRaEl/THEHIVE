import { useNotifications, useUIStore } from '../../stores/uiStore';

// Task 6 (2026-08-02): stores/uiStore.ts's notification state existed with
// zero renderer anywhere — addNotification() would have updated the store
// silently with nothing visible, a real regression risk if wired to replace
// a working alert() without this. Mount once at the app root; renders
// whatever's actually in the store, nothing invented.
const TYPE_STYLE: Record<string, string> = {
  success: 'border-emerald-400/40 text-emerald-300',
  error: 'border-red-400/40 text-red-300',
  warning: 'border-amber-400/40 text-amber-300',
  info: 'border-cyan-glow/40 text-cyan-glow',
};

export default function NotificationHost() {
  const notifications = useNotifications();
  const removeNotification = useUIStore((s) => s.removeNotification);

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          role="status"
          className={`pointer-events-auto rounded-lg border bg-void-900/95 backdrop-blur px-3.5 py-2.5 shadow-lg animate-fadeIn ${TYPE_STYLE[n.type ?? 'info']}`}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              {n.title && <div className="text-sm font-semibold leading-snug">{n.title}</div>}
              {n.message && <div className="text-xs text-slate-300 leading-relaxed mt-0.5">{n.message}</div>}
            </div>
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-slate-500 hover:text-slate-200 text-xs leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
