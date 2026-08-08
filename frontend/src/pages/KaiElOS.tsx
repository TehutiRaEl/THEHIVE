import { useState, useEffect, useCallback, lazy, Suspense, type ComponentType } from 'react';
import { useHiveData } from '../hooks/useHiveData';
import { useIsWideViewport, useForceDesktop } from '../hooks/useViewport';
import TopStatusBar from '../components/kai-os/TopStatusBar';
import LeftNav from '../components/kai-os/LeftNav';
import CenterGraph from '../components/kai-os/CenterGraph';
import KaiSigil from '../components/kai-os/KaiSigil';
import KaiCommune from '../components/kai-os/KaiCommune';
import HiveTerminal from '../components/kai-os/HiveTerminal';
import BottomActivityFeed from '../components/kai-os/BottomActivityFeed';
import WorkflowsDrawer from '../components/kai-os/WorkflowsDrawer';
import ConnectedModels from '../components/kai-os/ConnectedModels';
import DreamLogs from '../components/kai-os/DreamLogs';
import HiveUpdates from '../components/kai-os/HiveUpdates';
import ProposalsPanel from '../components/kai-os/ProposalsPanel';
import LegalLearning from '../components/kai-os/LegalLearning';
import VenturePlanner from '../components/kai-os/VenturePlanner';
import FilesPanel from '../components/kai-os/FilesPanel';
import RoadmapPanel from '../components/kai-os/RoadmapPanel';
import ConstitutionViewer from '../components/kai-os/ConstitutionViewer';
import Observatory from '../components/kai-os/Observatory';
import BiosystemOverlay from '../components/kai-os/BiosystemOverlay';
import GatewayConsoleOverlay from '../components/kai-os/GatewayConsoleOverlay';
import CampaignOverlay from '../components/kai-os/CampaignOverlay';
import FullPlanOverlay from '../components/kai-os/FullPlanOverlay';
import GrokBridgePanel from '../components/kai-os/GrokBridgePanel';

// Legacy 13 tabs — lazy-loaded so the initial Kai EL OS shell does not pay for
// all tab modules up front (Session 2 perf, PR #132). Each tab still full-takeover
// replaces the shell when selected.
const HIVE = lazy(() => import('../components/command-center/tabs/HIVE'));
const DREAM = lazy(() => import('../components/command-center/tabs/DREAM'));
const ARCANE = lazy(() => import('../components/command-center/tabs/ARCANE'));
const WORLD = lazy(() => import('../components/command-center/tabs/WORLD'));
const SOUL = lazy(() => import('../components/command-center/tabs/SOUL'));
const GOVERN = lazy(() => import('../components/command-center/tabs/GOVERN'));
const MISSIONS = lazy(() => import('../components/command-center/tabs/MISSIONS'));
const API = lazy(() => import('../components/command-center/tabs/API'));
const FOUR_D = lazy(() => import('../components/command-center/tabs/4D'));
const ARENA = lazy(() => import('../components/command-center/tabs/ARENA'));
const WOW = lazy(() => import('../components/command-center/tabs/WOW'));
const NO_MANS_SKY = lazy(() => import('../components/command-center/tabs/NO_MANS_SKY'));
const SETTINGS = lazy(() => import('../components/command-center/tabs/SETTINGS'));

const FULL_TABS: Record<string, ComponentType> = {
  hive: HIVE, dream: DREAM, arcane: ARCANE, world: WORLD, soul: SOUL,
  govern: GOVERN, missions: MISSIONS, api: API, '4d': FOUR_D, arena: ARENA,
  wow: WOW, 'no-mans-sky': NO_MANS_SKY, settings: SETTINGS,
};

type PanelId = 'updates' | 'proposals' | 'legal' | 'venture' | 'constitution' | 'dream-logs' | 'workflows-panel' | 'sources' | 'skills' | 'ml-status' | 'connectors' | 'training' | 'roadmap' | 'grok-bridge';

function TabLoadFallback() {
  return (
    <div className="min-h-screen grid place-items-center bg-void-black text-cyan-glow font-body text-sm">
      Loading tab…
    </div>
  );
}

