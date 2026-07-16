/**
 * Multiplayer Synchronization System for THEHIVE
 * Real-time collaboration using WebRTC and WebSockets
 */

import { Position3D, WorldEntity, SandboxWorld } from './types';
import { worldManager } from './WorldManager';
import { npcManager } from './NPCManager';
import { colonyManager } from './ColonyManager';
import { conversationManager } from '../conversation/ConversationManager';

// Multiplayer connection types
export type ConnectionType = 'websocket' | 'webrtc' | 'peerjs';

// Peer state
export interface PeerState {
  id: string;
  name: string;
  avatarId: string;
  position: Position3D;
  rotation: Position3D;
  status: 'connected' | 'disconnected' | 'connecting';
  ping: number;
  lastUpdate: number;
  dataChannel?: RTCDataChannel;
  peerConnection?: RTCPeerConnection;
}

// Synchronization state
export interface SyncState {
  worldId: string;
  lastSync: number;
  lastReceived: number;
  syncInterval: number;
  isSyncing: boolean;
  pendingChanges: any[];
}

// Multiplayer message types
export type MultiplayerMessage = 
  | { type: 'join'; userId: string; name: string; avatarId: string; position: Position3D }
  | { type: 'leave'; userId: string }
  | { type: 'move'; userId: string; position: Position3D; rotation: Position3D }
  | { type: 'chat'; userId: string; name: string; message: string; timestamp: string }
  | { type: 'entity_create'; entity: WorldEntity }
  | { type: 'entity_update'; entityId: string; updates: Partial<WorldEntity> }
  | { type: 'entity_delete'; entityId: string }
  | { type: 'building_place'; colonyId: string; buildingId: string; position: Position3D }
  | { type: 'building_destroy'; colonyId: string; buildingId: string }
  | { type: 'npc_spawn'; npcId: string; position: Position3D }
  | { type: 'npc_despawn'; npcId: string }
  | { type: 'npc_move'; npcId: string; position: Position3D }
  | { type: 'portal_use'; portalId: string; userId: string }
  | { type: 'sync_request'; userId: string; worldId: string }
  | { type: 'sync_response'; userId: string; worldId: string; state: any }
  | { type: 'ping'; timestamp: number }
  | { type: 'pong'; timestamp: number };

// Multiplayer event types
export type MultiplayerEvent = 
  | { type: 'peer_joined'; peer: PeerState }
  | { type: 'peer_left'; peerId: string }
  | { type: 'peer_moved'; peerId: string; position: Position3D; rotation: Position3D }
  | { type: 'message_received'; peerId: string; message: string; name: string; timestamp: string }
  | { type: 'entity_sync'; entity: WorldEntity }
  | { type: 'building_sync'; colonyId: string; buildingId: string; action: 'place' | 'destroy' }
  | { type: 'npc_sync'; npcId: string; action: 'spawn' | 'despawn' | 'move' }
  | { type: 'sync_complete'; worldId: string }
  | { type: 'connection_error'; error: string };

export type MultiplayerEventHandler = (event: MultiplayerEvent) => void;

// Multiplayer configuration
export interface MultiplayerConfig {
  connectionType: ConnectionType;
  signalingServer?: string;
  stunServers?: string[];
  turnServers?: { url: string; username: string; credential: string }[];
  syncInterval: number; // In milliseconds
  maxPeers: number;
  enableRelay: boolean;
}

const DEFAULT_CONFIG: MultiplayerConfig = {
  connectionType: 'websocket',
  signalingServer: 'wss://your-signaling-server.com',
  stunServers: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
  syncInterval: 100,
  maxPeers: 20,
  enableRelay: true,
};

