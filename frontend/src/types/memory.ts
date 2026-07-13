export type MemoryType = 'system' | 'user' | 'agent' | 'event';

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
