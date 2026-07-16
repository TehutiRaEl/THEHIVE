/**
 * XP Store System
 * 
 * Allows agents to spend XP on:
 * - Premium avatars
 * - Colony customization
 * - XP boosters
 * - Tiered equipment
 * - Clothing/merchandise
 * - Spells/abilities
 * - Gear
 * - Prompt mods
 * - Access to premium areas
 */

import { XPMultiplier, AvatarPart, AgentAvatar } from '../avatars/types';
import { xpSystem } from './system';

// Product categories
export type ProductCategory = 
  | 'avatars'
  | 'customization'
  | 'boosters'
  | 'equipment'
  | 'clothing'
  | 'spells'
  | 'gear'
  | 'prompt_mods'
  | 'access';

// Product interface
export interface XPProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // Price in XP
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  image?: string;
  
  // For avatars
  avatarPart?: AvatarPart;
  
  // For boosters
  booster?: XPMultiplier;
  duration?: number; // In seconds
  
  // For equipment
  stats?: {
    strength?: number;
    intelligence?: number;
    charisma?: number;
    agility?: number;
    endurance?: number;
  };
  
  // For access
  accessTo?: string; // Area/feature ID
  
  // Stock/availability
  stock?: number; // null = unlimited
  maxPurchases?: number; // null = unlimited
  
  // Requirements
  requiredLevel?: number;
  requiredAchievements?: string[];
  
  // Metadata
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// XP Store inventory
export const XP_STORE: XPProduct[] = [
  // ========== AVATARS ==========
  {
    id: 'avatar_premium_1',
    name: 'Premium Avatar: Celestial',
    description: 'A majestic celestial avatar with glowing wings and ethereal presence',
    category: 'avatars',
    price: 5000,
    rarity: 'epic',
    icon: '✨',
    avatarPart: {
      id: 'avatar_celestial',
      name: 'Celestial Avatar',
      type: 'head',
      modelUrl: '/models/avatars/celestial.glb',
      rarity: 'epic',
      isNFT: true,
      unlockableAtLevel: 10,
      price: 5000
    } as AvatarPart
  },
  {
    id: 'avatar_premium_2',
    name: 'Premium Avatar: Infernal',
    description: 'A powerful infernal avatar with demonic wings and fiery aura',
    category: 'avatars',
    price: 5000,
    rarity: 'epic',
    icon: '🔥',
    avatarPart: {
      id: 'avatar_infernal',
      name: 'Infernal Avatar',
      type: 'head',
      modelUrl: '/models/avatars/infernal.glb',
      rarity: 'epic',
      isNFT: true,
      unlockableAtLevel: 10,
      price: 5000
    } as AvatarPart
  },
  
  // ========== CUSTOMIZATION ==========
  {
    id: 'colony_theme_custom',
    name: 'Custom Colony Theme',
    description: 'Design a unique visual theme for your colony',
    category: 'customization',
    price: 2000,
    rarity: 'rare',
    icon: '🎨'
  },
  {
    id: 'colony_banner',
    name: 'Colony Banner',
    description: 'Custom banner for your colony',
    category: 'customization',
    price: 500,
    rarity: 'uncommon',
    icon: '🏳️'
  },
  
  // ========== BOOSTERS ==========
  {
    id: 'booster_xp_1h',
    name: 'XP Booster (1 Hour)',
    description: 'Double XP gains for 1 hour',
    category: 'boosters',
    price: 500,
    rarity: 'common',
    icon: '⚡',
    booster: { type: 'agent', value: 2.0, duration: 3600 },
    duration: 3600
  },
  {
    id: 'booster_xp_24h',
    name: 'XP Booster (24 Hours)',
    description: 'Double XP gains for 24 hours',
    category: 'boosters',
    price: 3000,
    rarity: 'rare',
    icon: '⚡⚡',
    booster: { type: 'agent', value: 2.0, duration: 86400 },
    duration: 86400
  },
  {
    id: 'booster_colony_1h',
    name: 'Colony Booster (1 Hour)',
    description: '1.5x XP for all colony members for 1 hour',
    category: 'boosters',
    price: 2000,
    rarity: 'uncommon',
    icon: '🏙️⚡',
    booster: { type: 'colony', value: 1.5, duration: 3600 },
    duration: 3600
  },
  
  // ========== EQUIPMENT ==========
  {
    id: 'equip_sword_iron',
    name: 'Iron Sword',
    description: 'Basic combat equipment',
    category: 'equipment',
    price: 200,
    rarity: 'common',
    icon: '⚔️',
    stats: { strength: 5 }
  },
  {
    id: 'equip_sword_steel',
    name: 'Steel Sword',
    description: 'Advanced combat equipment',
    category: 'equipment',
    price: 1000,
    rarity: 'uncommon',
    icon: '🗡️',
    stats: { strength: 15 },
    requiredLevel: 5
  },
  {
    id: 'equip_armor_leather',
    name: 'Leather Armor',
    description: 'Basic protection',
    category: 'equipment',
    price: 300,
    rarity: 'common',
    icon: '🛡️',
    stats: { endurance: 10 }
  },
  {
    id: 'equip_armor_plate',
    name: 'Plate Armor',
    description: 'Heavy protection',
    category: 'equipment',
    price: 1500,
    rarity: 'rare',
    icon: '🛡️🛡️',
    stats: { endurance: 30 },
    requiredLevel: 10
  },
  
  // ========== CLOTHING ==========
  {
    id: 'cloth_robe_mage',
    name: 'Mage Robes',
    description: 'Enhances magical abilities',
    category: 'clothing',
    price: 800,
    rarity: 'uncommon',
    icon: '👗',
    stats: { intelligence: 20 }
  },
  {
    id: 'cloth_armor_knight',
    name: 'Knight Armor',
    description: 'Heavy protective clothing',
    category: 'clothing',
    price: 1200,
    rarity: 'rare',
    icon: '👔',
    stats: { strength: 15, endurance: 15 }
  },
  
  // ========== SPELLS ==========
  {
    id: 'spell_fireball',
    name: 'Fireball',
    description: 'Deals fire damage to enemies',
    category: 'spells',
    price: 1000,
    rarity: 'uncommon',
    icon: '🔥',
    stats: { intelligence: 10 }
  },
  {
    id: 'spell_heal',
    name: 'Healing Spell',
    description: 'Restores health to allies',
    category: 'spells',
    price: 1200,
    rarity: 'uncommon',
    icon: '💚',
    stats: { intelligence: 10 }
  },
  {
    id: 'spell_teleport',
    name: 'Teleport',
    description: 'Instantly move to a location',
    category: 'spells',
    price: 5000,
    rarity: 'epic',
    icon: '🔮',
    requiredLevel: 20
  },
  
  // ========== GEAR ==========
  {
    id: 'gear_backpack',
    name: 'Backpack',
    description: 'Increases inventory capacity',
    category: 'gear',
    price: 500,
    rarity: 'common',
    icon: '🎒'
  },
  {
    id: 'gear_wings',
    name: 'Angelic Wings',
    description: 'Allows limited flight',
    category: 'gear',
    price: 3000,
    rarity: 'rare',
    icon: '👼',
    requiredLevel: 15
  },
  {
    id: 'gear_cloak',
    name: 'Cloak of Shadows',
    description: 'Grants stealth abilities',
    category: 'gear',
    price: 2500,
    rarity: 'uncommon',
    icon: '🧥',
    requiredLevel: 10
  },
  
  // ========== PROMPT MODS ==========
  {
    id: 'prompt_mod_creative',
    name: 'Creative Boost',
    description: 'Enhances creative thinking',
    category: 'prompt_mods',
    price: 1000,
    rarity: 'uncommon',
    icon: '🎨',
    stats: { intelligence: 5, charisma: 5 }
  },
  {
    id: 'prompt_mod_analytical',
    name: 'Analytical Boost',
    description: 'Enhances logical thinking',
    category: 'prompt_mods',
    price: 1000,
    rarity: 'uncommon',
    icon: '🧠',
    stats: { intelligence: 10 }
  },
  {
    id: 'prompt_mod_persuasive',
    name: 'Persuasive Boost',
    description: 'Enhances social interactions',
    category: 'prompt_mods',
    price: 1000,
    rarity: 'uncommon',
    icon: '🗣️',
    stats: { charisma: 10 }
  },
  
  // ========== ACCESS ==========
  {
    id: 'access_premium_zone',
    name: 'Premium Zone Access',
    description: 'Access to exclusive areas',
    category: 'access',
    price: 5000,
    rarity: 'epic',
    icon: '🚪',
    accessTo: 'premium_zone',
    requiredLevel: 10
  },
  {
    id: 'access_guild_hall',
    name: 'Guild Hall Access',
    description: 'Access to guild facilities',
    category: 'access',
    price: 2000,
    rarity: 'uncommon',
    icon: '🏛️',
    accessTo: 'guild_hall',
    requiredLevel: 5
  },
  {
    id: 'access_training_grounds',
    name: 'Training Grounds Access',
    description: 'Access to advanced training',
    category: 'access',
    price: 1000,
    rarity: 'common',
    icon: '🥊',
    accessTo: 'training_grounds'
  }
];

