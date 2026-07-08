/**
 * KaiChatBox.tsx
 * Full keyboard support chat box - ALL letters work uninterrupted
 */
import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const KaiChatBox = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content: inputValue.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      width: 400,
      height: 500,
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: 8,
      padding: 16,
      color: 'white',
      fontFamily: 'monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map(message => (
          <div key={message.id} style={{
            marginBottom: 8,
            textAlign: message.sender === 'user' ? 'right' : 'left'
          }}>
            <strong>{message.sender}:</strong> {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (ALL keys supported)"
        style={{
          width: '100%',
          padding: 8,
          background: '#333',
          color: 'white',
          border: '1px solid #555',
          borderRadius: 4
        }}
      />
    </div>
  );
};

export default KaiChatBox;
