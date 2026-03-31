import React, { useEffect, useState, useRef, useCallback } from 'react';

const AVATAR_COLORS = ['#FF6B35', '#E8A430', '#D4621F', '#C8551A', '#FF3D00', '#FF8C5A', '#E87820', '#D96A2A'];
const colorFor = (id) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const roleBadge = (u) => {
  if (u.profileType === 'student') {
    return u.studentStatus === 'placed'
      ? { text: 'Placed', style: { backgroundColor: 'rgba(255,107,53,0.15)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.30)' } }
      : { text: 'Unplaced', style: { backgroundColor: '#2A2520', color: '#8A8078', border: '1px solid #2A2520' } };
  }
  if (u.profileType === 'working_professional') {
    return u.workingRole === 'hr'
      ? { text: 'HR', style: { backgroundColor: 'rgba(232,164,48,0.15)', color: '#E8A430', border: '1px solid rgba(232,164,48,0.30)' } }
      : { text: 'Employee', style: { backgroundColor: 'rgba(255,107,53,0.10)', color: '#A89E94', border: '1px solid rgba(255,107,53,0.20)' } };
  }
  return { text: 'User', style: { backgroundColor: '#1C1C1C', color: '#5C5550', border: '1px solid #2A2520' } };
};

const profileLabel = (u) => {
  if (u.profileType === 'student') return 'Student';
  if (u.profileType === 'working_professional') return 'Professional';
  return '';
};

const floatPos = (idx, total) => {
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  const cellW = 100 / cols;
  const cellH = 100 / Math.ceil(total / cols);
  const jitterX = ((idx * 17 + 7) % 11) - 5;
  const jitterY = ((idx * 13 + 3) % 11) - 5;
  return {
    left: `${col * cellW + cellW / 2 + jitterX * 0.4}%`,
    top: `${row * cellH + cellH / 2 + jitterY * 0.4}%`,
    animDelay: `${(idx * 0.6) % 4}s`,
    animDuration: `${5 + (idx % 4)}s`,
  };
};

export default function DashboardHome({ userName, token, onOpenChat }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const poolRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (query = '') => {
    try {
      const tkn = token || localStorage.getItem('placifyToken');
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/users${query ? `?search=${encodeURIComponent(query)}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${tkn}` } });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users || []);
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(val), 350);
  };

  const handleAvatarHover = (user, e) => {
    const rect = poolRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoveredUser(user);
  };

  const inputStyle = {
    width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
    backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderRadius: '10px',
    fontSize: '14px', color: '#F5F0EB', outline: 'none', fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div className="space-y-5 h-full">

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold border-l-2 pl-3"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB', borderLeftColor: '#FF6B35' }}
          >
            User Pool
          </h1>
          <p className="text-sm mt-0.5 pl-3" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
            {loading ? 'Loading users...' : `${users.length} user${users.length !== 1 ? 's' : ''} in the network`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="#5C5550" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text" value={search} onChange={handleSearch}
            placeholder="Search users by name or email..."
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.08)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* The Pool */}
      <div
        ref={poolRef}
        className="relative w-full rounded-xl overflow-hidden"
        style={{ minHeight: '520px', backgroundColor: 'rgba(28,28,28,0.4)', border: '1px solid #2A2520' }}
        onMouseLeave={() => setHoveredUser(null)}
      >
        {/* Ember ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[15%] w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(255,107,53,0.05)' }} />
          <div className="absolute bottom-10 right-[15%] w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(232,164,48,0.04)' }} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80" style={{ color: '#5C5550' }}>
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{search ? 'No users match your search' : 'No users in the pool yet'}</p>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: `${Math.max(520, Math.ceil(users.length / Math.ceil(Math.sqrt(users.length))) * 110 + 60)}px` }}>
            {users.map((u, idx) => {
              const pos = floatPos(idx, users.length);
              const initials = u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div
                  key={u.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: pos.left, top: pos.top, animation: `floatBubble ${pos.animDuration} ease-in-out ${pos.animDelay} infinite` }}
                  onMouseEnter={(e) => handleAvatarHover(u, e)}
                  onMouseMove={(e) => handleAvatarHover(u, e)}
                >
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg transition-all duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: colorFor(u.id),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,107,53,0.15)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,107,53,0.5), 0 0 16px rgba(255,107,53,0.20)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'}
                  >
                    {initials}
                  </div>
                  <p className="text-[10px] sm:text-xs text-center mt-1 truncate max-w-[80px] mx-auto transition-colors group-hover:text-white" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>
                    {u.name.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tooltip card */}
        {hoveredUser && (
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              left: `${Math.min(tooltipPos.x + 16, (poolRef.current?.offsetWidth || 400) - 260)}px`,
              top: `${Math.max(tooltipPos.y - 80, 8)}px`,
            }}
            onMouseEnter={() => { }}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <div
              className="w-60 rounded-xl p-4 shadow-2xl"
              style={{ backgroundColor: '#111111', border: '1px solid #2A2520', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: colorFor(hoveredUser.id) }}
                >
                  {hoveredUser.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{hoveredUser.name}</p>
                  <p className="text-xs truncate" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>{hoveredUser.email}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profileLabel(hoveredUser) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ backgroundColor: 'rgba(255,107,53,0.08)', color: '#A89E94', border: '1px solid #2A2520', fontFamily: 'JetBrains Mono, monospace' }}>
                    {profileLabel(hoveredUser)}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ ...roleBadge(hoveredUser).style, fontFamily: 'JetBrains Mono, monospace' }}>
                  {roleBadge(hoveredUser).text}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid #2A2520' }}>
                {/* Chat */}
                <button
                  title={`Chat with ${hoveredUser.name}`}
                  className="p-2 rounded-lg transition-colors border-none cursor-pointer"
                  style={{ backgroundColor: '#1C1C1C', color: '#5C5550' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,107,53,0.15)'; e.currentTarget.style.color = '#FF6B35'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#5C5550'; }}
                  onClick={(e) => { e.stopPropagation(); if (onOpenChat) onOpenChat(hoveredUser); setHoveredUser(null); }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 20.105V4.5A2.25 2.25 0 0 1 6 2.25h12A2.25 2.25 0 0 1 20.25 4.5v11.25a2.25 2.25 0 0 1-2.25 2.25H6.401l-2.651 2.605Z" />
                  </svg>
                </button>
                {/* Email */}
                <a
                  href={`mailto:${hoveredUser.email}`} title={`Email ${hoveredUser.name}`}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#1C1C1C', color: '#5C5550' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(232,164,48,0.15)'; e.currentTarget.style.color = '#E8A430'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#5C5550'; }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href={hoveredUser.linkedinUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(hoveredUser.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#1C1C1C', color: '#5C5550' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,107,53,0.12)'; e.currentTarget.style.color = '#FF6B35'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#5C5550'; }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatBubble {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          33% { transform: translate(-50%, -50%) translateY(-10px) translateX(5px); }
          66% { transform: translate(-50%, -50%) translateY(6px) translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
