// UI-shell types consumed by stores/uiStore.ts. Ground truth for the tab id union is
// CommandCenter.tsx's TAB_COMPONENTS map — keep this in sync with it, not the other
// way around (a mismatch here previously left the "no-mans-sky" tab unreachable via
// the nav, see utils/constants.ts).
export type TabId =
  | 'hive' | 'dream' | 'arcane' | 'world' | 'soul' | 'govern'
  | 'missions' | 'api' | '4d' | 'arena' | 'wow' | 'no-mans-sky' | 'settings';

export interface Theme {
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  sound: boolean;
  notifications: boolean;
  language: string;
  timezone: string;
}

export interface Notification {
  id: string;
  timestamp: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  type?: string;
  props?: Record<string, unknown>;
}
