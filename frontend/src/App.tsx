import CommandCenter from './pages/CommandCenter';
import ErrorBoundary from './components/ErrorBoundary';

// Restores routing lost to a merge-order regression (2026-07-14): an earlier commit
// wired all 13 tabs into App.tsx (bbc2740), a later "root configuration files" commit
// (8342d17) silently replaced App.tsx with a HiveDashboard-only stub, leaving
// CommandCenter.tsx — and every live-data tab wired to it this session (HIVE, ARENA,
// GOVERN, SOUL, WORLD, DREAM, ARCANE, MISSIONS, API) — completely unreachable in the
// deployed bundle even though it was fully built, verified, and merged. See
// CLAUDE.md's "not yet reconciled" list and MANDATE_TRIAGE.md for the discovery.
function App() {
  return (
    <ErrorBoundary>
      <CommandCenter />
    </ErrorBoundary>
  );
}

export default App;
