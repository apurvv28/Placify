import React, { useEffect, useState, useRef, useCallback } from 'react';

/* ─── colour palette for avatar backgrounds ─── */
const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500',
  'bg-sky-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
  'bg-fuchsia-500', 'bg-cyan-500', 'bg-lime-500', 'bg-orange-500',
];

const colorFor = (id) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

const roleBadge = (u) => {
  if (u.profileType === 'student') {
    return u.studentStatus === 'placed'
      ? { text: 'Placed', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
      : { text: 'Unplaced', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  }
  if (u.profileType === 'working_professional') {
    return u.workingRole === 'hr'
      ? { text: 'HR', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
      : { text: 'Employee', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
  }
  return { text: 'User', cls: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
};

const profileLabel = (u) => {
  if (u.profileType === 'student') return 'Student';
  if (u.profileType === 'working_professional') return 'Professional';
  return '';
};

/* ─── floating animation positions (seeded by index) ─── */
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

export default function DashboardHome({ userName, token }) {
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
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(val), 350);
  };

  const handleAvatarHover = (user, e) => {
    const rect = poolRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltipPos({ x, y });
    setHoveredUser(user);
  };

  return (
    <div className="space-y-5 h-full">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            User Pool
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading ? 'Loading users...' : `${users.length} user${users.length !== 1 ? 's' : ''} online`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      {/* ─── The Pool ─── */}
      <div
        ref={poolRef}
        className="relative w-full rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
        style={{ minHeight: '520px' }}
        onMouseLeave={() => setHoveredUser(null)}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[15%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-[15%] w-64 h-64 bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p className="text-sm">{search ? 'No users match your search' : 'No users in the pool yet'}</p>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: `${Math.max(520, Math.ceil(users.length / Math.ceil(Math.sqrt(users.length))) * 110 + 60)}px` }}>
            {users.map((u, idx) => {
              const pos = floatPos(idx, users.length);
              const initials = u.name

                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={u.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: pos.left, top: pos.top, animation: `floatBubble ${pos.animDuration} ease-in-out ${pos.animDelay} infinite` }}
                  onMouseEnter={(e) => handleAvatarHover(u, e)}
                  onMouseMove={(e) => handleAvatarHover(u, e)}
                >
                  {/* Avatar bubble */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${colorFor(u.id)} flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-black/30 ring-2 ring-white/10 group-hover:ring-indigo-400/60 group-hover:scale-110 transition-all duration-200`}>
                    {initials}
                  </div>
                  {/* Name label below avatar */}
                  <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-1 truncate max-w-[80px] mx-auto group-hover:text-white transition-colors">
                    {u.name.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Hover Tooltip Card ─── */}
        {hoveredUser && (
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              left: `${Math.min(tooltipPos.x + 16, (poolRef.current?.offsetWidth || 400) - 260)}px`,
              top: `${Math.max(tooltipPos.y - 80, 8)}px`,
            }}
            onMouseEnter={() => {}}
            onMouseLeave={() => setHoveredUser(null)}
          >
            <div className="w-60 rounded-xl bg-gray-900/95 border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/50 p-4">
              {/* User info */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${colorFor(hoveredUser.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {hoveredUser.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{hoveredUser.name}</p>
                  <p className="text-xs text-gray-400 truncate">{hoveredUser.email}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profileLabel(hoveredUser) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/5 text-gray-300 border-white/10">
                    {profileLabel(hoveredUser)}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleBadge(hoveredUser).cls}`}>
                  {roleBadge(hoveredUser).text}
                </span>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                {/* Chat (placeholder) */}
                <button
                  title="Chat (coming soon)"
                  className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 transition-colors"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 20.105V4.5A2.25 2.25 0 0 1 6 2.25h12A2.25 2.25 0 0 1 20.25 4.5v11.25a2.25 2.25 0 0 1-2.25 2.25H6.401l-2.651 2.605Z" />
                  </svg>
                </button>

                {/* Email */}
                <a
                  href={`mailto:${hoveredUser.email}`}
                  title={`Email ${hoveredUser.name}`}
                  className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={hoveredUser.linkedinUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(hoveredUser.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={hoveredUser.linkedinUrl ? `${hoveredUser.name}'s LinkedIn` : 'Search on LinkedIn'}
                  className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 transition-colors"
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

      {/* CSS keyframes for floating animation */}
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
