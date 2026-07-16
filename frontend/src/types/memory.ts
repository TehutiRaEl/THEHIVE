export type MemoryType = 'system' | 'user' | 'agent' | 'event';

// Graph-view shapes for MemoryGraphEnhanced.tsx (D3 force layout over colonies,
// hive, repos, philosophy nodes) — distinct from the Memory entries above.
export interface MemoryNode {
  id: string;
  type: 'colony' | 'hive' | 'repo' | 'philosophy' | string;
  name: string;
  x?: number;
  y?: number;
  z?: number;
  size?: number;
  color?: string;
}

export interface MemoryLink {
  source: string;
  target: string;
  type?: string;
  weight?: number;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  author: string;
  tags: string[];
  type: MemoryType;
  metadata?: Record<string, string>;
  relatedMemories?: string[];
}

export interface MemorySummary {
  total: number;
  byType: Record<MemoryType, number>;
  byAuthor: Record<string, number>;
  allTags: string[];
  recent: Memory[];
}
