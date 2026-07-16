/**
 * 3D Conversation System Types for THEHIVE
 */

import { Position3D, SandboxAgent, SandboxAvatar } from '../worlds/types';

// Conversation modes
export type ConversationMode = '3d' | '2d' | 'voice';

// Message types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'system';
  emotion?: string;
  metadata?: Record<string, any>;
}

// 3D Chat Bubble
export interface ChatBubble {
  id: string;
  message: ChatMessage;
  position: Position3D;
  avatarId?: string;
  autoDismiss: boolean;
  dismissTimer: number;
  isVisible: boolean;
}

// Conversation session
export interface ConversationSession {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  isActive: boolean;
  mode: ConversationMode;
  startedAt: string;
  lastMessageAt: string;
}

// Voice chat state
export interface VoiceChatState {
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
  deviceId?: string;
}

// Conversation UI state
export interface ConversationUIState {
  activeSession?: ConversationSession;
  chatBubbles: ChatBubble[];
  focusedAvatarId?: string;
  cameraTarget?: Position3D;
  isChatOpen: boolean;
  voiceState: VoiceChatState;
}

// Camera presets for cinematic angles
export type CameraPreset = 'closeup' | 'medium' | 'wide' | 'overShoulder' | 'firstPerson';

export const CAMERA_PRESETS: Record<CameraPreset, { position: Position3D; lookAt: Position3D }> = {
  closeup: { position: { x: 0, y: 1.5, z: 1.5 }, lookAt: { x: 0, y: 1.5, z: 0 } },
  medium: { position: { x: 0, y: 2, z: 3 }, lookAt: { x: 0, y: 1.5, z: 0 } },
  wide: { position: { x: 0, y: 3, z: 5 }, lookAt: { x: 0, y: 1.5, z: 0 } },
  overShoulder: { position: { x: 0.5, y: 1.7, z: 0.5 }, lookAt: { x: 0, y: 1.5, z: 0 } },
  firstPerson: { position: { x: 0, y: 1.7, z: 0.3 }, lookAt: { x: 0, y: 1.5, z: -1 } }
};

// Avatar expression animations
export type AvatarExpression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'focused' | 'talking';

export interface AvatarExpressionMap {
  [emotion: string]: {
    facial: string;
    body: string;
    duration: number;
  };
}

// Conversation events
export type ConversationEvent =
  | { type: 'message_sent'; message: ChatMessage }
  | { type: 'message_received'; message: ChatMessage }
  | { type: 'conversation_started'; session: ConversationSession }
  | { type: 'conversation_ended'; sessionId: string }
  | { type: 'mode_changed'; mode: ConversationMode }
  | { type: 'avatar_focused'; avatarId: string }
  | { type: 'voice_started' }
  | { type: 'voice_stopped' };

export type ConversationEventHandler = (event: ConversationEvent) => void;