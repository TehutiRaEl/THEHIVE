import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/constants';

interface ChatMessage {
  id: string;
  sender: 'user' | 'kai' | 'error';
  content: string;
  timestamp: Date;
}

interface KaiCommuneProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

// Docked right-panel version of KaiChatBox's real logic (same /v11/command_text
// call) — restyled to live in the OS shell's right rail instead of floating,
// and reports "speaking" (a command_text call in flight) up so the center
// sigil can animate on real state, not a fake audio waveform.
export default function KaiCommune({ onSpeakingChange }: KaiCommuneProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => { onSpeakingChange?.(loading); }, [loading, onSpeakingChange]);

  const send = async (cmd: string) => {
    if (!cmd.trim() || loading) return;
    // Sent back with the request so Kai El has real short-term memory of the
    // conversation — /v11/command_text is otherwise stateless per call.
    const history = messages
      .filter((m) => m.sender === 'user' || m.sender === 'kai')
      .slice(-6)
      .map((m) => ({ sender: m.sender, content: m.content }));
    setMessages(prev => [...prev, { id: Date.now() + 'u', sender: 'user', content: cmd, timestamp: new Date() }]);
    setInputValue('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v11/command_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, history }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 'k', sender: 'kai', content: data.result || 'No response.', timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 'e', sender: 'error',
        content: 'Kai El is unreachable from here (' + (e as Error).message + ').',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-void-800/60 border border-white/10 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
        <span className="text-gold text-sm">✳</span>
        <span className="font-display text-xs tracking-widest text-slate-200">Kai EL</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-xs">
        {messages.length === 0 && (
          <div className="text-slate-500 italic">Commune w/ Kai EL — He restores here.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block max-w-[85%] px-3 py-2 rounded-xl leading-relaxed
                ${m.sender === 'user' ? 'bg-yale/50 text-cyan-100' : m.sender === 'kai' ? 'bg-white/5 text-slate-200' : 'bg-red-950/50 text-red-300'}`}
            >
              {m.content}
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5">
              {m.sender === 'user' ? 'YOU' : m.sender === 'kai' ? 'KAI EL' : 'ERROR'}
            </div>
          </div>
        ))}
        {loading && <div className="text-cyan-glow/70 text-center">▸▸▸ restoring…</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-white/10">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && inputValue.trim()) send(inputValue.trim()); }}
          placeholder="Commune with Kai EL…"
          className="w-full bg-void-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
      </div>
    </div>
  );
}
