---
name: "thehive-floating-menu"
title: "THE HIVE - Floating Menu Hub (Anime MMO Style)"
type: "react"
---

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ============================================================================
// ANIME MMO FLOATING MENU SYSTEM
// Inspired by: Log Horizon, Sword Art Online, VRChat, Ready Player One
// ============================================================================

// Color Palette - Anime MMO Style
const colors = {
  primary: '#00FFFF',
  primaryDark: '#00BFFF',
  primaryLight: '#7FFFD4',
  secondary: '#9D00FF',
  secondaryDark: '#8000FF',
  secondaryLight: '#C677FF',
  accent: '#FF6B00',
  accentLight: '#FF8C42',
  success: '#00FF88',
  danger: '#FF3366',
  bgDark: '#0A0A1A',
  bgDarker: '#050510',
  bgCard: 'rgba(10, 20, 40, 0.9)',
  bgCardHover: 'rgba(20, 40, 60, 0.95)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0C4E8',
  textTertiary: '#70A0C0',
  border: 'rgba(0, 255, 255, 0.3)',
  borderBright: 'rgba(0, 255, 255, 0.6)',
  glowPrimary: '0 0 20px rgba(0, 255, 255, 0.5)',
  glowSecondary: '0 0 20px rgba(157, 0, 255, 0.5)',
};

// ============================================================================
// 3D FLOATING MENU COMPONENTS
// ============================================================================

// Main Hub Portal - Floating in 3D space
function HubPortal({ position, onOpen }: { position: [number, number, number], onOpen: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.1, 32, 64]} />
        <meshStandardMaterial
          color={colors.primary}
          emissive={colors.primary}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={0.6}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0, 0]} color={colors.primary} intensity={2} distance={10} />
      <Html center distanceFactor={10}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
            letterSpacing: 2,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
          }}
        >
          MENU HUB
        </motion.div>
      </Html>
    </group>
  );
}

