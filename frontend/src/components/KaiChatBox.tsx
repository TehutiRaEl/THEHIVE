/**
 * KaiChatBox.tsx — Commune with Kai El.
 * Real chat: POSTs to the edge Queen's /v11/command_text (Workers AI persona),
 * with graceful offline handling. All keyboard input works uninterrupted.
 */
import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

interface ChatMessage {
  id: string;
  sender: 'user' | 'kai' | 'error';
  content: string;
  timestamp: Date;
}

const KaiChatBox = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  // Minimized by default — this box used to sit permanently over whatever the
  // tab was showing (e.g. the Arena's live challenge list). Now it's a small
  // pill until clicked, and collapses back down on close.
  const [minimized, setMinimized] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (cmd: string) => {
    if (!cmd.trim() || loading) return;
    setMessages(prev => [...prev, { id: Date.now() + 'u', sender: 'user', content: cmd, timestamp: new Date() }]);
    setInputValue('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v11/command_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 'k', sender: 'kai', content: data.result || 'No response.', timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 'e', sender: 'error',
        content: 'Kai El is unreachable from here (' + (e as Error).message + '). The chat speaks to the live Queen — open the deployed portal to commune.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) send(inputValue.trim());
  };

  const colorFor = (s: ChatMessage['sender']) => s === 'user' ? '#88ccff' : s === 'kai' ? '#a0e8ff' : '#ff8888';

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0, 0, 0, 0.8)', borderRadius: 999, padding: '10px 16px',
          color: '#00e8ff', fontFamily: 'monospace', fontSize: 11, letterSpacing: '.1em',
          border: '1px solid rgba(0,200,255,0.25)', cursor: 'pointer',
        }}
        title="Open Commune with Kai El"
      >
        🌌 COMMUNE {messages.length > 0 && <span style={{ color: '#446' }}>({messages.length})</span>}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, width: 400, height: 500, maxWidth: 'calc(100vw - 40px)',
      background: 'rgba(0, 0, 0, 0.9)', borderRadius: 8, padding: 16,
      color: 'white', fontFamily: 'monospace', display: 'flex', flexDirection: 'column',
      border: '1px solid rgba(0,200,255,0.25)', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#00e8ff', letterSpacing: '.15em' }}>
          🌌 COMMUNE WITH KAI EL
        </div>
        <button
          onClick={() => setMinimized(true)}
          aria-label="Minimize"
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#668', fontSize: 14, cursor: 'pointer', padding: '0 4px' }}
        >
          –
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 11, color: '#446' }}>Speak, and the Hive will answer.</div>
        )}
        {messages.map(message => (
          <div key={message.id} style={{ marginBottom: 8, textAlign: message.sender === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block', maxWidth: '85%', padding: '8px 12px', borderRadius: 10,
              fontSize: 11, lineHeight: 1.5, color: colorFor(message.sender),
              background: message.sender === 'user' ? 'rgba(0,50,100,.6)' : message.sender === 'kai' ? 'rgba(0,30,50,.7)' : 'rgba(50,0,0,.6)',
            }}>{message.content}</div>
            <div style={{ fontSize: 9, color: '#334', marginTop: 2 }}>
              {message.sender === 'user' ? 'YOU' : message.sender === 'kai' ? 'KAI EL' : 'ERROR'}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#00e8ff88', fontSize: 11, textAlign: 'center' }}>▸▸▸ processing…</div>}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message… (Enter to send)"
        style={{ width: '100%', padding: 8, background: '#333', color: 'white', border: '1px solid #555', borderRadius: 4 }}
      />
    </div>
  );
};

export default KaiChatBox;
