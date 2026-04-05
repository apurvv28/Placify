import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';

export default function InterviewIQLayout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('placifyToken');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('interviewiq');

  const handleLogout = () => {
    localStorage.removeItem('placifyToken');
    localStorage.removeItem('placifyUser');
    navigate('/auth');
  };

  const resolveNavRoute = (item) => {
    if (item.id === 'interviewiq') return '/interviewiq';
    if (item.id === 'home') return '/dashboard';
    if (item.id === 'community') return '/dashboard?section=community';
    if (item.id === 'ats-analyzer') return '/dashboard?section=ats-analyzer';
    if (item.id === 'resume-builder') return '/dashboard?section=resume-builder';
    if (item.id === 'chat') return '/dashboard?section=chat';
    if (item.id === 'placed-resumes') return '/dashboard?section=placed-resumes';
    if (item.id === 'profile') return '/dashboard?section=profile';
    return null;
  };

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0A0A0A', color: '#F5F0EB' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
        userName={(() => {
          try {
            const userRaw = localStorage.getItem('placifyUser');
            return userRaw ? JSON.parse(userRaw)?.name : null;
          } catch {
            return null;
          }
        })()}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onNavRoute={(route) => navigate(route)}
        resolveNavRoute={resolveNavRoute}
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}