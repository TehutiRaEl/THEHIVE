/**
 * 3D Conversation View Component for THEHIVE
 */

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';

import { conversationManager } from './ConversationManager';
import { ChatBubbleCanvas } from './ChatBubble';
import { ConversationMode, ChatBubble as ChatBubbleType } from './types';
import { SandboxAgent, Position3D } from '../worlds/types';

interface ConversationViewProps {
  agents: SandboxAgent[];
  mode: ConversationMode;
  onModeChange?: (mode: ConversationMode) => void;
  cameraPosition?: Position3D;
  environment?: string;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  agents,
  mode,
  onModeChange,
  cameraPosition = { x: 0, y: 2, z: 5 },
  environment = 'city',
}) => {
  const [bubbles, setBubbles] = useState<ChatBubbleType[]>([]);
  const [focusedAgent, setFocusedAgent] = useState<SandboxAgent | null>(null);
  const [cameraTarget, setCameraTarget] = useState<Position3D | null>(null);

  useEffect(() => {
    const unsubscribe = conversationManager.onEvent(event => {
      if (event.type === 'message_sent' || event.type === 'message_received') {
        setBubbles(conversationManager.getChatBubbles());
      }
      if (event.type === 'avatar_focused') {
        const agent = agents.find(a => a.id === event.avatarId);
        if (agent) {
          setFocusedAgent(agent);
          setCameraTarget(agent.position);
        }
      }
    });

    return () => unsubscribe();
  }, [agents]);

  useEffect(() => {
    agents.forEach(agent => {
      conversationManager.updateAgentPosition(agent.id, agent.position);
    });
  }, [agents]);

  const handleDismiss = (bubbleId: string) => {
    conversationManager.dismissBubble(bubbleId);
    setBubbles(conversationManager.getChatBubbles());
  };

  const handleAgentClick = (agent: SandboxAgent) => {
    setFocusedAgent(agent);
    setCameraTarget(agent.position);
    conversationManager.focusOnAvatar(agent.id);
  };

  const toggleMode = () => {
    const modes: ConversationMode[] = ['3d', '2d', 'voice'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    if (onModeChange) onModeChange(newMode);
    conversationManager.setConversationMode(newMode);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [cameraPosition.x, cameraPosition.y, cameraPosition.z], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Environment preset={environment} />
        <PerspectiveCamera makeDefault position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]} />

        {cameraTarget && (
          <OrbitControls
            target={[cameraTarget.x, cameraTarget.y + 1, cameraTarget.z]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={20}
          />
        )}

        <ChatBubbleCanvas bubbles={bubbles} onDismiss={handleDismiss} />

        {agents.map(agent => (
          <group
            key={agent.id}
            position={[agent.position.x, agent.position.y, agent.position.z]}
            onClick={(e) => {
              e.stopPropagation();
              handleAgentClick(agent);
            }}
          >
          </group>
        ))}

        <gridHelper args={[50, 50, 0x333333, 0x333333]} />
      </Canvas>

      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 100 }}>
        <button onClick={toggleMode} style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '4px' }}>
          Mode: {mode.toUpperCase()}
        </button>
      </div>

      {focusedAgent && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'white', background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px' }}>
          <strong>Focused: {focusedAgent.name}</strong>
          <div>Level: {focusedAgent.level}</div>
          <div>Status: {focusedAgent.status}</div>
        </div>
      )}
    </div>
  );
};

export default ConversationView;