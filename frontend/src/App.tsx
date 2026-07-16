import KaiElOS from './pages/KaiElOS';
import ErrorBoundary from './components/ErrorBoundary';

// Kai EL OS (2026-07-16): the founder's "AI operating system" redesign —
// the knowledge graph as the navigator, Kai EL's sigil at the center, with
// the 13 existing live-data tabs (previously the whole app, see git history
// around the 2026-07-14 merge-order regression) now reachable as full-takeover
// destinations from the graph or the left nav, not thrown away.
function App() {
  return (
    <ErrorBoundary>
      <KaiElOS />
    </ErrorBoundary>
  );
}

export default App;