export default function KaiElOS() {
  const hive = useHiveData();
  const wide = useIsWideViewport();
  const [forceDesktop, setForceDesktop] = useForceDesktop();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [observatory, setObservatory] = useState(false);
  const [biosystem, setBiosystem] = useState(false);
  const [gatewayConsole, setGatewayConsole] = useState(false);
  const [campaignOverlay, setCampaignOverlay] = useState(false);
  const [fullPlanOverlay, setFullPlanOverlay] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [communeOpen, setCommuneOpen] = useState(false);

  const desktop = wide || forceDesktop;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (e.code === 'Space' && !typing) {
        e.preventDefault();
        setObservatory((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setNavOpen(false);
    if (id === 'commune') { setActiveSection(null); setCommuneOpen(true); return; }
    setActiveSection(id);
  }, []);

  if (activeSection && FULL_TABS[activeSection]) {
    const ActiveTab = FULL_TABS[activeSection];
    return (
      <div className="relative min-h-screen bg-void-black">
        <button
          onClick={() => setActiveSection(null)}
          className="fixed top-3 left-3 z-40 px-3 py-1.5 rounded-lg bg-void-900/90 border border-cyan-glow/30 text-cyan-glow text-xs font-body hover:bg-void-800"
        >
          ← Kai EL OS
        </button>
        <Suspense fallback={<TabLoadFallback />}>
          <ActiveTab />
        </Suspense>
      </div>
    );
  }

  const panels: Partial<Record<PanelId, { title: string; body: React.ReactNode }>> = {
    updates: { title: 'Hive Updates', body: <HiveUpdates hive={hive} /> },
    proposals: { title: 'Proposals — the hive suggests, you decide', body: <ProposalsPanel /> },
    legal: { title: 'Legal Learning · Commerce Under Law', body: <LegalLearning /> },
    venture: { title: 'Venture Planner · the Sub-Architect’s first workflow', body: <VenturePlanner /> },
    constitution: { title: 'The Constitution', body: <ConstitutionViewer /> },
    'dream-logs': { title: 'Memories · Dream Logs', body: <DreamLogs hive={hive} /> },
    'workflows-panel': {
      title: 'Workflows', body: (
        <div className="max-w-md"><WorkflowsDrawer /></div>
      ),
    },
    sources: { title: 'Files', body: <FilesPanel /> },
    skills: {
      title: 'Active Skills', body: (
        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
          {hive.agents.length} agents active. The hive's own skills (fable-debugger, research-to-dna,
          session-harvest, pocket-dimensions, anomaly-triage, merge-readiness, nine-miss-truths,
          skill-census, and more) live in <code className="text-cyan-glow">.claude/skills/</code> —
          run <code className="text-cyan-glow">skill-census</code> for a live audit of which are actually wired to something.
        </p>
      ),
    },
    'ml-status': {
      title: 'Cloudflare Workers AI', body: (
        <div className="text-sm text-slate-300 space-y-1">
          <div>Provider: <span className="text-cyan-glow">{hive.llm?.active_provider ?? 'simulation'}</span></div>
          <div>AI bound: <span className={hive.aiBound ? 'text-emerald-400' : 'text-slate-500'}>{String(hive.aiBound)}</span></div>
          <div>Vectorize memory bound: <span className={hive.memoryBound ? 'text-emerald-400' : 'text-slate-500'}>{String(hive.memoryBound)}</span></div>
        </div>
      ),
    },
    connectors: { title: 'Connectors', body: <p className="text-slate-500 text-sm">Not yet connected — planned.</p> },
    training: { title: 'Training', body: <p className="text-slate-500 text-sm">Not yet built — planned.</p> },
    roadmap: {
      title: 'Development Roadmap',
      body: (
        <RoadmapPanel
          onOpenCampaign={() => setCampaignOverlay(true)}
          onOpenFullPlan={() => setFullPlanOverlay(true)}
        />
      ),
    },
    'grok-bridge': { title: 'Grok Bridge', body: <GrokBridgePanel /> },
  };

  const panel = activeSection ? panels[activeSection as PanelId] : undefined;

  const centerContent = panel ? (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8">
      <button
        onClick={() => setActiveSection(null)}
        className="mb-6 px-3 py-1.5 rounded-lg bg-void-800 border border-white/10 text-slate-400 text-xs hover:text-cyan-glow"
      >
        ← Kai EL OS
      </button>
      <h2 className="font-display text-lg text-gold mb-4 tracking-wide">{panel.title}</h2>
      {panel.body}
    </div>
  ) : (
    <div className="flex-1 min-h-0 relative">
      <CenterGraph hive={hive} speaking={speaking} onSelect={handleSelect} />
      <button
        onClick={() => setObservatory(true)}
        className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 flex flex-col items-center gap-1 group"
        aria-label="Open the Observatory"
        title="The Observatory (Space)"
      >
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          <KaiSigil size={80} speaking={speaking} online={hive.online} />
        </div>
        <span className="text-[8px] uppercase tracking-[0.25em] text-slate-500 group-hover:text-cyan-glow">Observatory</span>
      </button>
    </div>
  );

  const rightRail = (
    <div className="w-80 shrink-0 h-full flex flex-col gap-3 p-3 bg-void-900 border-l border-white/5 overflow-y-auto">
      <div className="h-72 shrink-0"><KaiCommune onSpeakingChange={setSpeaking} /></div>
      <div className="h-40 shrink-0"><HiveTerminal hive={hive} /></div>
      <WorkflowsDrawer />
      <div className="border-t border-white/10 pt-3">
        <ConnectedModels hive={hive} />
      </div>
    </div>
  );

  if (desktop) {
    const forcedNarrow = forceDesktop && !wide;
    return (
      <div className={`h-screen w-screen flex flex-col bg-void-black text-slate-200 font-body ${forcedNarrow ? 'overflow-x-auto' : 'overflow-hidden'}`}>
        <div className={`flex flex-col h-full ${forcedNarrow ? 'min-w-[1280px]' : 'w-full'}`}>
          <TopStatusBar hive={hive} onOpenBiosystem={() => setBiosystem(true)} onOpenGatewayConsole={() => setGatewayConsole(true)} />
          {forcedNarrow && (
            <button
              onClick={() => setForceDesktop(false)}
              className="self-start m-2 px-3 py-1 rounded-lg bg-void-800 border border-cyan-glow/30 text-cyan-glow text-xs hover:bg-void-700"
            >
              ↩ Back to mobile view
            </button>
          )}
          <div className="flex flex-1 min-h-0">
            <LeftNav activeSection={activeSection} onSelect={handleSelect} onCommune={() => { setActiveSection(null); setCommuneOpen(true); }} />
            <div className="flex-1 min-w-0 relative flex flex-col">
              {centerContent}
              <BottomActivityFeed hive={hive} />
            </div>
            {rightRail}
          </div>
          <Observatory active={observatory} onClose={() => setObservatory(false)} hive={hive} speaking={speaking} onSelect={handleSelect} />
          <BiosystemOverlay active={biosystem} onClose={() => setBiosystem(false)} />
          <GatewayConsoleOverlay active={gatewayConsole} onClose={() => setGatewayConsole(false)} />
          <CampaignOverlay active={campaignOverlay} onClose={() => setCampaignOverlay(false)} />
          <FullPlanOverlay active={fullPlanOverlay} onClose={() => setFullPlanOverlay(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-void-black text-slate-200 font-body overflow-hidden">
      <TopStatusBar hive={hive} onOpenBiosystem={() => setBiosystem(true)} onOpenGatewayConsole={() => setGatewayConsole(true)} />

      <div className="flex items-center gap-2 px-3 h-12 shrink-0 border-b border-white/5 bg-void-900/80">
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          className="h-9 w-9 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-200 text-lg"
        >
          ☰
        </button>
        <span className="font-display text-gold tracking-[0.18em] text-sm">KAI EL OS</span>
        <button
          onClick={() => setForceDesktop(true)}
          className="ml-auto px-2.5 py-1.5 rounded-lg bg-void-800 border border-cyan-glow/30 text-cyan-glow text-[11px] whitespace-nowrap"
        >
          Desktop view
        </button>
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        {centerContent}
      </div>

      <BottomActivityFeed hive={hive} />

      <button
        onClick={() => setCommuneOpen(true)}
        className="shrink-0 h-12 flex items-center justify-center gap-2 bg-yale/40 border-t border-cyan-glow/30 text-cyan-glow font-body text-sm"
      >
        💬 Commune with Kai El
      </button>

      {navOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} />
          <div className="relative h-full animate-slideIn">
            <LeftNav activeSection={activeSection} onSelect={handleSelect} onCommune={() => { setNavOpen(false); setActiveSection(null); setCommuneOpen(true); }} />
          </div>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300"
          >
            ✕
          </button>
        </div>
      )}

      {communeOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCommuneOpen(false)} />
          <div className="relative max-h-[85vh] rounded-t-2xl bg-void-900 border-t border-white/10 flex flex-col overflow-y-auto p-3 gap-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-gold tracking-wide text-sm">Commune</span>
              <button
                onClick={() => setCommuneOpen(false)}
                aria-label="Close commune"
                className="h-8 w-8 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300"
              >
                ✕
              </button>
            </div>
            <div className="h-80 shrink-0"><KaiCommune onSpeakingChange={setSpeaking} /></div>
            <div className="h-40 shrink-0"><HiveTerminal hive={hive} /></div>
            <div className="border-t border-white/10 pt-3">
              <ConnectedModels hive={hive} />
            </div>
          </div>
        </div>
      )}

      <Observatory active={observatory} onClose={() => setObservatory(false)} hive={hive} speaking={speaking} onSelect={handleSelect} />
      <BiosystemOverlay active={biosystem} onClose={() => setBiosystem(false)} />
      <GatewayConsoleOverlay active={gatewayConsole} onClose={() => setGatewayConsole(false)} />
      <CampaignOverlay active={campaignOverlay} onClose={() => setCampaignOverlay(false)} />
      <FullPlanOverlay active={fullPlanOverlay} onClose={() => setFullPlanOverlay(false)} />
    </div>
  );
}
