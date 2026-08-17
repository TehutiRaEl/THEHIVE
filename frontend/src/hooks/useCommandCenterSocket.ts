import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../utils/constants'

// Real-time Command Center push (task 14). Built fresh against the Worker's
// new CommandCenterDO — the old useWebSocket.ts/services/websocket.ts pair
// from six dead branches used socket.io-client against a server that never
// existed on either backend; nothing here reuses that file or its protocol.
//
// useHiveData's 30s poll is untouched and stays the source of truth for full
// state and first paint. This hook is additive: when a message arrives, a
// consumer decides what to do with it (typically: call useHiveData's own
// `refresh()`), so a missed or dropped message just means the next poll (or a
// manual refresh on reconnect) catches up — never a stuck UI.
//
// Every component that calls this hook shares ONE real WebSocket connection
// (module-level, reference-counted below) rather than opening its own — the
// Command Center currently calls useHiveData from 9 places (KaiElOS.tsx plus
// all 8 tab components), and this hook is meant to be called from the same
// places without multiplying that into 9 sockets.

export interface CommandCenterMessage {
  type: string
  kind?: string
  title?: string
  body?: string
  ts?: string
  [k: string]: unknown
}

type Listener = (msg: CommandCenterMessage) => void
type StatusListener = (connected: boolean) => void

let socket: WebSocket | null = null
let refCount = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelayMs = 1000
const MAX_RECONNECT_DELAY_MS = 30000
const messageListeners = new Set<Listener>()
const statusListeners = new Set<StatusListener>()

function wsUrl(): string {
  const base = API_BASE_URL || window.location.origin
  return base.replace(/^http/, 'ws') + '/v11/ws'
}

function setConnected(connected: boolean) {
  for (const fn of statusListeners) fn(connected)
}

function connect() {
  if (socket) return
  try {
    socket = new WebSocket(wsUrl())
  } catch {
    scheduleReconnect()
    return
  }
  socket.onopen = () => {
    reconnectDelayMs = 1000
    setConnected(true)
  }
  socket.onmessage = (event) => {
    let parsed: CommandCenterMessage
    try {
      parsed = JSON.parse(event.data)
    } catch {
      return
    }
    for (const fn of messageListeners) fn(parsed)
  }
  socket.onclose = () => {
    socket = null
    setConnected(false)
    if (refCount > 0) scheduleReconnect()
  }
  socket.onerror = () => {
    socket?.close()
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (refCount > 0) connect()
  }, reconnectDelayMs)
  reconnectDelayMs = Math.min(reconnectDelayMs * 2, MAX_RECONNECT_DELAY_MS)
}

function acquire() {
  refCount += 1
  if (refCount === 1) connect()
}

function release() {
  refCount = Math.max(0, refCount - 1)
  if (refCount === 0) {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    socket?.close()
    socket = null
    reconnectDelayMs = 1000
  }
}

export interface CommandCenterSocket {
  connected: boolean
  lastMessage: CommandCenterMessage | null
}

export function useCommandCenterSocket(onMessage?: Listener): CommandCenterSocket {
  const [connected, setConnectedState] = useState(false)
  const [lastMessage, setLastMessage] = useState<CommandCenterMessage | null>(null)

  useEffect(() => {
    acquire()
    const onStatus: StatusListener = (c) => setConnectedState(c)
    const onMsg: Listener = (msg) => {
      setLastMessage(msg)
      onMessage?.(msg)
    }
    statusListeners.add(onStatus)
    messageListeners.add(onMsg)
    setConnectedState(!!socket && socket.readyState === WebSocket.OPEN)
    return () => {
      statusListeners.delete(onStatus)
      messageListeners.delete(onMsg)
      release()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { connected, lastMessage }
}
