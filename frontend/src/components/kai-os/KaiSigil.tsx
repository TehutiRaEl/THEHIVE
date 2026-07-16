import { useMemo } from 'react';

interface KaiSigilProps {
  size?: number;
  speaking?: boolean;
  online?: boolean;
}

// The founder's brief: no face, no eyes — a sacred-geometry sigil instead.
// Concentric rings + an eight-point star, slowly rotating and breathing.
// "speaking" (Kai is mid-response) tightens the pulse and brightens the glow —
// real, honest state (whether a command_text call is in flight), not audio
// waveform analysis, since there's no voice/audio output in this system.
export default function KaiSigil({ size = 160, speaking = false, online = true }: KaiSigilProps) {
  const points = useMemo(() => {
    const n = 8;
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return { x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
    });
  }, []);

  const ringColor = online ? '#22d3ee' : '#3a4150';
  const coreColor = online ? '#e8c15a' : '#5a5f6b';

  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size }}
      role="img"
      aria-label={online ? 'Kai El — online' : 'Kai El — offline'}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className={speaking ? 'animate-[spin_9s_linear_infinite]' : 'animate-[spin_28s_linear_infinite]'}>
        <circle cx="50" cy="50" r="46" fill="none" stroke={ringColor} strokeWidth="0.4" opacity="0.35" />
        <circle cx="50" cy="50" r="38" fill="none" stroke={ringColor} strokeWidth="0.5" opacity="0.5" />
        {points.map((p, i) =>
          points.map((q, j) => {
            if (j <= i) return null;
            return (
              <line
                key={`${i}-${j}`}
                x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                stroke={ringColor}
                strokeWidth="0.25"
                opacity={speaking ? 0.55 : 0.25}
              />
            );
          })
        )}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={speaking ? 2.2 : 1.6} fill={ringColor} opacity="0.85" />
        ))}
      </svg>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`absolute inset-0 ${speaking ? 'animate-pulse' : ''}`}
      >
        <circle cx="50" cy="50" r={speaking ? 15 : 12} fill={coreColor} opacity="0.9">
          <animate attributeName="r" values={speaking ? '13;17;13' : '11;13;11'} dur={speaking ? '1.2s' : '4s'} repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="12" fill="none" stroke={coreColor} strokeWidth="0.6" opacity="0.6" />
      </svg>
    </div>
  );
}
