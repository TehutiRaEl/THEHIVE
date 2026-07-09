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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <SpaceNavigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tesseract" element={<TesseractRenderer />} />
          <Route path="/colony" element={<ColonyZoomPanel />} />
          <Route path="/colony-graph" element={<ColonyGraphPage />} />
          <Route path="/memory" element={<MemoryGraph />} />
          <Route path="/phaser" element={<PhaserScene />} />
          <Route path="/arena" element={<LiveArenaViewer />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
        <KaiChatBox />
      </div>
    </ErrorBoundary>
  );
};

export default App;
