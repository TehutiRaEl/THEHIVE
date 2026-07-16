/**
 * Conversation Manager for 3D Chat in THEHIVE
 */

import {
  ChatMessage,
  ChatBubble,
  ConversationSession,
  ConversationMode,
  ConversationUIState,
  VoiceChatState,
  ConversationEvent,
  ConversationEventHandler,
  CAMERA_PRESETS,
  AvatarExpression
} from './types';

import { Position3D, SandboxAgent } from '../worlds/types';

export class ConversationManager {
  private sessions: Map<string, ConversationSession> = new Map();
  private chatBubbles: Map<string, ChatBubble> = new Map();
  private uiState: ConversationUIState = {
    chatBubbles: [],
    isChatOpen: false,
    voiceState: { isMuted: false, isSpeaking: false, volume: 1.0 },
  };
  private eventHandlers: ConversationEventHandler[] = [];
  private agentPositions: Map<string, Position3D> = new Map();

  constructor() {
    this.setupVoiceRecognition();
  }

  // ========== Session Management ==========

  startConversation(participants: string[], mode: ConversationMode = '3d'): ConversationSession {
    const id = this.generateId('session');
    const session: ConversationSession = {
      id,
      participants: [...new Set(participants)],
      messages: [],
      isActive: true,
      mode,
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    this.uiState.activeSession = session;
    this.emitEvent({ type: 'conversation_started', session });
    return session;
  }

  endConversation(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.isActive = false;
    this.sessions.delete(sessionId);
    if (this.uiState.activeSession?.id === sessionId) {
      this.uiState.activeSession = undefined;
    }
    this.emitEvent({ type: 'conversation_ended', sessionId });
    return true;
  }

  getActiveSession(): ConversationSession | undefined {
    return this.uiState.activeSession;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  // ========== Message Handling ==========

  sendMessage(senderId: string, senderName: string, content: string, type: 'text' | 'voice' = 'text'): ChatMessage {
    const session = this.uiState.activeSession || this.getOrCreateSession([senderId]);
    const message: ChatMessage = {
      id: this.generateId('msg'),
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      type,
    };
    session.messages.push(message);
    session.lastMessageAt = message.timestamp;
    this.sessions.set(session.id, session);

    this.emitEvent({ type: 'message_sent', message });
    this.createChatBubble(message, senderId);
    this.updateAgentExpression(senderId, 'talking');

    return message;
  }

  receiveMessage(message: ChatMessage): void {
    const session = this.uiState.activeSession || this.getOrCreateSession([message.senderId]);
    session.messages.push(message);
    session.lastMessageAt = message.timestamp;
    this.sessions.set(session.id, session);

    this.emitEvent({ type: 'message_received', message });
    this.createChatBubble(message, message.senderId);
    this.updateAgentExpression(message.senderId, this.getEmotionFromMessage(message.content));
  }

  private getOrCreateSession(participants: string[]): ConversationSession {
    for (const session of this.sessions.values()) {
      if (session.isActive && participants.every(p => session.participants.includes(p))) {
        return session;
      }
    }
    return this.startConversation(participants);
  }

  // ========== Chat Bubbles ==========

  createChatBubble(message: ChatMessage, senderId: string): ChatBubble {
    const position = this.agentPositions.get(senderId) || { x: 0, y: 2, z: 0 };
    const bubble: ChatBubble = {
      id: this.generateId('bubble'),
      message,
      position: { ...position, y: position.y + 1.5 },
      avatarId: senderId,
      autoDismiss: true,
      dismissTimer: 5000,
      isVisible: true,
    };
    this.chatBubbles.set(bubble.id, bubble);
    this.uiState.chatBubbles.push(bubble);

    if (bubble.autoDismiss) {
      setTimeout(() => this.dismissBubble(bubble.id), bubble.dismissTimer);
    }

    return bubble;
  }

  dismissBubble(bubbleId: string): boolean {
    const bubble = this.chatBubbles.get(bubbleId);
    if (!bubble) return false;
    bubble.isVisible = false;
    this.chatBubbles.delete(bubbleId);
    this.uiState.chatBubbles = this.uiState.chatBubbles.filter(b => b.id !== bubbleId);
    return true;
  }

  getChatBubbles(): ChatBubble[] {
    return Array.from(this.chatBubbles.values());
  }

  // ========== Agent Tracking ==========

  updateAgentPosition(agentId: string, position: Position3D): void {
    this.agentPositions.set(agentId, position);
  }

  getAgentPosition(agentId: string): Position3D | undefined {
    return this.agentPositions.get(agentId);
  }

  private updateAgentExpression(agentId: string, emotion: AvatarExpression): void {
    setTimeout(() => {
      this.emitEvent({
        type: 'avatar_focused',
        avatarId: agentId,
      } as any);
    }, 100);
  }

  private getEmotionFromMessage(content: string): AvatarExpression {
    const lower = content.toLowerCase();
    if (lower.includes('happy') || lower.includes('great') || lower.includes('awesome')) return 'happy';
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('hate')) return 'angry';
    if (lower.includes('sad') || lower.includes('unfortunately') || lower.includes('sorry')) return 'sad';
    if (lower.includes('wow') || lower.includes('surprised') || lower.includes('really')) return 'surprised';
    return 'neutral';
  }

  // ========== Camera Control ==========

  focusOnAvatar(avatarId: string, preset: keyof typeof CAMERA_PRESETS = 'medium'): void {
    const position = this.agentPositions.get(avatarId);
    if (!position) return;

    const cameraPreset = CAMERA_PRESETS[preset];
    this.uiState.cameraTarget = position;
    this.uiState.focusedAvatarId = avatarId;

    this.emitEvent({ type: 'avatar_focused', avatarId });
  }

  resetCamera(): void {
    this.uiState.cameraTarget = undefined;
    this.uiState.focusedAvatarId = undefined;
  }

  // ========== Mode Switching ==========

  setConversationMode(mode: ConversationMode): void {
    this.uiState.mode = mode;
    if (mode === 'voice') {
      this.startVoiceChat();
    } else {
      this.stopVoiceChat();
    }
    this.emitEvent({ type: 'mode_changed', mode });
  }

  toggleChat(): void {
    this.uiState.isChatOpen = !this.uiState.isChatOpen;
  }

  // ========== Voice Chat ==========

  private voiceState: VoiceChatState = { isMuted: false, isSpeaking: false, volume: 1.0 };

  setupVoiceRecognition(): void {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.sendMessage('user', 'You', transcript, 'voice');
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error', event.error);
    };

    this.voiceRecognition = recognition;
  }

