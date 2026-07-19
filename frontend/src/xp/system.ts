/**
 * XP Economy System for THEHIVE
 * 
 * This system tracks XP as both a measure of contribution/value
 * and as an internal currency that can have real-world value.
 */

import { XPTransaction, XPBalance, XPMultiplier } from '../avatars/types';

// XP sources and their base values
export const XP_SOURCES: Record<string, { base: number; description: string; cooldown?: number }> = {
  // Mission completion
  mission_complete: { base: 100, description: 'Completing a mission' },
  mission_epic: { base: 500, description: 'Completing an epic mission' },
  mission_fail: { base: 25, description: 'Attempting a mission (even if failed)' },
  
  // Memory system
  memory_create: { base: 50, description: 'Creating a new memory' },
  memory_share: { base: 25, description: 'Sharing a memory with others' },
  memory_tag: { base: 10, description: 'Tagging a memory' },
  memory_retrieve: { base: 15, description: 'Retrieving a memory' },
  
  // Colony management
  colony_build: { base: 200, description: 'Building colony infrastructure' },
  colony_upgrade: { base: 300, description: 'Upgrading colony facilities' },
  colony_defend: { base: 150, description: 'Defending a colony' },
  colony_trade: { base: 75, description: 'Completing a trade' },
  
  // Agent activities
  agent_train: { base: 50, description: 'Training an agent' },
  agent_levelup: { base: 200, description: 'Agent level up' },
  agent_recruit: { base: 100, description: 'Recruiting a new agent' },
  
  // Workflow activities
  workflow_create: { base: 40, description: 'Creating a workflow' },
  workflow_execute: { base: 20, description: 'Executing a workflow' },
  workflow_optimize: { base: 80, description: 'Optimizing a workflow' },
  
  // Social activities
  chat_message: { base: 1, description: 'Sending a chat message', cooldown: 60 }, // 1 per minute
  help_other: { base: 50, description: 'Helping another user' },
  share_knowledge: { base: 75, description: 'Sharing knowledge' },
  
  // Achievements
  achievement_unlock: { base: 250, description: 'Unlocking an achievement' },
  achievement_rare: { base: 500, description: 'Unlocking a rare achievement' },
  achievement_epic: { base: 1000, description: 'Unlocking an epic achievement' },
  
  // Daily/weekly bonuses
  daily_login: { base: 25, description: 'Daily login bonus', cooldown: 86400 },
  weekly_active: { base: 200, description: 'Weekly active user bonus', cooldown: 604800 },
  
  // Special events
  event_participate: { base: 150, description: 'Participating in a special event' },
  event_win: { base: 500, description: 'Winning a special event' },
};

// XP multipliers
export const XP_MULTIPLIERS: Record<string, XPMultiplier> = {
  colony_boost: { type: 'colony', value: 1.5, duration: 3600 }, // 1 hour colony boost
  agent_boost: { type: 'agent', value: 2.0, duration: 1800 }, // 30 min agent boost
  premium_user: { type: 'subscription', value: 1.25 }, // No expiration for premium
  veteran: { type: 'veteran', value: 1.1 }, // For long-term users
  guild_member: { type: 'guild', value: 1.3 }, // Guild/team bonus
  streak_3: { type: 'streak', value: 1.1 }, // 3-day streak
  streak_7: { type: 'streak', value: 1.25 }, // 7-day streak
  streak_30: { type: 'streak', value: 1.5 }, // 30-day streak
};

// Level thresholds (XP required for each level)
export const LEVEL_THRESHOLDS: number[] = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2200,   // Level 7
  3000,   // Level 8
  4000,   // Level 9
  5500,   // Level 10
  7500,   // Level 11
  10000,  // Level 12
  13500,  // Level 13
  18000,  // Level 14
  24000,  // Level 15
  32000,  // Level 16
  42000,  // Level 17
  55000,  // Level 18
  72000,  // Level 19
  95000,  // Level 20
  // ... continues
];

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Calculate XP to next level
export function calculateXPToNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) {
    // For levels beyond our predefined thresholds
    return Math.floor(LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 1.5);
  }
  return LEVEL_THRESHOLDS[level] - LEVEL_THRESHOLDS[level - 1];
}

// XP System class (singleton)
class XPSystem {
  private static instance: XPSystem;
  private balances: Map<string, XPBalance> = new Map();
  private transactions: XPTransaction[] = [];
  private activeMultipliers: Map<string, XPMultiplier[]> = new Map();
  
  private constructor() {}
  
  public static getInstance(): XPSystem {
    if (!XPSystem.instance) {
      XPSystem.instance = new XPSystem();
    }
    return XPSystem.instance;
  }
  
  // Award XP to an agent
  awardXP(agentId: string, source: string, metadata: Record<string, any> = {}): XPTransaction {
    const sourceConfig = XP_SOURCES[source];
    if (!sourceConfig) {
      throw new Error(`Unknown XP source: ${source}`);
    }
    
    // Check cooldown
    if (sourceConfig.cooldown) {
      let lastTransaction: XPTransaction | undefined;
      for (let i = this.transactions.length - 1; i >= 0; i--) {
        const t = this.transactions[i];
        if (t.agentId === agentId && t.type === (source as any)) {
          lastTransaction = t;
          break;
        }
      }
      
      if (lastTransaction) {
        const lastTime = new Date(lastTransaction.timestamp).getTime();
        const now = Date.now();
        if (now - lastTime < sourceConfig.cooldown * 1000) {
          // Still in cooldown, don't award XP
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agentId,
            amount: 0,
            type: source as any,
            description: sourceConfig.description,
            timestamp: new Date().toISOString(),
            metadata: { ...metadata, cooldown: true }
          };
        }
      }
    }
    