// Floating Menu Panel
function FloatingMenuPanel({
  position,
  isOpen,
  onClose,
  onNavigate
}: {
  position: [number, number, number],
  isOpen: boolean,
  onClose: () => void,
  onNavigate: (section: string) => void
}) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'profile', label: 'PROFILE', icon: '👤', color: colors.primary },
    { id: 'quests', label: 'QUESTS', icon: '🎯', color: colors.accent },
    { id: 'inventory', label: 'INVENTORY', icon: '🎒', color: colors.secondary },
    { id: 'social', label: 'SOCIAL', icon: '👥', color: colors.success },
    { id: 'crafting', label: 'CRAFTING', icon: '🔨', color: colors.primaryLight },
    { id: 'shop', label: 'SHOP', icon: '💰', color: colors.accent },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️', color: colors.textSecondary },
    { id: 'world', label: 'WORLD MAP', icon: '🗺️', color: colors.secondaryLight },
  ];

  return (
    <group position={[position[0], position[1] - 0.5, position[2] - 2]}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial
          color={colors.bgCard}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[6.1, 4.1]} />
        <meshBasicMaterial color={colors.primary} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <Html center distanceFactor={10} occlude="blending">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 600,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 16,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                color: colors.primary,
                fontSize: 20,
                fontWeight: 'bold',
                letterSpacing: 3,
                textShadow: `0 0 10px ${colors.primary}`,
              }}
            >
              THE HIVE
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                color: colors.textSecondary,
                fontSize: 24,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ×
            </motion.button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 20px ${item.color}40` }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: colors.textPrimary,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  color: item.color,
                  textShadow: `0 0 5px ${item.color}`,
                }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            paddingTop: 16,
            borderTop: `1px solid ${colors.border}`,
          }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div style={{ color: colors.textSecondary, fontSize: 10 }}>LEVEL</div>
              <div style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}>99</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div style={{ color: colors.textSecondary, fontSize: 10 }}>XP</div>
              <div style={{ color: colors.accent, fontSize: 18, fontWeight: 'bold' }}>12,345</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div style={{ color: colors.textSecondary, fontSize: 10 }}>PLAYERS</div>
              <div style={{ color: colors.success, fontSize: 18, fontWeight: 'bold' }}>1,234</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <div style={{ color: colors.textSecondary, fontSize: 10 }}>TIME</div>
              <div style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>23:45</div>
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              marginTop: 24,
              background: 'rgba(255,255,255,0.05)',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              cursor: 'pointer',
              textAlign: 'center',
              color: 'white',
              fontWeight: 'medium'
            }}
          >
            Close
          </motion.button>
        </motion.div>
      </Html>
    </group>
  );
}

// ============================================================================
// SUB-PANELS
// ============================================================================

// Profile Panel
function ProfilePanel({ onBack }: { onBack: () => void }) {
  const stats = [
    { label: 'LEVEL', value: '99', color: colors.primary },
    { label: 'TITLE', value: 'CRUSADER', color: colors.accent },
    { label: 'XP', value: '12,345 / 15,000', color: colors.secondary },
    { label: 'PLAYTIME', value: '234 HOURS', color: colors.success },
  ];

  const abilities = [
    { name: 'RANGED ATTACK', level: 'MAX', progress: 100 },
    { name: 'MELEE DEFENSE', level: '85', progress: 85 },
    { name: 'MAGIC RESIST', level: '72', progress: 72 },
    { name: 'STEALTH', level: '45', progress: 45 },
    { name: 'CRAFTING', level: '90', progress: 90 },
    { name: 'TRADING', level: '68', progress: 68 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.bgDarker,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ← BACK
        </motion.button>
        <h2 style={{
          color: colors.primary,
          fontSize: 24,
          fontWeight: 'bold',
          letterSpacing: 3,
        }}>
          PROFILE
        </h2>
        <div />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 24,
        flex: 1,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${colors.primary}`,
              boxShadow: `0 0 30px ${colors.primary}40`,
            }}
          >
            <span style={{ fontSize: 72 }}>👤</span>
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>PLAYER NAME</div>
            <div style={{ color: colors.textSecondary, fontSize: 12 }}>Level 99 Crusader</div>
          </div>
          <div style={{
            padding: '8px 16px',
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
            borderRadius: 8,
            border: `1px solid ${colors.accent}`,
            boxShadow: `0 0 15px ${colors.accent}40`,
          }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>CRUSADER</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                style={{
                  background: colors.bgCard,
                  padding: 16,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ color: stat.color, fontSize: 18, fontWeight: 'bold' }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
          <div style={{
            flex: 1,
            background: colors.bgCard,
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
          }}>
            <h3 style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: 1,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: `1px solid ${colors.border}`,
            }}>
              ABILITIES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {abilities.map((ability, index) => (
                <motion.div
                  key={ability.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 80, color: colors.textSecondary, fontSize: 10 }}>{ability.name}</div>
                  <div style={{
                    flex: 1,
                    height: 8,
                    background: colors.bgDarker,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${ability.progress}%`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{
                    width: 40,
                    textAlign: 'right',
                    color: colors.textPrimary,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {ability.level}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 24,
        padding: 16,
        background: colors.bgCard,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
      }}>
        <h3 style={{
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: 'bold',
          letterSpacing: 1,
          marginBottom: 12,
        }}>
          EQUIPMENT
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {['head', 'chest', 'legs', 'feet', 'weapon', 'shield', 'accessory'].map((slot, index) => (
            <motion.div
              key={slot}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              style={{
                aspectRatio: 1,
                background: colors.bgDarker,
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.05, borderColor: colors.primary }}
            >
              <span style={{ fontSize: 24 }}>
                {slot === 'head' ? '🪖' :
                 slot === 'chest' ? '🛡️' :
                 slot === 'legs' ? '🩳' :
                 slot === 'feet' ? '👟' :
                 slot === 'weapon' ? '⚔️' :
                 slot === 'shield' ? '🛡️' : '💍'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        style={{
          marginTop: 24,
          background: 'rgba(255,255,255,0.05)',
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'white',
          fontWeight: 'medium'
        }}
      >
        Back
      </motion.button>
    </motion.div>
  );
}

// Quests Panel
function QuestsPanel({ onBack }: { onBack: () => void }) {
  const activeQuests = [
    {
      id: 'main-001',
      name: 'DEFEAT THE DRAGON KING',
      type: 'MAIN',
      level: 90,
      progress: 65,
      description: 'Defeat the Dragon King in the Abyssal Dungeon',
      reward: '50,000 XP + Legendary Weapon',
    },
    {
      id: 'side-005',
      name: 'COLLECT RARE HERBS',
      type: 'SIDE',
      level: 45,
      progress: 30,
      description: 'Gather 50 Rare Herbs from the Enchanted Forest',
      reward: '5,000 XP + Healing Potions',
    },
  ];

  const availableQuests = [
    {
      id: 'main-002',
      name: 'EXPLORE THE ABYSS',
      type: 'MAIN',
      level: 95,
      description: 'Discover the secrets of the Abyssal Depths',
      reward: '75,000 XP + Rare Mount',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.bgDarker,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ← BACK
        </motion.button>
        <h2 style={{ color: colors.accent, fontSize: 24, fontWeight: 'bold', letterSpacing: 3 }}>QUESTS</h2>
        <div />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1 }}>
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: `1px solid ${colors.accent}`,
            }}
          >
            ACTIVE QUESTS
          </motion.h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${colors.accent}40` }}
                style={{
                  background: colors.bgCard,
                  padding: 16,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        padding: '2px 6px',
                        background: quest.type === 'MAIN' ? colors.accent : colors.secondary,
                        borderRadius: 4,
                        fontSize: 8,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                        {quest.type}
                      </span>
                      <span style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 'bold' }}>{quest.name}</span>
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: 10 }}>Level {quest.level} Required</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: colors.textSecondary, fontSize: 10 }}>{quest.progress}% Complete</div>
                  </div>
                </div>
                <div style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 8 }}>{quest.description}</div>
                <div style={{ color: colors.success, fontSize: 10 }}>Reward: {quest.reward}</div>
                <div style={{
                  height: 4,
                  background: colors.bgDarker,
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 8,
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quest.progress}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 1 }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentLight})`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            AVAILABLE QUESTS
          </motion.h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {availableQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${colors.primary}40` }}
                style={{
                  background: colors.bgCard,
                  padding: 16,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 6px',
                    background: quest.type === 'MAIN' ? colors.accent : colors.secondary,
                    borderRadius: 4,
                    fontSize: 8,
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                    {quest.type}
                  </span>
                  <span style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 'bold' }}>{quest.name}</span>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 8 }}>Level {quest.level} Required</div>
                <div style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 8 }}>{quest.description}</div>
                <div style={{ color: colors.primary, fontSize: 10 }}>Reward: {quest.reward}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        style={{
          marginTop: 24,
          background: 'rgba(255,255,255,0.05)',
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'white',
          fontWeight: 'medium'
        }}
      >
        Close
      </motion.button>
    </motion.div>
  );
}

