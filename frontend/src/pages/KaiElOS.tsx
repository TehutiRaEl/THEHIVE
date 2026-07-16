import { useState, useEffect, useCallback } from 'react';
import { useHiveData } from '../hooks/useHiveData';
import TopStatusBar from '../components/kai-os/TopStatusBar';
import LeftNav from '../components/kai-os/LeftNav';
import CenterGraph from '../components/kai-os/CenterGraph';
import KaiCommune from '../components/kai-os/KaiCommune';
import HiveTerminal from '../components/kai-os/HiveTerminal';
import BottomActivityFeed from '../components/kai-os/BottomActivityFeed';
import WorkflowsDrawer from '../components/kai-os/WorkflowsDrawer';
import ConnectedModels from '../components/kai-os/ConnectedModels';
import DreamLogs from '../components/kai-os/DreamLogs';
import Observatory from '../components/kai-os/Observatory';

// The 13 existing, live-data-wired tabs — each already renders its own
// SpaceNavigation + KaiChatBox, so when one is shown it fully replaces the OS
// shell (no duplicate nav/chat) rather than being embedded inside it.
import HIVE from '../components/command-center/tabs/HIVE';
import DREAM from '../components/command-center/tabs/DREAM';
import ARCANE from '../components/command-center/tabs/ARCANE';
import WORLD from '../components/command-center/tabs/WORLD';
import SOUL from '../components/command-center/tabs/SOUL';
import GOVERN from '../components/command-center/tabs/GOVERN';
import MISSIONS from '../components/command-center/tabs/MISSIONS';
import API from '../components/command-center/tabs/API';
import FOUR_D from '../components/command-center/tabs/4D';
import ARENA from '../components/command-center/tabs/ARENA';
import WOW from '../components/command-center/tabs/WOW';
import NO_MANS_SKY from '../components/command-center/tabs/NO_MANS_SKY';
import SETTINGS from '../components/command-center/tabs/SETTINGS';

const FULL_TABS: Record<string, React.FC> = {
  hive: HIVE, dream: DREAM, arcane: ARCANE, world: WORLD, soul: SOUL,
  govern: GOVERN, missions: MISSIONS, api: API, '4d': FOUR_D, arena: ARENA,
  wow: WOW, 'no-mans-sky': NO_MANS_SKY, settings: SETTINGS,
};

// OS-native panels that aren't one of the 13 legacy tabs — real content,
// shown inside the shell (chrome stays visible) rather than replacing it.
type PanelId = 'dream-logs' | 'workflows-panel' | 'sources' | 'skills' | 'ml-status' | 'connectors' | 'training';

export default function KaiElOS() {
  const hive = useHiveData();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [observatory, setObservatory] = useState(false);

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
    if (id === 'commune') { setActiveSection(null); return; }
    setActiveSection(id);
  }, []);

  // Full legacy-tab takeover.
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
        <ActiveTab />
      </div>
    );
  }

  const panels: Partial<Record<PanelId, { title: string; body: React.ReactNode }>> = {
    'dream-logs': { title: 'Memories · Dream Logs', body: <DreamLogs hive={hive} /> },
    'workflows-panel': {
      title: 'Workflows', body: (
        <div className="max-w-md"><WorkflowsDrawer /></div>
      ),
    },
    sources: {
      title: 'Files · Sources', body: (
        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
          Founder-provided material (PDFs, books, web clippings, research notes) lives in
          <code className="mx-1 text-cyan-glow">Project_file/Founders Visonary Folder/SOURCES/</code>
          in the repo. Anything dropped there is routed through the <code className="text-cyan-glow">research-to-dna</code> skill
          before it becomes hive knowledge — nothing is treated as canon automatically.
        </p>
      ),
    },
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
  };

  const panel = activeSection ? panels[activeSection as PanelId] : undefined;

  return (
    <div className="h-screen w-screen flex flex-col bg-void-black text-slate-200 font-body overflow-hidden">
      <TopStatusBar hive={hive} />
      <div className="flex flex-1 min-h-0">
        <LeftNav activeSection={activeSection} onSelect={handleSelect} onCommune={() => setActiveSection(null)} />

        <div className="flex-1 min-w-0 relative flex flex-col">
          {panel ? (
            <div className="flex-1 overflow-y-auto p-8">
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
            <div className="flex-1 min-h-0">
              <CenterGraph hive={hive} speaking={speaking} onSelect={handleSelect} />
            </div>
          )}
          <BottomActivityFeed hive={hive} />
        </div>

        <div className="w-80 shrink-0 h-full flex flex-col gap-3 p-3 bg-void-900 border-l border-white/5 overflow-y-auto">
          <div className="h-72 shrink-0"><KaiCommune onSpeakingChange={setSpeaking} /></div>
          <div className="h-40 shrink-0"><HiveTerminal hive={hive} /></div>
          <WorkflowsDrawer />
          <div className="border-t border-white/10 pt-3">
            <ConnectedModels hive={hive} />
          </div>
        </div>
      </div>

      <Observatory active={observatory} onClose={() => setObservatory(false)} hive={hive} speaking={speaking} onSelect={handleSelect} />
    </div>
  );
}
