/**
 * XP Store UI for THEHIVE
 */
import React, { useState, useCallback } from 'react';
import { AgentAvatar } from '../avatars/types';
import { xpSystem } from './system';
import { XPBalance } from '../avatars/types';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: 'avatar' | 'booster' | 'equipment' | 'spell' | 'merchandise' | 'access';
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

interface XPStoreProps {
  avatar: AgentAvatar;
  items: StoreItem[];
  onPurchase?: (item: StoreItem) => void;
}

const RARITY_COLORS = {
  common: '#888888',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FFD700',
};

const CATEGORY_ICONS = {
  avatar: 'user',
  booster: 'zap',
  equipment: 'sword',
  spell: 'sparkles',
  merchandise: 'shopping-bag',
  access: 'crown'
};

const CATEGORY_LABELS = {
  avatar: 'Avatar Parts',
  booster: 'XP Boosters',
  equipment: 'Equipment',
  spell: 'Spells',
  merchandise: 'Merchandise',
  access: 'Premium Access'
};

export const XPStore: React.FC<XPStoreProps> = ({ avatar, items, onPurchase }) => {
  const [balance, setBalance] = useState<XPBalance | undefined>(xpSystem.getBalance(avatar.agentId));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'rarity' | 'name'>('price');
  
  const categories = [...new Set(items.map(item => item.category))];
  
  const filteredItems = items.filter(item => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
  });
  
  const canAfford = (item: StoreItem) => {
    if (!balance) return false;
    return balance.availableXP >= item.price;
  };
  
  const handlePurchase = useCallback((item: StoreItem) => {
    if (!balance || !canAfford(item)) return;
    const success = xpSystem.spendXP(avatar.agentId, item.price, 'Purchase: ' + item.name);
    if (success) {
      setBalance(xpSystem.getBalance(avatar.agentId));
      if (onPurchase) onPurchase(item);
    }
  }, [avatar.agentId, balance, onPurchase]);
  
  const refreshBalance = useCallback(() => {
    setBalance(xpSystem.getBalance(avatar.agentId));
  }, [avatar.agentId]);
  
  const getRarityBadge = (rarity: string) => (
    <span className="rarity-badge" style={{ background: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#888' }}>
      {rarity.toUpperCase()}
    </span>
  );
  
  return (
    <div className="xp-store-container">
      <div className="xp-store-sidebar">
        <div className="balance-card">
          <div className="balance-label">Your Balance</div>
          <div className="balance-amount">{balance?.availableXP || 0} XP</div>
          <div className="balance-level">Level {balance?.level || 1}</div>
        </div>
        
        <div className="filter-section">
          <div className="filter-label">Categories</div>
          <button className={selectedCategory === null ? 'category-button active' : 'category-button'} onClick={() => setSelectedCategory(null)}>
            All Items
          </button>
          {categories.map(cat => (
            <button key={cat} className={selectedCategory === cat ? 'category-button active' : 'category-button'} onClick={() => setSelectedCategory(cat)}>
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
        
        <div className="filter-section">
          <div className="filter-label">Sort By</div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="sort-select">
            <option value="price">Price: Low to High</option>
            <option value="rarity">Rarity</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
        
        <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
      </div>
      
      <div className="xp-store-main">
        <h2>XP Store</h2>
        <div className="store-info">{filteredItems.length} items available</div>
        
        <div className="items-grid">
          {sortedItems.map(item => {
            const canBuy = canAfford(item);
            return (
              <div key={item.id} className={canBuy ? 'store-item' : 'store-item disabled'} onClick={() => canBuy && handlePurchase(item)}>
                <div className="item-icon">{item.icon}</div>
                <div className="item-info">
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                    {getRarityBadge(item.rarity)}
                  </div>
                  <div className="item-description">{item.description}</div>
                  <div className="item-footer">
                    <span className={canBuy ? 'item-price' : 'item-price unaffordable'}>{item.price} XP</span>
                    {!canBuy && <span className="not-enough">Not enough XP</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const SAMPLE_STORE_ITEMS: StoreItem[] = [
  { id: 'wings-angelic', name: 'Angelic Wings', description: 'Beautiful white wings', category: 'avatar', price: 500, rarity: 'rare', icon: 'wings' },
  { id: 'xp-boost-2x', name: '2x XP Booster', description: 'Double XP for 1 hour', category: 'booster', price: 200, rarity: 'uncommon', icon: 'zap' },
  { id: 'sword-legendary', name: 'Legendary Sword', description: 'Powerful weapon', category: 'equipment', price: 1000, rarity: 'legendary', icon: 'sword' },
  { id: 'fireball-spell', name: 'Fireball', description: 'Cast fireballs', category: 'spell', price: 750, rarity: 'epic', icon: 'fire' },
  { id: 'hive-tshirt', name: 'HIVE T-Shirt', description: 'Show allegiance', category: 'merchandise', price: 100, rarity: 'common', icon: 'shirt' },
  { id: 'premium-access', name: 'Premium Access', description: 'Exclusive features', category: 'access', price: 2000, rarity: 'legendary', icon: 'crown' }
];

export default XPStore;