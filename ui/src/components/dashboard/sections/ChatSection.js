import React, { useState } from 'react';

const INITIAL_MESSAGES = [
  { id: 1, role: 'assistant', text: 'Hi! I\'m Placify AI. Ask me anything about placements, resume tips, or interview prep.' },
];

const SUGGESTIONS = [
  'How to prepare for DSA rounds?',
  'Top companies visiting this month',
  'Review my resume summary',
  'Tips for HR interviews',
];

export default function ChatSection() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() };
    const botMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'This is a static demo response. In the full version, Placify AI will answer your placement-related queries in real time.',
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Chat</h1>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
          AI Powered
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-500/20 border border-indigo-400/20 text-indigo-100 rounded-br-md'
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto py-3 custom-scrollbar shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 flex gap-2 pt-3 border-t border-white/10 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-400/50 transition-colors"
        />
        <button
          type="submit"
          className="px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