// Inventory Panel
function InventoryPanel({ onBack }: { onBack: () => void }) {
  const categories = ['ALL', 'WEAPONS', 'ARMOR', 'CONSUMABLES', 'CRAFTING', 'QUEST', 'MISC'];
  const [activeCategory, setActiveCategory] = useState('ALL');

  const items = [
    { id: 'wpn-001', name: 'DRAGON SLAYER', type: 'WEAPON', rarity: 'LEGENDARY', icon: '⚔️', level: 99 },
    { id: 'arm-001', name: 'DRAGON SCALE ARMOR', type: 'ARMOR', rarity: 'LEGENDARY', icon: '🛡️', level: 99 },
    { id: 'con-001', name: 'HEALING POTION', type: 'CONSUMABLE', rarity: 'COMMON', icon: '💊', level: 1 },
    { id: 'cft-001', name: 'DIAMOND ORE', type: 'CRAFTING', rarity: 'RARE', icon: '✨', level: 50 },
  ];

  const filteredItems = activeCategory === 'ALL' ? items : items.filter(item => item.type === activeCategory);

  const getRarityColor = (rarity: string) => {
    const rarityColors: Record<string, string> = {
      COMMON: '#888888',
      UNCOMMON: '#00AA00',
      RARE: '#0000FF',
      EPIC: '#AA00FF',
      LEGENDARY: '#FFAA00',
    };
    return rarityColors[rarity]  | '#FFFFFF';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.bgDarker,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ← BACK
        </motion.button>
        <h2 style={{ color: colors.secondary, fontSize: 24, fontWeight: 'bold', letterSpacing: 3 }}>INVENTORY</h2>
        <div />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(category => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: '8px 16px',
              background: activeCategory === category ? colors.secondary : 'transparent',
              border: `1px solid ${activeCategory === category ? colors.secondary : colors.border}`,
              borderRadius: 8,
              color: activeCategory === category ? 'white' : colors.textSecondary,
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          >
            {category}
          </motion.button>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 12,
        flex: 1,
        overflowY: 'auto',
      }}>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: `0 0 20px ${getRarityColor(item.rarity)}40` }}
            style={{
              background: colors.bgCard,
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${getRarityColor(item.rarity)}40`,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
            <div style={{
              color: getRarityColor(item.rarity),
              fontSize: 10,
              fontWeight: 'bold',
              textShadow: `0 0 5px ${getRarityColor(item.rarity)}`,
              marginBottom: 4,
            }}>
              {item.name}
            </div>
            <div style={{
              background: `${getRarityColor(item.rarity)}40`,
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 8,
              color: getRarityColor(item.rarity),
              fontWeight: 'bold',
            }}>
              {item.rarity}
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{
        marginTop: 24,
        padding: 16,
        background: colors.bgCard,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
      }}>
        <h3 style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 }}>
          ITEM DETAILS
        </h3>
        <p style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center' }}>
          Click on an item to view detailed information
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        style={{
          marginTop: 24,
          background: 'rgba(255,255,255,0.05)',
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'white',
          fontWeight: 'medium'
        }}
      >
        Close
      </motion.button>
    </motion.div>
  );
}

// Social Panel
function SocialPanel({ onBack }: { onBack: () => void }) {
  const friends = [
    { id: 'fr-001', name: 'Ash Ketchum', level: 95, status: 'ONLINE', class: 'SWORDMASTER', avatar: '👤' },
    { id: 'fr-002', name: 'Luna Star', level: 88, status: 'ONLINE', class: 'MAGE', avatar: '👤' },
    { id: 'fr-003', name: 'Dark Knight', level: 92, status: 'OFFLINE', class: 'TANK', avatar: '👤' },
  ];
  const [activeTab, setActiveTab] = useState('FRIENDS');
  const tabs = ['FRIENDS', 'PARTY', 'GUILD', 'WHISPERS'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.bgDarker,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ← BACK
        </motion.button>
        <h2 style={{ color: colors.success, fontSize: 24, fontWeight: 'bold', letterSpacing: 3 }}>SOCIAL</h2>
        <div />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(tab => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab ? colors.success : 'transparent',
              border: `1px solid ${activeTab === tab ? colors.success : colors.border}`,
              borderRadius: 8,
              color: activeTab === tab ? 'black' : colors.textSecondary,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          >
            {tab}
          </motion.button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        {friends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${colors.success}40` }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              background: colors.bgCard,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              border: `2px solid ${friend.status === 'ONLINE' ? colors.success : colors.textTertiary}`,
              boxShadow: friend.status === 'ONLINE' ? `0 0 15px ${colors.success}40` : 'none',
            }}>
              {friend.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <div style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 'bold' }}>{friend.name}</div>
                <span style={{
                  padding: '4px 8px',
                  background: friend.status === 'ONLINE' ? colors.success :
                             friend.status === 'IDLE' ? colors.accent : colors.textTertiary,
                  borderRadius: 4,
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: friend.status === 'ONLINE' || friend.status === 'IDLE' ? 'black' : colors.textSecondary,
                }}>
                  {friend.status}
                </span>
              </div>
              <div style={{ color: colors.textSecondary, fontSize: 10 }}>Level {friend.level} {friend.class}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: 8,
                background: colors.bgDarker,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                color: colors.textSecondary,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              WHISPER
            </motion.button>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1,
            padding: 16,
            background: colors.success,
            border: 'none',
            borderRadius: 8,
            color: 'black',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          ADD FRIEND
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1,
            padding: 16,
            background: colors.primary,
            border: 'none',
            borderRadius: 8,
            color: 'black',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          CREATE PARTY
        </motion.button>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        style={{
          marginTop: 24,
          background: 'rgba(255,255,255,0.05)',
          padding: 12,
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'white',
          fontWeight: 'medium'
        }}
      >
        Close
      </motion.button>
    </motion.div>
  );
}

