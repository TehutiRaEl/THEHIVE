import { useEffect, useCallback, useRef } from 'react'
import { hiveSocket } from '../services/websocket'

export function useWebSocket(
  event: string,
  handler: (data: unknown) => void,
  { autoConnect = true }: { autoConnect?: boolean } = {}
): { isConnected: boolean; connect: () => void; disconnect: () => void } {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (autoConnect) hiveSocket.connect()
    const unsubscribe = hiveSocket.on(event, (data) => handlerRef.current(data))
    return unsubscribe
  }, [event, autoConnect])

  const connect = useCallback(() => hiveSocket.connect(), [])
  const disconnect = useCallback(() => hiveSocket.disconnect(), [])

  return { isConnected: hiveSocket.isConnected, connect, disconnect }
}

export function useHiveSSE(
  url: string,
  onMessage: (event: MessageEvent) => void,
  enabled = true
): void {
  const cbRef = useRef(onMessage)
  cbRef.current = onMessage

  useEffect(() => {
    if (!enabled) return
    const es = new EventSource(url)
    es.onmessage = (e) => cbRef.current(e)
    es.onerror = () => es.close()
    return () => es.close()
  }, [url, enabled])
}
