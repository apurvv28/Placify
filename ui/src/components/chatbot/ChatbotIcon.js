import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'How to prepare for DSA?',
  'Resume tips',
  'Common HR questions',
  'Company specific prep',
];

export default function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'bot', 
      text: "Hi! I'm Placify AI. How can I help you with your placement journey today? You can ask me about Technical Interviews, HR Prep, Resumes, or Placement Strategies.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      text: text.trim(),
      timestamp: new Date()
    };
    
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await response.json();
      
      const botMessage = { 
        id: Date.now() + 1, 
        role: 'bot', 
        text: data.response || data.error || "Sorry, I couldn't get a response right now.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        role: 'bot', 
        text: "Error connecting to AI service. Please make sure the backend is running.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] font-sans">
      {/* Bot Icon Button - SLEEK RINGS */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-5 rounded-[24px] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-110 active:scale-95 transition-all duration-500 group animate-pulse"
        >
          <div className="absolute inset-0 rounded-[24px] border-2 border-white/20 animate-ping opacity-20 group-hover:opacity-40" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300 animate-pulse drop-shadow-lg" />
          <Bot size={32} />
          {/* Tooltip */}
          <span className="absolute right-full mr-6 top-1/2 -translate-y-1/2 px-4 py-2 rounded-2xl bg-[#0f172a] border border-white/10 text-[11px] font-black uppercase tracking-[0.15em] text-indigo-100 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 shadow-2xl">
            CONSULT PLACIFY AI
          </span>
        </button>
      )}

      {/* Chat Window - PREMIUM DESIGN */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[600px] max-h-[85vh] flex flex-col bg-[#020617] border border-white/5 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 ring-1 ring-white/10">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#0f172a]/80 backdrop-blur-3xl border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-[-5deg]">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white tracking-tight uppercase">Placify <span className="text-indigo-500">Intelligence</span></h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Cognitive Engine Online</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all shadow-inner"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Area - PROFESSIONAL BACKGROUND */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#020617] professional-chatbot-bg relative">
            {/* Subtle background overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} relative z-10`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-105 ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-indigo-400 border border-white/5' 
                    : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white transform rotate-[-3deg]'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed shadow-2xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-900/40 font-medium' 
                      : 'bg-[#0f172a] text-slate-200 border border-white/5 rounded-tl-none bot-message-content shadow-black/60'
                  }`}>
                    {msg.role === 'bot' ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <span className={`text-[9px] font-black text-slate-500 uppercase tracking-widest ${msg.role === 'user' ? 'mr-2' : 'ml-2'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-4 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shrink-0 shadow-xl rotate-[-3deg]">
                  <Bot size={18} />
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-3xl rounded-tl-none px-6 py-4 flex gap-2 shadow-2xl">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - SLEEK CHIPS */}
          {messages.length < 3 && !isTyping && (
             <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-[#0f172a]/30 backdrop-blur-md">
               {SUGGESTIONS.map((s, i) => (
                 <button
                   key={i}
                   onClick={() => handleSend(s)}
                   className="whitespace-nowrap px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider border border-white/5 bg-white/5 text-indigo-300 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95"
                 >
                   {s}
                 </button>
               ))}
             </div>
          )}

          {/* Input Area - DARK PREMIUM */}
          <div className="p-6 bg-[#0f172a]/80 backdrop-blur-3xl border-t border-white/5">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all shadow-inner relative">
              <textarea
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Inquire about career paths..."
                className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-slate-500 outline-none resize-none max-h-32 custom-scrollbar font-medium"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  !input.trim() || isTyping 
                    ? 'bg-slate-800 text-slate-600' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(79,70,229,0.4)]'
                }`}
              >
                <Send size={20} className={input.trim() ? 'rotate-[-10deg]' : ''} />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-600 mt-4 font-bold uppercase tracking-[0.2em]">POWERED BY PLACIFY NEURAL NETWORK</p>
          </div>

        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .professional-chatbot-bg {
          background-color: #020617;
          background-image: 
            radial-gradient(circle at top left, rgba(79, 70, 229, 0.03) 0%, transparent 40%),
            radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.03) 0%, transparent 40%);
        }
        .bot-message-content p {
          margin-bottom: 12px;
        }
        .bot-message-content p:last-child {
          margin-bottom: 0;
        }
        .bot-message-content strong {
          color: white;
          font-weight: 800;
        }
        .bot-message-content ul, .bot-message-content ol {
          margin-bottom: 12px;
          padding-left: 20px;
        }
        .bot-message-content li {
          margin-bottom: 6px;
        }
        .bot-message-content h1, .bot-message-content h2, .bot-message-content h3 {
          color: #818cf8;
          font-weight: 800;
          margin-top: 16px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bot-message-content code {
          background-color: rgba(255, 255, 255, 0.05);
          color: #818cf8;
          padding: 3px 6px;
          border-radius: 6px;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.9em;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