  private voiceRecognition: any;

  startVoiceChat(): void {
    if (!this.voiceRecognition || this.voiceState.isSpeaking) return;
    try {
      this.voiceRecognition.start();
      this.voiceState.isSpeaking = true;
      this.emitEvent({ type: 'voice_started' });
    } catch (e) {
      console.error('Failed to start voice chat', e);
    }
  }

  stopVoiceChat(): void {
    if (!this.voiceRecognition || !this.voiceState.isSpeaking) return;
    try {
      this.voiceRecognition.stop();
      this.voiceState.isSpeaking = false;
      this.emitEvent({ type: 'voice_stopped' });
    } catch (e) {
      console.error('Failed to stop voice chat', e);
    }
  }

  toggleMute(): void {
    this.voiceState.isMuted = !this.voiceState.isMuted;
  }

  setVolume(volume: number): void {
    this.voiceState.volume = Math.max(0, Math.min(1, volume));
  }

  // ========== Event System ==========

  onEvent(handler: ConversationEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  private emitEvent(event: ConversationEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('Event handler error', e);
      }
    });
  }

  // ========== UI State ==========

  getUIState(): ConversationUIState {
    return { ...this.uiState };
  }

  getVoiceState(): VoiceChatState {
    return { ...this.voiceState };
  }

  // ========== Utility ==========

  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  clearAll(): void {
    this.sessions.clear();
    this.chatBubbles.clear();
    this.uiState.chatBubbles = [];
    this.uiState.activeSession = undefined;
    this.agentPositions.clear();
  }
}

export const conversationManager = new ConversationManager();