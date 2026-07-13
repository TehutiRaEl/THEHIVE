export interface Agent {
  id: string;
  name: string;
  role: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  attributes: AgentAttributes;
  skills: string[];
  assignedTo?: string;
  status: 'active' | 'resting' | 'on-mission' | 'injured';
  avatar?: string;
  lastActive: string;
}

export interface AgentAttributes {
  strength?: number;
  intelligence?: number;
  charisma?: number;
  agility?: number;
  endurance?: number;
  [key: string]: number | undefined;
}

export interface AgentSummary {
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  totalLevel: number;
  averageLevel: number;
}
