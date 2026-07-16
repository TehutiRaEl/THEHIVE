/**
 * 3D Chat Bubble Component for THEHIVE
 */

import React, { useState, useEffect, useRef } from 'react';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

import { ChatBubble as ChatBubbleType } from './types';
import { Position3D } from '../worlds/types';

interface ChatBubbleProps {
  bubble: ChatBubbleType;
  onDismiss?: (bubbleId: string) => void;
  colorScheme?: {
    background: number;
    text: number;
    border: number;
  };
}

const DEFAULT_COLORS = {
  background: 0x1a1a2e,
  text: 0xffffff,
  border: 0x4a4a8a,
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ bubble, onDismiss, colorScheme = DEFAULT_COLORS }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    setScale(1);
    const timer = setTimeout(() => {
      if (bubble.autoDismiss && onDismiss) {
        onDismiss(bubble.id);
      }
    }, bubble.dismissTimer);

    return () => clearTimeout(timer);
  }, [bubble.id]);

  useEffect(() => {
    if (!bubble.isVisible) {
      setOpacity(0);
      setTimeout(() => setScale(0), 300);
    }
  }, [bubble.isVisible]);

  if (scale === 0) return null;

  const width = Math.min(4, Math.max(1, bubble.message.content.length * 0.1));
  const height = 0.5;

  return (
    <group position={bubble.position} scale={[scale, scale, scale]}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial
          color={colorScheme.background}
          transparent={true}
          opacity={opacity}
          side={THREE.DoubleSide}
        />
        <Text
          position={[0, 0, 0.06]}
          color={colorScheme.text}
          fontSize={0.18}
          maxWidth={width - 0.4}
          lineHeight={1.2}
          letterSpacing={0.01}
          textAlign={'left'}
          anchorX={'left'}
          anchorY={'middle'}
        >
          {bubble.message.senderName}: {bubble.message.content}
        </Text>
      </mesh>
      
      
      
    </group>
  );
};

interface ChatBubbleCanvasProps {
  bubbles: ChatBubbleType[];
  onDismiss?: (bubbleId: string) => void;
}

export const ChatBubbleCanvas: React.FC<ChatBubbleCanvasProps> = ({ bubbles, onDismiss }) => {
  return <>{bubbles.map(bubble => (
    <ChatBubble key={bubble.id} bubble={bubble} onDismiss={onDismiss} />
  ))}</>;
};