import colonies from '../../data/colonies';
import useColonyPing from '../../hooks/useColonyPing';
import ColonyCard from './ColonyCard';

// Grid of the 6 real federation colonies (roster mirrors GET /v11/debug/colony-ping),
// each card backed by the manifest's static fields plus a live ping for status.
export default function ColonyGrid() {
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
          />
        ))}
      </div>
    </div>
  );
}