// Main App Component
export default function App() {
  const [activePanel, setActivePanel] = useState<'menu' | 'profile' | 'quests' | 'inventory' | 'social' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (section: string) => {
    setActivePanel(section as any);
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    setActivePanel(null);
    setIsMenuOpen(true);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'profile': return <ProfilePanel onBack={handleBack} />;
      case 'quests': return <QuestsPanel onBack={handleBack} />;
      case 'inventory': return <InventoryPanel onBack={handleBack} />;
      case 'social': return <SocialPanel onBack={handleBack} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 72, marginBottom: 16, textShadow: `0 0 30px ${colors.primary}` }}>
            🏰
          </motion.div>
          <h1 style={{ color: colors.primary, fontSize: 48, fontWeight: 'bold', letterSpacing: 8, marginBottom: 8 }}>THE HIVE</h1>
          <p style={{ color: colors.textSecondary, fontSize: 16, letterSpacing: 3 }}>LOADING FLOATING MENU...</p>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ marginTop: 16, color: colors.textTertiary, fontSize: 12, letterSpacing: 2 }}>
            INITIALIZING SYSTEMS
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }} gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={60} />
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={50} maxPolarAngle={Math.PI / 2 - 0.1} enablePan={false} />
        <color attach="background" args={['#000011']} />
        <fog attach="fog" args={['#000011', 10, 50]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 10]} intensity={0.5} color={colors.primary} />
        <directionalLight position={[-10, 20, -10]} intensity={0.3} color={colors.secondary} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#000022" roughness={1} metalness={0.1} />
        </mesh>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (Math.random() - 0.5) * 100;
          const y = Math.random() * 20 + 1;
          const z = (Math.random() - 0.5) * 100;
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.3 + Math.random() * 0.5, 8, 8]} />
              <meshStandardMaterial
                color={Math.random() > 0.5 ? colors.primary : colors.secondary}
                emissive={Math.random() > 0.5 ? colors.primary : colors.secondary}
                emissiveIntensity={0.5 + Math.random() * 0.5}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
        <HubPortal position={[0, 1, 0]} onOpen={() => setIsMenuOpen(true)} />
        {isMenuOpen && (
          <FloatingMenuPanel
            position={[0, 1, -3]}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onNavigate={handleNavigate}
          />
        )}
      </Canvas>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', perspective: 1000 }}>
        <AnimatePresence>
          {activePanel && renderPanel()}
        </AnimatePresence>
      </div>
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '12px 24px',
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ display: 'flex', gap: 24, color: colors.textSecondary, fontSize: 12, letterSpacing: 1 }}>
            <div><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4, marginRight: 8 }}>E</kbd> Open Menu</div>
            <div><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4, marginRight: 8 }}>ESC</kbd> Close</div>
            <div><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4, marginRight: 8 }}>1-4</kbd> Quick Select</div>
          </div>
        </motion.div>
      </div>
      <div style={{ position: 'fixed', top: 24, right: 24, pointerEvents: 'auto' }}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 }} style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.textPrimary, fontSize: 12 }}>
            <span style={{ color: colors.success, fontSize: 10 }}>●</span>
            <span>ONLINE</span>
            <span style={{ color: colors.textTertiary }}>{new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
