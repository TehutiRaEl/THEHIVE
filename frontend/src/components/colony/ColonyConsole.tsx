import React, { useState, useRef } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { ColonyId } from '../../types/colony';

interface ConsoleCommand {
  id: string;
  command: string;
  output: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
}

interface ColonyConsoleProps {
  colonyId: ColonyId;
  predefinedCommands?: { id: string; command: string; description: string }[];
}

const PREDEFINED_COMMANDS = [
  { cmd: 'status', desc: 'Show colony status' },
  { cmd: 'health', desc: 'Display health metrics' },
  { cmd: 'agents', desc: 'List active agents' },
  { cmd: 'workflows', desc: 'Show running workflows' },
  { cmd: 'logs', desc: 'View recent logs' },
  { cmd: 'help', desc: 'Show available commands' },
];

const ColonyConsole: React.FC<ColonyConsoleProps> = ({ colonyId, predefinedCommands: _predefinedCommands }) => {
  const { theme } = useUIStore();
  const [commands, setCommands] = useState<ConsoleCommand[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (command: string) => {
    if (!command.trim()) return;

    const newCommand: ConsoleCommand = {
      id: Date.now().toString(),
      command,
      output: '',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setCommands(prev => [...prev, newCommand]);
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');

    setTimeout(() => {
      const response = generateResponse(command, colonyId);
      setCommands(prev => 
        prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { ...cmd, output: response, status: 'success' }
            : cmd
        )
      );
    }, 500);

    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateResponse = (cmd: string, id: ColonyId): string => {
    const [command] = cmd.toLowerCase().split(' ');
    
    switch (command) {
      case 'status':
        return 'Colony ' + id + ' is ONLINE\nStatus: Healthy\nUptime: 99.99%\nVersion: 2.0.0';
      case 'health':
        return 'Health Metrics for ' + id + ':\nCPU: 45% | Memory: 62% | Disk: 34%\nAll systems operational';
      case 'agents':
        return 'Active Agents in ' + id + ':\n- Mistral (Frontend/UI)\n- Claude (Backend)\n- Grok (Strategy)';
      case 'workflows':
        return 'Running Workflows:\n- ci.yml (passing)\n- deploy.yml (passing)\n- constitution-sync.yml (pending)';
      case 'logs':
        return 'Recent Logs:\n[2026-07-10 22:00:00] INFO: Colony initialized\n[2026-07-10 21:55:00] INFO: Health check passed\n[2026-07-10 21:50:00] WARN: Low disk space on node-3';
      case 'help':
        return PREDEFINED_COMMANDS.map(c => c.cmd.padEnd(15) + ' - ' + c.desc).join('\n');
      default:
        return 'Unknown command: "' + command + '"\nType "help" for available commands';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        setHistoryIndex(prev => prev + 1);
        setInput(history[history.length - 1 - (historyIndex + 1)]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1);
        setInput(history[history.length - 1 - (historyIndex - 1)]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="colony-console" style={{
      background: theme.background,
      border: '1px solid ' + theme.border,
      color: theme.text
    }}>
      <div className="console-header">
        <span style={{ color: theme.primary }}> Console - {colonyId}</span>
        <button className="clear-btn" onClick={() => setCommands([])} style={{ color: theme.textSecondary }}>
          Clear
        </button>
      </div>

      <div className="console-output" style={{
        background: theme.surface,
        color: theme.text
      }}>
        {commands.length === 0 ? (
          <div className="console-welcome">
            <p>Sovereign Hive Colony Console</p>
            <p>Type a command and press Enter</p>
            <p style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
              Try: status, health, agents, workflows, logs, help
            </p>
          </div>
        ) : (
          commands.map(cmd => (
            <div key={cmd.id} className="console-entry">
              <div className="console-prompt">
                <span style={{ color: theme.primary }}>{colonyId}</span>
                <span style={{ color: theme.textSecondary }}>@</span>
                <span>{new Date(cmd.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="console-command">
                <span style={{ color: '#00FF00' }}>&gt; {cmd.command}</span>
              </div>
              <div className="console-response" style={{
                color: cmd.status === 'error' ? '#FF4444' : theme.text
              }}>
                <pre>{cmd.output}</pre>
              </div>
            </div>
          ))
        )}
        <div ref={inputRef} />
      </div>

      <div className="console-input">
        <span style={{ color: theme.primary }}>{colonyId}</span>
        <span style={{ color: theme.textSecondary }}>@</span>
        <span style={{ color: '#00FF00' }}>&gt; </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            background: 'transparent',
            color: theme.text,
            border: 'none',
            outline: 'none',
            flex: 1
          }}
        />
      </div>
    </div>
  );
};

export default ColonyConsole;