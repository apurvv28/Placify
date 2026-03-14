import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MoreVertical, Paperclip, Smile, Send, Check, CheckCheck, 
  Shield, ArrowLeft, Trash2, UserX, UserCheck, User, Info, MessageSquare, 
  X, ExternalLink, Heart, ThumbsUp, Frown, Ghost, Flame
} from 'lucide-react';
import { useSocket } from '../../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';
import { format, isToday, isYesterday } from 'date-fns';

const REACTION_EMOJIS = [
  { emoji: '👍', icon: <ThumbsUp size={14} /> },
  { emoji: '❤️', icon: <Heart size={14} /> },
  { emoji: '😂', icon: <Smile size={14} /> },
  { emoji: '😮', icon: <Ghost size={14} /> },
  { emoji: '😢', icon: <Frown size={14} /> },
  { emoji: '🔥', icon: <Flame size={14} /> },
];


export default function ChatSection() {
  const { socket, onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [reactionSource, setReactionSource] = useState(null); // { messageId, x, y }
  
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('placifyUser')) || {};
  const token = localStorage.getItem('placifyToken');

  // Fetch all users on mount
  const fetchUsers = React.useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        
        const lastMsgs = {};
        const unreads = {};
        data.forEach(user => {
          if (user.lastMessage) lastMsgs[user._id] = user.lastMessage;
          if (user.unreadCount) unreads[user._id] = user.unreadCount;
        });
        setLastMessages(lastMsgs);
        setUnreadCounts(unreads);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [token, fetchUsers]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          
          await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/seen/${selectedUser._id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUnreadCounts(prev => ({ ...prev, [selectedUser._id]: 0 }));
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    
    fetchMessages();
  }, [selectedUser, token]);


  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const isFromSelected = selectedUser && msg.senderId === selectedUser._id;
      const isForMe = msg.receiverId === currentUser.id;

      if (isFromSelected) {
        setMessages(prev => [...prev, msg]);
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/seen/${msg.senderId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (isForMe) {
        setUnreadCounts(prev => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1
        }));
      }

      const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      setLastMessages(prev => ({
        ...prev,
        [otherUserId]: {
          text: msg.text,
          createdAt: msg.createdAt,
          senderId: msg.senderId
        }
      }));
    };

    const handleMessagesSeen = ({ seenBy }) => {
      if (selectedUser && seenBy === selectedUser._id) {
        setMessages(prev => prev.map(m => m.receiverId === seenBy ? { ...m, seen: true } : m));
      }
    };

    const handleReaction = ({ messageId, reactions }) => {
       setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('messageReaction', handleReaction);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesSeen', handleMessagesSeen);
      socket.off('messageReaction', handleReaction);
    };
  }, [socket, selectedUser, currentUser.id, token]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedUser) return;

    const tempText = newMessageText;
    setNewMessageText('');
    setShowEmojiPicker(false);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text: tempText })
      });
      
      if (res.ok) {
        const savedMsg = await res.json();
        setMessages(prev => [...prev, savedMsg]);
        setLastMessages(prev => ({
          ...prev,
          [selectedUser._id]: {
            text: savedMsg.text,
            createdAt: savedMsg.createdAt,
            senderId: savedMsg.senderId
          }
        }));
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to send');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleToggleReaction = async (messageId, emoji) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/react/${messageId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ emoji })
      });
      if (res.ok) {
        const updatedReactions = await res.json();
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: updatedReactions } : m));
      }
    } catch (err) {
      console.error('Reaction failed:', err);
    }
    setReactionSource(null);
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm('Are you sure you want to clear this chat? This only clears it for you.')) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/clear/${selectedUser._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages([]);
        setLastMessages(prev => ({ ...prev, [selectedUser._id]: null }));
        setShowOptionsDropdown(false);
      }
    } catch (err) {
      console.error('Clear chat failed:', err);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    const isBlocked = selectedUser.isBlocked;
    const action = isBlocked ? 'unblock' : 'block';
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${action}/${selectedUser._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedUser(prev => ({ ...prev, isBlocked: !isBlocked }));
        fetchUsers(); // Refresh contacts
        setShowOptionsDropdown(false);
      }
    } catch (err) {
      console.error(`${action} failed:`, err);
    }
  };

  const handleViewProfile = (user) => {
    setViewingProfile(user);
    setShowProfileSidebar(true);
    setShowOptionsDropdown(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'HH:mm');
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'TODAY';
    if (isYesterday(date)) return 'YESTERDAY';
    return format(date, 'MMMM d, yyyy').toUpperCase();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-[#020617] border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative text-slate-200 font-sans">
      
      {/* 2. USER LIST (LEFT PANEL) - SLEEK DARK */}
      <div className={`flex flex-col w-full lg:w-[380px] border-r border-white/5 bg-[#0f172a] ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1e293b]/30 backdrop-blur-xl">
          <div className="flex items-center gap-4">
             <div 
              onClick={() => handleViewProfile({...currentUser, name: currentUser.name || 'My Profile'})}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:rotate-3 transition-all duration-300 font-bold border border-white/20 shadow-lg overflow-hidden group"
             >
               {currentUser.avatar ? 
                 <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : 
                 <span className="text-white text-lg">{currentUser.name?.charAt(0).toUpperCase()}</span>
               }
             </div>
             <div>
               <h2 className="text-xl font-extrabold text-white tracking-tight">Messages</h2>
               <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Placify Network</p>
             </div>
          </div>
          <button className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4">
          <div className="relative flex items-center bg-[#1e293b] border border-white/5 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-inner">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 ml-3 w-full font-medium"
            />
          </div>
        </div>

        {/* Users Loop */}
        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar py-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div 
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`mx-3 mb-1 flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${
                  selectedUser?._id === user._id 
                    ? 'bg-indigo-600 shadow-[0_10px_20px_rgba(79,70,229,0.3)] ring-1 ring-white/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl border-2 transition-all group-hover:scale-105 ${
                    selectedUser?._id === user._id ? 'border-indigo-400 shadow-lg' : 'border-[#1e293b]'
                  } bg-gradient-to-br ${
                    user.role === 'Placed' ? 'from-emerald-600 to-teal-500' : 
                    user.role === 'Professional' ? 'from-blue-600 to-indigo-500' : 'from-orange-600 to-amber-500'
                  }`}>
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" /> : user.name.charAt(0).toUpperCase()}
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-bold truncate ${selectedUser?._id === user._id ? 'text-white' : 'text-slate-100'}`}>
                      {user.name}
                    </h3>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${selectedUser?._id === user._id ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {lastMessages[user._id] ? formatMessageTime(lastMessages[user._id].createdAt) : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm ${
                       selectedUser?._id === user._id 
                        ? 'bg-white/20 text-white' 
                        : user.role === 'Placed' ? 'bg-emerald-500/10 text-emerald-400' : 
                          user.role === 'Professional' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <p className={`truncate flex-1 pr-4 ${
                      selectedUser?._id === user._id 
                        ? 'text-indigo-100' 
                        : unreadCounts[user._id] > 0 ? 'text-white font-bold' : 'text-slate-400'
                    }`}>
                      {lastMessages[user._id] ? lastMessages[user._id].text : 'Start a professional talk'}
                    </p>
                    {unreadCounts[user._id] > 0 && selectedUser?._id !== user._id && (
                      <span className="bg-white text-indigo-600 font-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg ring-2 ring-indigo-500/20">
                        {unreadCounts[user._id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#1e293b] flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Search size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. CHAT WINDOW (RIGHT PANEL) - PROFESSIONAL DARK */}
      <div className={`flex-1 flex flex-col bg-[#020617] relative ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-2xl flex items-center justify-between shrink-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-5 cursor-pointer group" onClick={() => handleViewProfile(selectedUser)}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedUser(null); }} 
                  className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="relative">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br shadow-xl group-hover:scale-105 transition-transform ${
                    selectedUser.role === 'Placed' ? 'from-emerald-500 to-teal-400' : 
                    selectedUser.role === 'Professional' ? 'from-indigo-600 to-blue-500' : 'from-orange-500 to-amber-400'
                  }`}>
                    {selectedUser.avatar ? <img src={selectedUser.avatar} alt="User" className="w-full h-full rounded-2xl object-cover" /> : selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  {onlineUsers.includes(selectedUser._id) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-lg" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1.5">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${onlineUsers.includes(selectedUser._id) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${onlineUsers.includes(selectedUser._id) ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {onlineUsers.includes(selectedUser._id) ? 'ACTIVE NOW' : 'OFFLINE'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="text-slate-400 hover:text-indigo-400 p-2.5 rounded-xl hover:bg-indigo-500/10 transition-all">
                  <Info size={20} />
                </button>
                <div className="relative">
                  <button onClick={() => setShowOptionsDropdown(!showOptionsDropdown)} className="text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-white/5 transition-all">
                    <MoreVertical size={20} />
                  </button>
                  {showOptionsDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/20">
                      <button onClick={() => handleViewProfile(selectedUser)} className="w-full px-5 py-3 text-left text-sm text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-4 transition-all mx-1 rounded-xl w-[calc(100%-8px)]">
                        <User size={18} /> View Dynamic Profile
                      </button>
                      <div className="h-px bg-white/5 my-1 mx-4"></div>
                      <button onClick={handleClearChat} className="w-full px-5 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-4 transition-all mx-1 rounded-xl w-[calc(100%-8px)]">
                        <Trash2 size={18} /> Purge Chat History
                      </button>
                      <button onClick={handleBlockUser} className="w-full px-5 py-3 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-4 transition-all mx-1 rounded-xl w-[calc(100%-8px)]">
                        {selectedUser.isBlocked ? (
                          <><UserCheck size={18} className="text-emerald-400" /> Restore Access</>
                        ) : (
                          <><UserX size={18} className="text-orange-400" /> Restrict Contact</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area - PROFESSIONAL DARK OVERHAUL */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative bg-[#020617] professional-chat-bg">
              {/* Subtle background overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-purple-500/[0.02] pointer-events-none" />
              
              <div className="flex justify-center mb-10 relative z-10">
                <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 px-5 py-2.5 rounded-2xl text-[11px] text-indigo-300 shadow-xl flex items-center gap-3 max-w-sm text-center font-bold tracking-wide">
                  <Shield size={14} className="text-indigo-400 shrink-0" />
                  THIS CONVERSATION IS PROTECTED BY ENTERPRISE ENCRYPTION
                </div>
              </div>

              {messages.map((msg, idx) => {
                const isMine = msg.senderId === currentUser.id;
                const showDate = idx === 0 || getDateLabel(messages[idx-1].createdAt) !== getDateLabel(msg.createdAt);
                const reactions = msg.reactions || [];
                
                return (
                  <React.Fragment key={msg._id || idx}>
                    {showDate && (
                      <div className="flex justify-center my-8 relative z-10">
                        <span className="px-5 py-1.5 bg-[#1e293b]/50 backdrop-blur-lg text-[10px] font-black text-slate-400 rounded-full uppercase tracking-[0.2em] border border-white/5 shadow-lg">
                          {getDateLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex group ${isMine ? 'justify-end' : 'justify-start'} relative mb-2 z-10`}>
                      <div 
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setReactionSource({ messageId: msg._id, x: e.clientX, y: e.clientY });
                        }}
                        className={`relative max-w-[70%] px-5 py-3.5 rounded-3xl shadow-xl transition-all duration-300 hover:scale-[1.01] ${
                          isMine 
                            ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-tr-none shadow-indigo-900/20' 
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5 shadow-black/40'
                        }`}
                      >
                        <div className="text-[15px] pr-4 pb-2 leading-relaxed font-medium">
                          {msg.text}
                        </div>

                        {/* Reaction Bar (Hover only) */}
                        <div className={`absolute bottom-full mb-2 ${isMine ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 bg-[#1e293b] p-1.5 rounded-2xl shadow-2xl border border-white/10 z-50`}>
                           {REACTION_EMOJIS.slice(0, 4).map(re => (
                             <button key={re.emoji} onClick={() => handleToggleReaction(msg._id, re.emoji)} className="hover:scale-125 transition-transform p-1.5 grayscale hover:grayscale-0">
                                {re.emoji}
                             </button>
                           ))}
                           <button onClick={(e) => setReactionSource({ messageId: msg._id, x: e.clientX, y: e.clientY })} className="p-1.5 text-slate-400 hover:text-white"><Smile size={16} /></button>
                        </div>

                        {/* Current Reactions Display */}
                        {reactions.length > 0 && (
                          <div className={`absolute -bottom-4 ${isMine ? 'right-2' : 'left-2'} flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 shadow-2xl scale-95 hover:scale-110 transition-transform cursor-default z-20`}>
                            {Array.from(new Set(reactions.map(r => r.emoji))).slice(0, 3).map(emoji => (
                              <span key={emoji} className="text-[13px]">{emoji}</span>
                            ))}
                            <span className="text-[10px] text-slate-300 ml-1 font-black">{reactions.length}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 justify-end opacity-70">
                          <span className="text-[10px] font-bold">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            msg.seen ? (
                              <CheckCheck size={14} className="text-cyan-300" />
                            ) : (
                              <Check size={14} className="text-white/40" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar - PROFESSIONAL DARK */}
            <div className="p-6 bg-[#0f172a] border-t border-white/5 shrink-0 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
              {showEmojiPicker && (
                <div className="absolute bottom-full left-6 mb-4 z-50 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/10">
                  <EmojiPicker theme="dark" onEmojiClick={(emojiData) => setNewMessageText(prev => prev + emojiData.emoji)} />
                </div>
              )}
              
              {selectedUser.isBlocked ? (
                <div className="flex flex-col items-center justify-center p-6 bg-red-500/5 rounded-3xl border border-red-500/10 backdrop-blur-sm">
                  <p className="text-sm text-red-400 mb-4 font-bold tracking-tight">Access restricted for this contact</p>
                  <button onClick={handleBlockUser} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                    Restore Communication
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-2xl border border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-3 transition-all rounded-xl ${showEmojiPicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <Smile size={22} />
                    </button>
                    <button 
                      type="button" 
                      className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <Paperclip size={20} />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      placeholder="Share your professional thoughts..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/5 outline-none py-4 px-6 rounded-3xl text-[15px] text-white placeholder:text-slate-500 shadow-inner focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newMessageText.trim()}
                    className={`p-4 rounded-2xl transition-all duration-300 shadow-xl ${newMessageText.trim() ? 'bg-indigo-600 text-white hover:scale-105 hover:shadow-indigo-500/30 active:scale-95' : 'bg-slate-800 text-slate-600'}`}
                  >
                    <Send size={22} fill={newMessageText.trim() ? 'currentColor' : 'none'} className={newMessageText.trim() ? 'rotate-[-10deg]' : ''} />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#020617] relative overflow-hidden">
             {/* Dynamic background effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-32 h-32 bg-indigo-600/10 rounded-[40px] border border-indigo-500/20 flex items-center justify-center mb-10 relative group">
               <div className="absolute inset-[-15px] bg-indigo-600/10 rounded-[50px] animate-pulse blur-xl opacity-30" />
               <MessageSquare size={56} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Placify <span className="text-indigo-500">Elite</span> Chat</h2>
            <p className="text-slate-400 max-w-md leading-relaxed text-base font-medium">
              Seamless. Secure. Professional. <br />
              Connect with India's top placed students and industry mentors in a clutter-free environment.
            </p>
            <div className="mt-16 grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="p-4 bg-[#0f172a] border border-white/5 rounded-2xl text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Shield size={16} className="text-emerald-400" />
                  </div>
                  <p className="text-[11px] font-bold text-white uppercase mb-1">Encrypted</p>
                  <p className="text-[10px] text-slate-500">End-to-end security protocol</p>
                </div>
                <div className="p-4 bg-[#0f172a] border border-white/5 rounded-2xl text-left">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                    <Flame size={16} className="text-indigo-400" />
                  </div>
                  <p className="text-[11px] font-bold text-white uppercase mb-1">Direct</p>
                  <p className="text-[10px] text-slate-500">Real-time low latency delivery</p>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. PROFILE SIDEBAR - PROFESSIONAL STYLE */}
      {showProfileSidebar && viewingProfile && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-end animate-in fade-in duration-500">
          <div className="w-full sm:w-[420px] bg-[#0f172a] h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="p-8 flex items-center justify-between bg-[#1e293b]/30">
              <h2 className="text-xl font-bold text-white tracking-tight">Profile Details</h2>
              <button 
                onClick={() => setShowProfileSidebar(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center">
               <div className="relative mb-8 group">
                 <div className="absolute inset-0 bg-indigo-500/20 rounded-[50px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                 <div className={`w-48 h-48 rounded-[60px] flex items-center justify-center text-white font-black text-6xl shadow-2xl relative border-[6px] border-[#0f172a] bg-gradient-to-br transform group-hover:rotate-2 transition-all duration-500 overflow-hidden ${
                    viewingProfile.role?.includes('Placed') ? 'from-emerald-500 to-teal-400' : 
                    viewingProfile.role?.includes('Professional') ? 'from-indigo-600 to-blue-500' : 'from-orange-500 to-amber-400'
                 }`}>
                   {viewingProfile.avatar ? <img src={viewingProfile.avatar} alt="Profile" className="w-full h-full object-cover" /> : viewingProfile.name?.charAt(0).toUpperCase()}
                 </div>
                 {onlineUsers.includes(viewingProfile._id) && (
                   <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-[#0f172a] rounded-full shadow-xl" />
                 )}
               </div>
               
               <h3 className="text-3xl font-black text-white mb-2 text-center tracking-tight">{viewingProfile.name}</h3>
               <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
                 <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">{viewingProfile.role || 'PLACIFY MEMBER'}</p>
               </div>

               <div className="w-full space-y-4 mb-10">
                  <div className="w-full bg-[#1e293b]/50 backdrop-blur-sm rounded-[32px] p-6 border border-white/5 shadow-inner">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-3">Professional Contact</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between group cursor-pointer">
                        <span className="text-sm text-slate-400 font-medium">Email Address</span>
                        <span className="text-sm text-slate-100 font-bold group-hover:text-indigo-400 transition-colors">{viewingProfile.email || 'Restricted'}</span>
                      </div>
                      <div className="h-px bg-white/5"></div>
                      <div className="flex items-center justify-between group cursor-pointer">
                        <span className="text-sm text-slate-400 font-medium">Network ID</span>
                        <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">{viewingProfile._id?.slice(-8)}</span>
                      </div>
                    </div>
                  </div>

                  {viewingProfile.linkedinUrl && (
                    <a 
                      href={viewingProfile.linkedinUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full bg-[#1e293b] hover:bg-indigo-600 hover:translate-y-[-2px] rounded-2xl p-5 flex items-center justify-between transition-all duration-300 group border border-white/5 shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-white/20">
                          <ExternalLink size={18} className="text-blue-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-100 group-hover:text-white">LinkedIn Presence</span>
                      </div>
                      <ArrowLeft size={18} className="rotate-180 text-slate-600 group-hover:text-white" />
                    </a>
                  )}
               </div>

               <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                  <button className="py-4 bg-slate-900 hover:bg-red-500/10 rounded-2xl text-red-400 text-xs font-black flex items-center justify-center gap-3 transition-all border border-white/5 uppercase tracking-widest active:scale-95">
                    <UserX size={18} /> Block
                  </button>
                  <button className="py-4 bg-slate-900 hover:bg-orange-500/10 rounded-2xl text-orange-400 text-xs font-black flex items-center justify-center gap-3 transition-all border border-white/5 uppercase tracking-widest active:scale-95">
                    <ThumbsUp size={18} /> Report
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* REACTION POPUP - SLEEK STYLE */}
      {reactionSource && (
        <div 
          className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-sm" 
          onClick={() => setReactionSource(null)}
        >
          <div 
            className="fixed bg-[#1e293b] border border-white/10 rounded-[32px] p-3 shadow-2xl flex items-center gap-4 animate-in zoom-in-50 duration-300 ring-4 ring-black/20"
            style={{ 
              left: `${Math.min(reactionSource.x, window.innerWidth - 300)}px`, 
              top: `${Math.min(reactionSource.y - 80, window.innerHeight - 100)}px` 
            }}
          >
            {REACTION_EMOJIS.map(re => (
              <button 
                key={re.emoji} 
                onClick={(e) => { e.stopPropagation(); handleToggleReaction(reactionSource.messageId, re.emoji); }} 
                className="text-3xl hover:scale-150 active:scale-110 transition-all duration-200 p-1 drop-shadow-lg"
              >
                {re.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .professional-chat-bg {
          background-color: #020617;
          background-image: 
            radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 1) 0%, rgba(2, 6, 23, 0.8) 100%);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}
