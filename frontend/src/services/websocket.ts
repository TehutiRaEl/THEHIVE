import { io, Socket } from 'socket.io-client'
import { WS_URL } from '../utils/constants'

type EventHandler = (data: unknown) => void

class HiveWebSocket {
  private socket: Socket | null = null
  private handlers = new Map<string, Set<EventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  connect(): void {
    if (this.socket?.connected) return

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })

    this.socket.on('connect', () => {
      console.debug('[WS] connected to hive')
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.debug('[WS] disconnected:', reason)
    })

    // Forward all known hive events
    const HIVE_EVENTS = [
      'arena_frame',
      'arena_resolved',
      'task_completed',
      'mission_proposed',
      'governance_event',
      'colony_health',
      'agent_spawned',
      'wealth_updated',
    ]
    for (const ev of HIVE_EVENTS) {
      this.socket.on(ev, (data: unknown) => this.emit(ev, data))
    }
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  private emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach((h) => h(data))
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const hiveSocket = new HiveWebSocket()