// XP Store class
class XPStore {
  private static instance: XPStore;
  private inventory: XPProduct[] = [...XP_STORE];
  private purchases: Map<string, Map<string, number>> = new Map(); // agentId -> productId -> count
  
  private constructor() {}
  
  public static getInstance(): XPStore {
    if (!XPStore.instance) {
      XPStore.instance = new XPStore();
    }
    return XPStore.instance;
  }
  
  // Get all products
  getProducts(category?: ProductCategory): XPProduct[] {
    if (category) {
      return this.inventory.filter(p => p.category === category);
    }
    return [...this.inventory];
  }
  
  // Get product by ID
  getProduct(id: string): XPProduct | undefined {
    return this.inventory.find(p => p.id === id);
  }
  
  // Purchase a product
  purchaseProduct(agentId: string, productId: string): { success: boolean; product?: XPProduct; error?: string } {
    const product = this.getProduct(productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    const balance = xpSystem.getBalance(agentId);
    if (!balance || balance.availableXP < product.price) {
      return { success: false, error: 'Insufficient XP' };
    }
    
    // Check requirements
    if (product.requiredLevel && balance.level < product.requiredLevel) {
      return { success: false, error: `Requires level ${product.requiredLevel}` };
    }
    
    // Check stock
    if (product.stock !== undefined && product.stock <= 0) {
      return { success: false, error: 'Out of stock' };
    }
    
    // Check max purchases
    const agentPurchases = this.purchases.get(agentId) || new Map();
    if (product.maxPurchases !== undefined) {
      const currentPurchases = agentPurchases.get(productId) || 0;
      if (currentPurchases >= product.maxPurchases) {
        return { success: false, error: 'Maximum purchases reached' };
      }
    }
    
    // Spend XP
    const success = xpSystem.spendXP(agentId, product.price, `Purchase: ${product.name}`);
    if (!success) {
      return { success: false, error: 'Failed to spend XP' };
    }
    
    // Update stock
    if (product.stock !== undefined) {
      product.stock--;
    }
    
    // Update purchase count
    agentPurchases.set(productId, (agentPurchases.get(productId) || 0) + 1);
    this.purchases.set(agentId, agentPurchases);
    
    // Apply booster if applicable
    if (product.booster && product.duration) {
      const multiplier: XPMultiplier = {
        ...product.booster,
        expiresAt: new Date(Date.now() + product.duration * 1000).toISOString()
      };
      xpSystem.addMultiplier(agentId, multiplier);
    }
    
    return { success: true, product };
  }
  
  // Get purchase history for an agent
  getPurchaseHistory(agentId: string): Array<{ product: XPProduct; count: number; timestamp: string }> {
    const agentPurchases = this.purchases.get(agentId);
    if (!agentPurchases) {
      return [];
    }
    
    return Array.from(agentPurchases.entries()).map(([productId, count]) => {
      const product = this.getProduct(productId);
      return {
        product: product || { id: productId, name: 'Unknown Product' } as XPProduct,
        count,
        timestamp: new Date().toISOString() // In real app, track actual purchase times
      };
    });
  }
  
  // Add custom product (for admins)
  addProduct(product: XPProduct): void {
    this.inventory.push(product);
  }
  
  // Update product
  updateProduct(id: string, updates: Partial<XPProduct>): boolean {
    const index = this.inventory.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    this.inventory[index] = { ...this.inventory[index], ...updates };
    return true;
  }
  
  // Remove product
  removeProduct(id: string): boolean {
    const index = this.inventory.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    this.inventory.splice(index, 1);
    return true;
  }
}

// Singleton instance
export const xpStore = XPStore.getInstance();

// React hook for XP store
import * as React from 'react';

export function useXPStore(agentId: string) {
  const [products, setProducts] = React.useState<XPProduct[]>([]);
  const [purchaseHistory, setPurchaseHistory] = React.useState<Array<{ product: XPProduct; count: number; timestamp: string }>>([]);
  
  React.useEffect(() => {
    setProducts(xpStore.getProducts());
    setPurchaseHistory(xpStore.getPurchaseHistory(agentId));
  }, [agentId]);
  
  const purchase = React.useCallback((productId: string) => {
    return xpStore.purchaseProduct(agentId, productId);
  }, [agentId]);
  
  const getProduct = React.useCallback((id: string) => {
    return xpStore.getProduct(id);
  }, []);
  
  return {
    products,
    purchaseHistory,
    purchase,
    getProduct
  };
}
