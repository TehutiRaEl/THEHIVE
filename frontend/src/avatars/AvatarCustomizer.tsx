/**
 * Avatar Customization UI for THEHIVE
 */
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { AgentAvatar, AvatarPart, AvatarPartType, AvatarPartRarity } from './types';
import { xpSystem } from '../xp/system';

interface AvatarCustomizerProps {
  avatar: AgentAvatar;
  availableParts: AvatarPart[];
  onSave: (customization: Record<AvatarPartType, string>) => void;
  onCancel?: () => void;
}

const PART_CATEGORIES: AvatarPartType[] = ['head', 'torso', 'arms', 'legs', 'wings', 'tail', 'horns', 'eyes', 'hair', 'beard', 'accessory'];

const RARITY_COLORS: Record<AvatarPartRarity, string> = {
  common: '#888888',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FFD700',
};

const AvatarPreview: React.FC<{ avatar: AgentAvatar; customization: Record<AvatarPartType, string>; availableParts: AvatarPart[] }> = ({ avatar, customization, availableParts }) => {
  const positions: Record<AvatarPartType, [number, number, number]> = {
    head: [0, 1.8, 0], torso: [0, 1.5, 0], arms: [0, 1.4, 0], legs: [0, 0.8, 0],
    wings: [0, 1.6, -0.3], tail: [0, 0.5, -0.5], horns: [0, 2.1, 0],
    eyes: [0, 1.7, 0.1], hair: [0, 1.9, 0], beard: [0, 1.3, 0], accessory: [0, 1.6, 0]
  };
  const sizes: Record<AvatarPartType, [number, number, number]> = {
    head: [0.6, 0.6, 0.6], torso: [0.7, 0.8, 0.4], arms: [0.6, 0.5, 0.2], legs: [0.5, 0.7, 0.3],
    wings: [0.8, 0.2, 0.1], tail: [0.3, 0.6, 0.2], horns: [0.2, 0.3, 0.2],
    eyes: [0.1, 0.1, 0.1], hair: [0.5, 0.3, 0.4], beard: [0.3, 0.2, 0.1], accessory: [0.3, 0.3, 0.3]
  };
  
  return (
    <Center>
      <group>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={avatar.colorScheme.primary} />
        </mesh>
        {PART_CATEGORIES.map(type => {
          const partId = customization[type];
          if (!partId) return null;
          const part = availableParts.find(p => p.id === partId);
          if (!part) return null;
          return <mesh key={type} position={positions[type]}><boxGeometry args={sizes[type]} /><meshStandardMaterial color={part.color || avatar.colorScheme.secondary} /></mesh>;
        })}
      </group>
    </Center>
  );
};

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ avatar, availableParts, onSave, onCancel }) => {
  const [selectedParts, setSelectedParts] = useState<Record<AvatarPartType, string>>({ ...avatar.customization });
  const [selectedCategory, setSelectedCategory] = useState<AvatarPartType | null>(null);
  const balance = xpSystem.getBalance(avatar.agentId) || { totalXP: 0, availableXP: 0, level: 1, xpToNextLevel: 100 };
  
  const handlePartSelect = useCallback((type: AvatarPartType, partId: string) => {
    setSelectedParts(prev => ({ ...prev, [type]: partId }));
    setSelectedCategory(null);
  }, []);
  
  const getPartsByType = (type: AvatarPartType) => availableParts.filter(p => p.type === type);
  const canAfford = (part: AvatarPart) => !part.price || balance.availableXP >= part.price;
  const selectedPartsCount = Object.values(selectedParts).filter(Boolean).length;
  const totalParts = PART_CATEGORIES.length;
  
  const containerStyle: React.CSSProperties = { display: 'flex', height: '100%', gap: '20px', padding: '20px', background: '#1a1a2e' };
  const previewStyle: React.CSSProperties = { flex: 1, background: '#16213e', borderRadius: '8px', padding: '15px' };
  const panelStyle: React.CSSProperties = { width: '300px', background: '#16213e', borderRadius: '8px', padding: '15px' };
  const canvasStyle: React.CSSProperties = { height: '500px', background: '#0f3460', borderRadius: '4px' };
  const categoryStyle: React.CSSProperties = { border: '1px solid #0f3460', borderRadius: '4px', padding: '8px' };
  
  return (
    <div style={containerStyle}>
      <div style={previewStyle}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Avatar Preview</h3>
        <div style={canvasStyle}>
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset={'city'} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <AvatarPreview avatar={avatar} customization={selectedParts} availableParts={availableParts} />
          </Canvas>
        </div>
      </div>
      <div style={panelStyle}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Customize</h3>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>XP Available</div>
          <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>{balance.availableXP} XP</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '400px', overflowY: 'auto' }}>
          {PART_CATEGORIES.map(category => {
            const parts = getPartsByType(category);
            const selectedPartId = selectedParts[category];
            const selectedPart = availableParts.find(p => p.id === selectedPartId);
            return (
              <div key={category} style={categoryStyle}>
                <div onClick={() => setSelectedCategory(selectedCategory === category ? null : category)} style={{ cursor: 'pointer', color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                {selectedCategory === category && parts.map(part => {
                  const isSelected = selectedPartId === part.id;
                  const canAff = canAfford(part);
                  return (
                    <div key={part.id} onClick={() => canAff && handlePartSelect(category, part.id)} style={{
                      padding: '6px 10px', borderRadius: '4px', background: isSelected ? '#0f3460' : '#1a1a2e',
                      color: isSelected ? '#fff' : canAff ? '#aaa' : '#666', cursor: canAff ? 'pointer' : 'not-allowed',
                      border: part.isNFT ? '1px solid #FFD700' : 'none', fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{part.name}</span>{part.price && <span>{part.price} XP</span>}
                      </div>
                      <div style={{ fontSize: '10px', color: RARITY_COLORS[part.rarity] }}>{part.rarity}</div>
                    </div>
                  );
                })}
                {selectedPart && <div style={{ marginTop: '5px', padding: '5px', background: '#0f3460', borderRadius: '4px', fontSize: '11px' }}>
                  <div>Selected: {selectedPart.name}</div><div style={{ color: RARITY_COLORS[selectedPart.rarity] }}>{selectedPart.rarity}</div>
                </div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={() => onSave(selectedParts)} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          {onCancel && <button onClick={onCancel} style={{ flex: 1, padding: '10px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;