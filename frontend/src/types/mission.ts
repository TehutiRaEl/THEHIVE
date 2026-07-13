export type MissionType = 'combat' | 'exploration' | 'crafting' | 'social' | 'story';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  reward: string;
  duration: string;
  participants: number;
  location?: string;
  requirements?: string[];
  objectives?: string[];
  story?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  assignedTo?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface MissionSummary {
  total: number;
  byType: Record<MissionType, number>;
  byDifficulty: Record<MissionDifficulty, number>;
  active: number;
  completed: number;
}
