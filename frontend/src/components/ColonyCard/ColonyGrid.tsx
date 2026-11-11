import colonies from '../../data/colonies';
import useColonyPing from '../../hooks/useColonyPing';
import ColonyCard from './ColonyCard';
import type { ColonyId } from '../../types';

// Grid of the 6 real federation colonies (roster mirrors GET /v11/debug/colony-ping),
// each card backed by the manifest's static fields plus a live ping for status.
// onSelect (when given) opens the colony drill-down panel for the clicked card.
export default function ColonyGrid({ onSelect }: { onSelect?: (id: ColonyId) => void }) {
  const { byName, lastVerified, loading, error } = useColonyPing();

  return (
    <div>
      {error && (
        <p className="text-xs text-red-400 mb-3 font-exo">
          colony-ping unreachable ({error}) — showing manifest data only.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {colonies.map((colony) => (
          <ColonyCard
            key={colony.id}
            colony={colony}
            ping={byName[colony.id] ?? null}
            lastVerified={lastVerified}
            pingLoading={loading}
            pingError={error}
            onClick={onSelect ? () => onSelect(colony.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