    // Get active multipliers for this agent
    const agentMultipliers = this.activeMultipliers.get(agentId) || [];
    let multiplier = 1.0;
    
    agentMultipliers.forEach(m => {
      if (!m.expiresAt || new Date(m.expiresAt) > new Date()) {
        multiplier *= m.value;
      }
    });
    
    const baseXP = sourceConfig.base;
    const finalXP = Math.floor(baseXP * multiplier);
    
    // Update or create balance
    let balance = this.balances.get(agentId);
    if (!balance) {
      balance = {
        agentId,
        totalXP: 0,
        availableXP: 0,
        reservedXP: 0,
        level: 1,
        xpToNextLevel: LEVEL_THRESHOLDS[1] - LEVEL_THRESHOLDS[0]
      };
    }
    
    balance.totalXP += finalXP;
    balance.availableXP += finalXP;
    
    // Recalculate level
    const oldLevel = balance.level;
    balance.level = calculateLevel(balance.totalXP);
    balance.xpToNextLevel = calculateXPToNextLevel(balance.level);
    
    // Check for level up
    const leveledUp = balance.level > oldLevel;
    
    // Create transaction
    const transaction: XPTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      amount: finalXP,
      type: source as any,
      description: sourceConfig.description,
      timestamp: new Date().toISOString(),
      metadata: { ...metadata, multiplier, leveledUp }
    };
    
    this.transactions.push(transaction);
    this.balances.set(agentId, balance);
    
    // If leveled up, trigger level up effects
    if (leveledUp) {
      this.handleLevelUp(agentId, balance.level);
    }
    
    return transaction;
  }
  
  // Spend XP (for purchases, trades, etc.)
  spendXP(agentId: string, amount: number, purpose: string): boolean {
    const balance = this.balances.get(agentId);
    if (!balance || balance.availableXP < amount) {
      return false;
    }
    
    balance.availableXP -= amount;
    balance.reservedXP += amount;
    
    const transaction: XPTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      amount: -amount,
      type: 'purchase' as any,
      description: purpose,
      timestamp: new Date().toISOString(),
      metadata: { purpose }
    };
    
    this.transactions.push(transaction);
    this.balances.set(agentId, balance);
    
    return true;
  }
  
  // Add a multiplier
  addMultiplier(agentId: string, multiplier: XPMultiplier): void {
    const current = this.activeMultipliers.get(agentId) || [];
    this.activeMultipliers.set(agentId, [...current, multiplier]);
  }
  
  // Remove a multiplier
  removeMultiplier(agentId: string, type: string): void {
    const current = this.activeMultipliers.get(agentId) || [];
    this.activeMultipliers.set(agentId, current.filter(m => m.type !== type));
  }
  
  // Get balance for an agent
  getBalance(agentId: string): XPBalance | undefined {
    return this.balances.get(agentId);
  }
  
  // Get transactions for an agent
  getTransactions(agentId: string, limit: number = 100): XPTransaction[] {
    return this.transactions
      .filter(t => t.agentId === agentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  // Get leaderboard
  getLeaderboard(limit: number = 100): Array<XPBalance & { rank: number }> {
    return Array.from(this.balances.values())
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit)
      .map((balance, index) => ({
        ...balance,
        rank: index + 1
      }));
  }
  
  // Handle level up effects
  private handleLevelUp(agentId: string, newLevel: number): void {
    console.log(`🎉 Agent ${agentId} leveled up to level ${newLevel}!`);
    
    // In a real implementation, this would trigger:
    // - Visual effects (particles, animations)
    // - Unlock new avatar parts
    // - Grant achievements
    // - Send notifications
    // - etc.
  }
  
  // Convert XP to real-world value (placeholder for monetization)
  convertXPToValue(xp: number): { usd: number; tokens: number } {
    // These rates would be determined by your monetization strategy
    const XP_TO_USD = 0.001; // 1000 XP = $1
    const XP_TO_TOKENS = 1; // 1 XP = 1 token
    
    return {
      usd: xp * XP_TO_USD,
      tokens: xp * XP_TO_TOKENS
    };
  }
  
  // Get XP value in real currency
  getXPValue(agentId: string): { totalUSD: number; totalTokens: number } {
    const balance = this.balances.get(agentId);
    if (!balance) {
      return { totalUSD: 0, totalTokens: 0 };
    }
    
    const { usd, tokens } = this.convertXPToValue(balance.totalXP);
    return { totalUSD: usd, totalTokens: tokens };
  }
}

// Singleton instance
export const xpSystem = XPSystem.getInstance();

// React hook for XP system
export function useXP(agentId: string) {
  const [balance, setBalance] = React.useState<XPBalance | undefined>();
  const [transactions, setTransactions] = React.useState<XPTransaction[]>([]);
  
  // Sync with XP system
  React.useEffect(() => {
    setBalance(xpSystem.getBalance(agentId));
    setTransactions(xpSystem.getTransactions(agentId, 50));
    
    // Set up listener for changes (in a real app, use an event system)
    const interval = setInterval(() => {
      setBalance(xpSystem.getBalance(agentId));
      setTransactions(xpSystem.getTransactions(agentId, 50));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [agentId]);
  
  const awardXP = React.useCallback((source: string, metadata: Record<string, any> = {}) => {
    return xpSystem.awardXP(agentId, source, metadata);
  }, [agentId]);
  
  const spendXP = React.useCallback((amount: number, purpose: string) => {
    return xpSystem.spendXP(agentId, amount, purpose);
  }, [agentId]);
  
  const getXPValue = React.useCallback(() => {
    return xpSystem.getXPValue(agentId);
  }, [agentId]);
  
  return {
    balance,
    transactions,
    awardXP,
    spendXP,
    getXPValue
  };
}

// Import React for the hook
import * as React from 'react';