// ICE server configuration
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export class MultiplayerManager {
  private config: MultiplayerConfig;
  private peers: Map<string, PeerState> = new Map();
  private syncStates: Map<string, SyncState> = new Map();
  private eventHandlers: MultiplayerEventHandler[] = [];
  private socket: WebSocket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private localUserId: string = '';
  private localName: string = '';
  private localAvatarId: string = '';
  private isConnected: boolean = false;

  constructor(config: Partial<MultiplayerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  // Initialize multiplayer system
  private initialize(): void {
    this.localUserId = this.generateId('user');
    this.localName = 'Player ' + this.localUserId.slice(0, 4);
    this.localAvatarId = this.generateId('avatar');

    if (this.config.connectionType === 'websocket') {
      this.connectWebSocket();
    } else if (this.config.connectionType === 'webrtc') {
      this.setupWebRTC();
    }
  }

  // Connect to WebSocket signaling server
  private connectWebSocket(): void {
    try {
      this.socket = new WebSocket(this.config.signalingServer || '');

      this.socket.onopen = () => {
        this.isConnected = true;
        this.sendWebSocketMessage({
          type: 'join',
          userId: this.localUserId,
          name: this.localName,
          avatarId: this.localAvatarId,
          position: { x: 0, y: 0, z: 0 },
        });
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const message: MultiplayerMessage = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.peers.clear();
        console.log('WebSocket disconnected');
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emitEvent({ type: 'connection_error', error: error.message });
      };
    } catch (e) {
      console.error('Failed to connect WebSocket:', e);
    }
  }

  // Setup WebRTC for direct peer connections
  private setupWebRTC(): void {
    const pcConfig: RTCConfiguration = {
      iceServers: DEFAULT_ICE_SERVERS,
    };

    if (this.config.turnServers) {
      this.config.turnServers.forEach(server => {
        pcConfig.iceServers.push({
          urls: server.url,
          username: server.username,
          credential: server.credential,
        });
      });
    }

    this.createPeerConnection(pcConfig);
  }

  // Create a new peer connection
  private createPeerConnection(config: RTCConfiguration): RTCPeerConnection {
    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendWebSocketMessage({
          type: 'ice_candidate',
          candidate: event.candidate,
          to: pc.name,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.createDataChannel(pc);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.cleanupPeer(pc.name);
      }
    };

    return pc;
  }

  // Create a data channel for a peer connection
  private createDataChannel(pc: RTCPeerConnection): void {
    const dc = pc.createDataChannel('hive-data');
    dc.name = pc.name;

    dc.onopen = () => {
      console.log('Data channel opened with', pc.name);
      this.dataChannels.set(pc.name, dc);
      this.sendSyncRequest(pc.name);
    };

    dc.onmessage = (event) => {
      const message: MultiplayerMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };

    dc.onclose = () => {
      this.dataChannels.delete(pc.name);
      this.cleanupPeer(pc.name);
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.name = pc.name;
      this.dataChannels.set(pc.name, channel);

      channel.onmessage = (e) => {
        const message: MultiplayerMessage = JSON.parse(e.data);
        this.handleMessage(message);
      };

      channel.onclose = () => {
        this.dataChannels.delete(pc.name);
      };
    };
  }

  // Send message via WebSocket
  private sendWebSocketMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // Send message to a specific peer
  sendToPeer(peerId: string, message: MultiplayerMessage): void {
    const dc = this.dataChannels.get(peerId);
    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify(message));
    } else if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ ...message, to: peerId }));
    }
  }

  // Send message to all peers
  sendToAll(message: MultiplayerMessage): void {
    this.dataChannels.forEach(dc => {
      if (dc.readyState === 'open') {
        dc.send(JSON.stringify(message));
      }
    });

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // Handle incoming messages
  private handleMessage(message: MultiplayerMessage): void {
    switch (message.type) {
      case 'join':
        this.handlePeerJoin(message);
        break;
      case 'leave':
        this.handlePeerLeave(message);
        break;
      case 'move':
        this.handlePeerMove(message);
        break;
      case 'chat':
        this.handleChatMessage(message);
        break;
      case 'entity_create':
        this.handleEntityCreate(message);
        break;
      case 'entity_update':
        this.handleEntityUpdate(message);
        break;
      case 'entity_delete':
        this.handleEntityDelete(message);
        break;
      case 'building_place':
        this.handleBuildingPlace(message);
        break;
      case 'building_destroy':
        this.handleBuildingDestroy(message);
        break;
      case 'npc_spawn':
        this.handleNpcSpawn(message);
        break;
      case 'npc_despawn':
        this.handleNpcDespawn(message);
        break;
      case 'npc_move':
        this.handleNpcMove(message);
        break;
      case 'portal_use':
        this.handlePortalUse(message);
        break;
      case 'sync_request':
        this.handleSyncRequest(message);
        break;
      case 'sync_response':
        this.handleSyncResponse(message);
        break;
      case 'ping':
        this.handlePing(message);
        break;
      case 'pong':
        this.handlePong(message);
        break;
      case 'ice_candidate':
        this.handleIceCandidate(message as any);
        break;
      case 'offer':
        this.handleOffer(message as any);
        break;
      case 'answer':
        this.handleAnswer(message as any);
        break;
    }
  }

  // Handle peer join
  private handlePeerJoin(message: any): void {
    if (message.userId === this.localUserId) return;

    const peer: PeerState = {
      id: message.userId,
      name: message.name,
      avatarId: message.avatarId,
      position: message.position,
      rotation: { x: 0, y: 0, z: 0 },
      status: 'connected',
      ping: 0,
      lastUpdate: Date.now(),
    };

    this.peers.set(peer.id, peer);
    this.emitEvent({ type: 'peer_joined', peer });

    if (this.config.connectionType === 'webrtc') {
      this.createPeerConnectionFor(message.userId);
    }
  }

  // Handle peer leave
  private handlePeerLeave(message: any): void {
    this.cleanupPeer(message.userId);
  }

  // Handle peer movement
  private handlePeerMove(message: any): void {
    const peer = this.peers.get(message.userId);
    if (peer) {
      peer.position = message.position;
      peer.rotation = message.rotation;
      peer.lastUpdate = Date.now();
      this.emitEvent({ type: 'peer_moved', peerId: message.userId, position: message.position, rotation: message.rotation });
    }
  }

  // Handle chat message
  private handleChatMessage(message: any): void {
    this.emitEvent({
      type: 'message_received',
      peerId: message.userId,
      message: message.message,
      name: message.name,
      timestamp: message.timestamp,
    });
  }

  // Handle entity creation
  private handleEntityCreate(message: any): void {
    worldManager.syncFromHiveToSandbox(message.entity, message.entity.worldType === 'hive' ? 'sandbox-main' : message.entity.worldType);
    this.emitEvent({ type: 'entity_sync', entity: message.entity });
  }

  // Handle entity update
  private handleEntityUpdate(message: any): void {
    this.emitEvent({ type: 'entity_sync', entity: { ...message.updates, id: message.entityId } as WorldEntity });
  }

  // Handle entity deletion
  private handleEntityDelete(message: any): void {
    this.emitEvent({ type: 'entity_sync', entity: { id: message.entityId, type: 'delete' } as any });
  }

  // Handle building placement
  private handleBuildingPlace(message: any): void {
    this.emitEvent({ type: 'building_sync', colonyId: message.colonyId, buildingId: message.buildingId, action: 'place' });
  }

  // Handle building destruction
  private handleBuildingDestroy(message: any): void {
    this.emitEvent({ type: 'building_sync', colonyId: message.colonyId, buildingId: message.buildingId, action: 'destroy' });
  }

  // Handle NPC spawn
  private handleNpcSpawn(message: any): void {
    npcManager.spawnNPC(message.npcId as any, message.worldId || 'sandbox-main', message.position);
    this.emitEvent({ type: 'npc_sync', npcId: message.npcId, action: 'spawn' });
  }

  // Handle NPC despawn
  private handleNpcDespawn(message: any): void {
    npcManager.despawnNPC(message.npcId, message.worldId || 'sandbox-main');
    this.emitEvent({ type: 'npc_sync', npcId: message.npcId, action: 'despawn' });
  }

  // Handle NPC movement
  private handleNpcMove(message: any): void {
    this.emitEvent({ type: 'npc_sync', npcId: message.npcId, action: 'move', position: message.position } as any);
  }

  // Handle portal use
  private handlePortalUse(message: any): void {
    console.log('Portal used:', message.portalId, 'by', message.userId);
  }

  // Handle sync request
  private handleSyncRequest(message: any): void {
    this.sendToPeer(message.userId, {
      type: 'sync_response',
      userId: this.localUserId,
      worldId: message.worldId,
      state: this.getWorldState(message.worldId),
    });
  }

  // Handle sync response
  private handleSyncResponse(message: any): void {
    this.applyWorldState(message.worldId, message.state);
    this.emitEvent({ type: 'sync_complete', worldId: message.worldId });
  }

  // Handle ping
  private handlePing(message: any): void {
    this.sendToPeer(message.userId, { type: 'pong', timestamp: message.timestamp });
  }

  // Handle pong
  private handlePong(message: any): void {
    const peer = this.peers.get(message.userId);
    if (peer) {
      peer.ping = Date.now() - message.timestamp;
    }
  }

  // Handle ICE candidate
  private handleIceCandidate(message: any): void {
    const pc = this.peerConnections.get(message.from);
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }

  // Handle offer
  private async handleOffer(message: any): Promise<void> {
    const pc = this.createPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });
    pc.name = message.from;
    this.peerConnections.set(message.from, pc);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.sendToPeer(message.from, {
        type: 'answer',
        answer: pc.localDescription,
        from: this.localUserId,
        to: message.from,
      });
    } catch (e) {
      console.error('Failed to handle offer:', e);
    }
  }

  // Handle answer
  private async handleAnswer(message: any): Promise<void> {
    const pc = this.peerConnections.get(message.from);
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
      } catch (e) {
        console.error('Failed to handle answer:', e);
      }
    }
  }

  // Create peer connection for a specific peer
  private createPeerConnectionFor(peerId: string): void {
    const pc = this.createPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });
    pc.name = peerId;
    this.peerConnections.set(peerId, pc);

    pc.createOffer().then(offer => {
      pc.setLocalDescription(offer);
      this.sendToPeer(peerId, {
        type: 'offer',
        offer: pc.localDescription,
        from: this.localUserId,
        to: peerId,
      });
    }).catch(e => {
      console.error('Failed to create offer:', e);
    });
  }

  // Cleanup peer connection
  private cleanupPeer(peerId: string): void {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }

    const dc = this.dataChannels.get(peerId);
    if (dc) {
      dc.close();
      this.dataChannels.delete(peerId);
    }

    this.peers.delete(peerId);
    this.emitEvent({ type: 'peer_left', peerId });
  }

  // Update local user position
  updatePosition(position: Position3D, rotation: Position3D = { x: 0, y: 0, z: 0 }): void {
    this.localPosition = position;
    this.localRotation = rotation;

    this.sendToAll({
      type: 'move',
      userId: this.localUserId,
      position,
      rotation,
    });
  }

  // Send chat message
  sendChatMessage(message: string): void {
    this.sendToAll({
      type: 'chat',
      userId: this.localUserId,
      name: this.localName,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Send entity changes
  sendEntityCreate(entity: WorldEntity): void {
    this.sendToAll({
      type: 'entity_create',
      entity,
    });
  }

  sendEntityUpdate(entityId: string, updates: Partial<WorldEntity>): void {
    this.sendToAll({
      type: 'entity_update',
      entityId,
      updates,
    });
  }

  sendEntityDelete(entityId: string): void {
    this.sendToAll({
      type: 'entity_delete',
      entityId,
    });
  }

  // Send building changes
  sendBuildingPlace(colonyId: string, buildingId: string, position: Position3D): void {
    this.sendToAll({
      type: 'building_place',
      colonyId,
      buildingId,
      position,
    });
  }

  sendBuildingDestroy(colonyId: string, buildingId: string): void {
    this.sendToAll({
      type: 'building_destroy',
      colonyId,
      buildingId,
    });
  }

  // Send NPC changes
  sendNpcSpawn(npcId: string, position: Position3D, worldId: string): void {
    this.sendToAll({
      type: 'npc_spawn',
      npcId,
      position,
      worldId,
    });
  }

  sendNpcDespawn(npcId: string, worldId: string): void {
    this.sendToAll({
      type: 'npc_despawn',
      npcId,
      worldId,
    });
  }

  sendNpcMove(npcId: string, position: Position3D, worldId: string): void {
    this.sendToAll({
      type: 'npc_move',
      npcId,
      position,
      worldId,
    });
  }

  // Request sync for a world
  requestSync(worldId: string): void {
    this.sendToAll({
      type: 'sync_request',
      userId: this.localUserId,
      worldId,
    });
  }

  // Get current world state
  private getWorldState(worldId: string): any {
    const world = worldManager.getSandboxWorld(worldId);
    const npcs = npcManager.getAllNPCs(worldId);
    const colonies = colonyManager.getAllColonies().filter(c => c.id.startsWith(worldId));

    return {
      world,
      npcs,
      colonies,
      timestamp: Date.now(),
    };
  }

  // Apply received world state
  private applyWorldState(worldId: string, state: any): void {
    if (state.world) {
      worldManager.updateSandboxWorld(worldId, state.world);
    }

    if (state.npcs) {
      state.npcs.forEach((npc: any) => {
        npcManager.spawnNPC(npc.id, worldId, npc.position);
      });
    }

    if (state.colonies) {
      state.colonies.forEach((colony: any) => {
        colonyManager.getColony(colony.id);
      });
    }
  }

  // Get all peers
  getPeers(): PeerState[] {
    return Array.from(this.peers.values());
  }

  // Get peer by ID
  getPeer(peerId: string): PeerState | undefined {
    return this.peers.get(peerId);
  }

  // Get local user info
  getLocalUser(): { id: string; name: string; avatarId: string } {
    return {
      id: this.localUserId,
      name: this.localName,
      avatarId: this.localAvatarId,
    };
  }

  // Set local user info
  setLocalUser(name: string, avatarId: string): void {
    this.localName = name;
    this.localAvatarId = avatarId;
  }

  // Event system
  onEvent(handler: MultiplayerEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  private emitEvent(event: MultiplayerEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('Multiplayer event handler error:', e);
      }
    });
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  destroy(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    this.dataChannels.forEach(dc => dc.close());
    this.dataChannels.clear();

    this.peers.clear();
    this.syncStates.clear();
    this.eventHandlers.length = 0;
    this.isConnected = false;
  }
}

export const multiplayerManager = new MultiplayerManager();

// React hook for multiplayer
export function useMultiplayer(worldId: string) {
  const [peers, setPeers] = useState<PeerState[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const updatePeers = () => {
      setPeers(multiplayerManager.getPeers());
      setIsConnected(multiplayerManager['isConnected']);
    };

    updatePeers();

    const unsubscribe = multiplayerManager.onEvent(() => updatePeers());
    const interval = setInterval(updatePeers, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [worldId]);

  const sendPosition = useCallback((position: Position3D, rotation: Position3D) => {
    multiplayerManager.updatePosition(position, rotation);
  }, []);

  const sendMessage = useCallback((message: string) => {
    multiplayerManager.sendChatMessage(message);
  }, []);

  const requestSync = useCallback(() => {
    multiplayerManager.requestSync(worldId);
  }, [worldId]);

  return { peers, isConnected, sendPosition, sendMessage, requestSync };
}

// Multiplayer peer component for rendering
export function useMultiplayerPeers() {
  return multiplayerManager.getPeers();
}