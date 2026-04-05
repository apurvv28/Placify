import React from 'react';
import { Zap } from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'home', label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'community', label: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'ats-analyzer', label: 'ATS Analyzer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><circle cx="11" cy="15" r="3" /><path d="M13.5 17.5 16 20" />
      </svg>
    ),
  },
  {
    id: 'resume-builder', label: 'Resume Builder',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: 'interviewiq', label: 'InterviewIQ', route: '/interviewiq',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    ),
  },
  {
    id: 'chat', label: 'Chat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'placed-resumes', label: 'Placed Resumes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'profile', label: 'User Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function Sidebar({ collapsed, setCollapsed, activeSection, setActiveSection, onLogout, userName, mobileOpen, setMobileOpen, onNavRoute, resolveNavRoute }) {
  const handleNavClick = (item) => {
    const resolvedRoute = typeof resolveNavRoute === 'function' ? resolveNavRoute(item) : item.route;

    if (resolvedRoute && typeof onNavRoute === 'function') {
      onNavRoute(resolvedRoute);
      setMobileOpen(false);
      return;
    }
    setActiveSection(item.id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Brand + collapse toggle */}
      <div
        className="flex items-center justify-between px-4 h-16 shrink-0"
        style={{ borderBottom: '1px solid #1C1C1C' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
            <span
              className="text-lg font-bold"
              style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}
            >
              Placify
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
          className="p-1.5 rounded-lg transition-colors border-none cursor-pointer"
          style={{ backgroundColor: 'transparent', color: '#5C5550' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#F5F0EB'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5C5550'; }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          >
            <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item)}
              title={collapsed ? item.label : undefined}
              className="group relative w-full flex items-center gap-3 rounded-l-lg transition-all duration-200 border-none cursor-pointer"
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 8px' : '10px 12px',
                backgroundColor: isActive ? 'rgba(255,107,53,0.10)' : 'transparent',
                color: isActive ? '#FF6B35' : '#8A8078',
                borderRight: isActive ? '2px solid #FF6B35' : '2px solid transparent',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1C1C1C';
                  e.currentTarget.style.color = '#F5F0EB';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8A8078';
                }
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <span
                  className="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                  style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', color: '#F5F0EB' }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid #1C1C1C' }}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #E8A430)',
                boxShadow: '0 0 0 2px rgba(255,107,53,0.5)',
              }}
            >
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
              {/* Online indicator */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ backgroundColor: '#FF6B35', borderColor: '#0D0D0D' }}
              />
            </div>
            <span className="text-sm truncate" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              {userName || 'User'}
            </span>
          </div>
        )}

        <button
          type="button" onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors border-none cursor-pointer"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: '#5C5550',
            backgroundColor: 'transparent',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,61,0,0.08)'; e.currentTarget.style.color = '#FF3D00'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5C5550'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden border-none cursor-pointer"
        style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', color: '#F5F0EB' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? '68px' : '240px',
          backgroundColor: '#0D0D0D',
          borderRight: '1px solid #1C1C1C',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col lg:hidden transition-transform duration-300"
        style={{
          width: '260px',
          backgroundColor: '#0D0D0D',
          borderRight: '1px solid #1C1C1C',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
