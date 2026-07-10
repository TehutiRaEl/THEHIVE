import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SpaceNavigation from './components/SpaceNavigation';
import TesseractRenderer from './components/TesseractRenderer';
import KaiChatBox from './components/KaiChatBox';
import ColonyZoomPanel from './components/ColonyZoomPanel';
import MemoryGraph from './components/MemoryGraph';
import PhaserScene from './components/PhaserScene';
import LiveArenaViewer from './components/LiveArenaViewer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import CommandCenter from './pages/CommandCenter';
import ColonyGraphPage from './pages/ColonyGraphPage';
import Page404 from './pages/404';

// Command Center Tab Components
import HIVE from './components/command-center/tabs/HIVE';
import DREAM from './components/command-center/tabs/DREAM';
import ARCANE from './components/command-center/tabs/ARCANE';
import WORLD from './components/command-center/tabs/WORLD';
import SOUL from './components/command-center/tabs/SOUL';
import GOVERN from './components/command-center/tabs/GOVERN';
import MISSIONS from './components/command-center/tabs/MISSIONS';
import API from './components/command-center/tabs/API';
import FOUR_D from './components/command-center/tabs/4D';
import ARENA from './components/command-center/tabs/ARENA';
import WOW from './components/command-center/tabs/WOW';
import NO_MANS_SKY from './components/command-center/tabs/NO_MANS_SKY';
import SETTINGS from './components/command-center/tabs/SETTINGS';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <SpaceNavigation />
        <Routes>
          {/* Home and Standalone Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tesseract" element={<TesseractRenderer />} />
          <Route path="/colony" element={<ColonyZoomPanel />} />
          <Route path="/colony-graph" element={<ColonyGraphPage />} />
          <Route path="/memory" element={<MemoryGraph />} />
          <Route path="/phaser" element={<PhaserScene />} />
          <Route path="/arena" element={<LiveArenaViewer />} />

          {/* Command Center - Main Page */}
          <Route path="/command-center" element={<CommandCenter />} />

          {/* Command Center - Individual Tabs (for direct linking) */}
          <Route path="/command-center/hive" element={<HIVE />} />
          <Route path="/command-center/dream" element={<DREAM />} />
          <Route path="/command-center/arcane" element={<ARCANE />} />
          <Route path="/command-center/world" element={<WORLD />} />
          <Route path="/command-center/soul" element={<SOUL />} />
          <Route path="/command-center/govern" element={<GOVERN />} />
          <Route path="/command-center/missions" element={<MISSIONS />} />
          <Route path="/command-center/api" element={<API />} />
          <Route path="/command-center/4d" element={<FOUR_D />} />
          <Route path="/command-center/arena" element={<ARENA />} />
          <Route path="/command-center/wow" element={<WOW />} />
          <Route path="/command-center/no-mans-sky" element={<NO_MANS_SKY />} />
          <Route path="/command-center/settings" element={<SETTINGS />} />

          {/* 404 - Catch All */}
          <Route path="*" element={<Page404 />} />
        </Routes>
        <KaiChatBox />
      </div>
    </ErrorBoundary>
  );
};

export default App;
