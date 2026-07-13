// Colony Console Components Index
// Batch 10 - One console component per repository/colony
import React from 'react';
import THEHIVEColonyConsole from './THEHIVEColonyConsole';
import NAR2ColonyConsole from './NAR2ColonyConsole';
import LocalAGIColonyConsole from './LocalAGIColonyConsole';
import AutomatischColonyConsole from './AutomatischColonyConsole';
import DBRAINColonyConsole from './4DBRAINColonyConsole';
import KimiK2ColonyConsole from './KimiK2ColonyConsole';
import AetherColonyConsole from './AetherColonyConsole';
import FreeCodeCampColonyConsole from './FreeCodeCampColonyConsole';
import FreeProgrammingBooksColonyConsole from './FreeProgrammingBooksColonyConsole';
import BuildYourOwnXColonyConsole from './BuildYourOwnXColonyConsole';

export { default as THEHIVEColonyConsole } from './THEHIVEColonyConsole';
export { default as NAR2ColonyConsole } from './NAR2ColonyConsole';
export { default as LocalAGIColonyConsole } from './LocalAGIColonyConsole';
export { default as AutomatischColonyConsole } from './AutomatischColonyConsole';
export { default as DBRAINColonyConsole } from './4DBRAINColonyConsole';
export { default as KimiK2ColonyConsole } from './KimiK2ColonyConsole';
export { default as AetherColonyConsole } from './AetherColonyConsole';
export { default as FreeCodeCampColonyConsole } from './FreeCodeCampColonyConsole';
export { default as FreeProgrammingBooksColonyConsole } from './FreeProgrammingBooksColonyConsole';
export { default as BuildYourOwnXColonyConsole } from './BuildYourOwnXColonyConsole';

// Export all colony console components as a map
export const COLONY_CONSOLES = {
  THEHIVE: THEHIVEColonyConsole,
  NAR2: NAR2ColonyConsole,
  LocalAGI: LocalAGIColonyConsole,
  automatisch: AutomatischColonyConsole,
  '4DBRAIN': DBRAINColonyConsole,
  'Kimi-K2': KimiK2ColonyConsole,
  aether: AetherColonyConsole,
  freeCodeCamp: FreeCodeCampColonyConsole,
  'free-programming-books': FreeProgrammingBooksColonyConsole,
  'build-your-own-x': BuildYourOwnXColonyConsole,
};

// Type for colony console component props
export interface ColonyConsoleProps {
  onBack?: () => void;
}

// Type for colony console component
export type ColonyConsoleComponent = React.ComponentType<ColonyConsoleProps>;