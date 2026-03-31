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
          className="relative group p-5 rounded-[24px] bg-gradient-to-br from-[#FF6B35] to-[#FF3D00] text-white shadow-2xl shadow-[#FF6B35]/40 hover:shadow-[#FF6B35]/60 hover:scale-110 active:scale-95 transition-all duration-500 group animate-pulse"
        >
          <div className="absolute inset-0 rounded-[24px] border-2 border-white/20 animate-ping opacity-20 group-hover:opacity-40" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-[#E8A430] animate-pulse drop-shadow-lg" />
          <Bot size={32} />
          {/* Tooltip */}
          <span className="absolute right-full mr-6 top-1/2 -translate-y-1/2 px-4 py-2 rounded-2xl bg-[#111111] border border-white/10 text-[11px] font-black uppercase tracking-[0.15em] text-[#FF6B35] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 shadow-2xl">
            CONSULT PLACIFY AI
          </span>
        </button>
      )}

      {/* Chat Window - PREMIUM DESIGN */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[600px] max-h-[85vh] flex flex-col bg-[#0A0A0A] border border-[#2A2520] rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 ring-1 ring-white/5">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#111111]/90 backdrop-blur-3xl border-b border-[#2A2520] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent" />
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF3D00] flex items-center justify-center shadow-lg transform rotate-[-5deg] ring-1 ring-white/10">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#F5F0EB] tracking-tight uppercase" style={{fontFamily: 'Syne, sans-serif'}}>Placify <span className="text-[#FF6B35]">Intelligence</span></h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.15em]" style={{fontFamily: 'JetBrains Mono, monospace'}}>Cognitive Engine Online</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2.5 text-[#A89E94] hover:text-[#F5F0EB] hover:bg-white/5 rounded-xl transition-all"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Area - PROFESSIONAL BACKGROUND */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0A0A0A] professional-chatbot-bg relative">
            {/* Subtle background overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} relative z-10`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-transform hover:scale-105 ${
                  msg.role === 'user' 
                    ? 'bg-[#1C1C1C] text-[#FF6B35] border border-[#2A2520]' 
                    : 'bg-gradient-to-br from-[#FF6B35] to-[#FF3D00] text-white transform rotate-[-3deg]'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-[#FF6B35] text-white rounded-tr-none font-medium shadow-[#FF6B35]/20' 
                      : 'bg-[#111111] text-[#F5F0EB] border border-[#2A2520] rounded-tl-none bot-message-content shadow-black/40'
                  }`} style={{fontFamily: 'DM Sans, sans-serif'}}>
                    {msg.role === 'bot' ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      <p className="m-0">{msg.text}</p>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold text-[#A89E94] uppercase tracking-widest ${msg.role === 'user' ? 'mr-2' : 'ml-2'}`} style={{fontFamily: 'JetBrains Mono, monospace'}}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-4 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF3D00] flex items-center justify-center text-white shrink-0 shadow-xl rotate-[-3deg]">
                  <Bot size={18} />
                </div>
                <div className="bg-[#111111] border border-[#2A2520] rounded-3xl rounded-tl-none px-6 py-4 flex gap-2 shadow-lg">
                  <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - SLEEK CHIPS */}
          {messages.length < 3 && !isTyping && (
             <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-[#111111]/60 backdrop-blur-md border-t border-[#2A2520]">
               {SUGGESTIONS.map((s, i) => (
                 <button
                   key={i}
                   onClick={() => handleSend(s)}
                   className="whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-[rgba(255,107,53,0.2)] bg-[rgba(255,107,53,0.05)] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white hover:shadow-lg hover:shadow-[#FF6B35]/20 transition-all duration-300 active:scale-95"
                   style={{fontFamily: 'DM Sans, sans-serif'}}
                 >
                   {s}
                 </button>
               ))}
             </div>
          )}

          {/* Input Area - DARK PREMIUM */}
          <div className="p-6 bg-[#111111]/90 backdrop-blur-3xl border-t border-[#2A2520]">
            <div className="flex items-center gap-3 bg-[#1C1C1C] border border-[#2A2520] rounded-2xl px-4 py-2 focus-within:border-[rgba(255,107,53,0.5)] focus-within:ring-2 focus-within:ring-[rgba(255,107,53,0.1)] transition-all shadow-inner relative">
              <textarea
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Inquire about career paths..."
                className="flex-1 bg-transparent py-2.5 text-sm text-[#F5F0EB] placeholder:text-[#A89E94] outline-none resize-none max-h-32 custom-scrollbar font-medium"
                style={{fontFamily: 'DM Sans, sans-serif'}}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-xl transition-all duration-300 border-none cursor-pointer ${
                  !input.trim() || isTyping 
                    ? 'bg-[#2A2520] text-[#5C5550]' 
                    : 'bg-[#FF6B35] text-white hover:bg-[#E8A430] hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(255,107,53,0.4)]'
                }`}
              >
                <Send size={20} className={input.trim() ? 'rotate-[-10deg]' : ''} />
              </button>
            </div>
            <p className="text-[9px] text-center text-[#5C5550] mt-4 font-bold uppercase tracking-[0.2em]" style={{fontFamily: 'JetBrains Mono, monospace'}}>POWERED BY PLACIFY NEURAL NETWORK</p>
          </div>

        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .professional-chatbot-bg {
          background-color: #0A0A0A;
          background-image: 
            radial-gradient(circle at top left, rgba(255, 107, 53, 0.03) 0%, transparent 40%),
            radial-gradient(circle at bottom right, rgba(232, 164, 48, 0.03) 0%, transparent 40%);
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
          color: #FF6B35;
          font-weight: 800;
          margin-top: 16px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bot-message-content code {
          background-color: rgba(255, 107, 53, 0.08);
          color: #FF6B35;
          padding: 3px 6px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
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
