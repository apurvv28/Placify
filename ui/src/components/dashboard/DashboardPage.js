import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHome from './sections/DashboardHome';
import CommunitySection from './sections/CommunitySection';
import ATSAnalyzerSection from './sections/ATSAnalyzerSection';
import ResumeBuilderSection from './sections/ResumeBuilderSection';
import ChatSection from './sections/ChatSection';
import PlacedResumesSection from './sections/PlacedResumesSection';
import UserProfileSection from './sections/UserProfileSection';
import ChatbotIcon from '../chatbot/ChatbotIcon';

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('placifyToken');
  const [user, setUser] = useState(() => {
    try {
      const userRaw = localStorage.getItem('placifyUser');
      return userRaw ? JSON.parse(userRaw) : null;
    } catch { return null; }
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [onboardingForm, setOnboardingForm] = useState({ profileType: '', workingRole: '', studentStatus: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [preselectedChatUser, setPreselectedChatUser] = useState(null);

  const mapPoolUserToChatUser = (u) => {
    let role = 'Unplaced';
    if (u.profileType === 'working_professional') role = 'Professional';
    else if (u.studentStatus === 'placed') role = 'Placed';
    return { _id: u.id || u._id, name: u.name, email: u.email, avatar: u.avatar || null, role, isBlocked: false, profileType: u.profileType, studentStatus: u.studentStatus, workingRole: u.workingRole, linkedinUrl: u.linkedinUrl };
  };

  useEffect(() => {
    if (!token) { setLoadingUser(false); return; }
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setUser(data); localStorage.setItem('placifyUser', JSON.stringify(data));
      } catch {
        localStorage.removeItem('placifyToken'); localStorage.removeItem('placifyUser'); navigate('/auth');
      } finally { setLoadingUser(false); }
    };
    fetchCurrentUser();
  }, [navigate, token]);

  if (!token) return <Navigate to="/auth" replace />;

  const handleLogout = () => { localStorage.removeItem('placifyToken'); localStorage.removeItem('placifyUser'); navigate('/auth'); };

  const setProfileType = (v) => { setOnboardingError(''); setOnboardingForm((p) => ({ ...p, profileType: v, workingRole: '', studentStatus: '' })); };
  const setWorkingRole = (v) => { setOnboardingError(''); setOnboardingForm((p) => ({ ...p, workingRole: v })); };
  const setStudentStatus = (v) => { setOnboardingError(''); setOnboardingForm((p) => ({ ...p, studentStatus: v })); };

  const handleOnboardingSubmit = async (event) => {
    event.preventDefault();
    if (!onboardingForm.profileType) { setOnboardingError('Please choose if you are a student or working professional'); return; }
    if (onboardingForm.profileType === 'working_professional' && !onboardingForm.workingRole) { setOnboardingError('Please choose if you are HR or employee'); return; }
    if (onboardingForm.profileType === 'student' && !onboardingForm.studentStatus) { setOnboardingError('Please choose if you are placed or unplaced'); return; }
    try {
      setIsSavingOnboarding(true); setOnboardingError('');
      const payload = { profileType: onboardingForm.profileType };
      if (onboardingForm.profileType === 'working_professional') payload.workingRole = onboardingForm.workingRole;
      if (onboardingForm.profileType === 'student') payload.studentStatus = onboardingForm.studentStatus;
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/onboarding`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) { setOnboardingError(data?.message || 'Unable to save onboarding details'); return; }
      setUser(data.user); localStorage.setItem('placifyUser', JSON.stringify(data.user));
    } catch { setOnboardingError('Unable to connect to server'); }
    finally { setIsSavingOnboarding(false); }
  };

  /* Loading */
  if (loadingUser) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A0A0A', color: '#F5F0EB' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  /* Onboarding */
  if (user && !user.onboardingCompleted) {
    const obtnStyle = (active) => ({
      textAlign: 'left', borderRadius: '8px', border: active ? '1px solid rgba(255,107,53,0.5)' : '1px solid #2A2520',
      padding: '16px', transition: 'all 0.2s', cursor: 'pointer', backgroundColor: active ? 'rgba(255,107,53,0.08)' : '#1C1C1C',
      boxShadow: active ? '0 0 0 2px rgba(255,107,53,0.20)' : 'none',
    });

    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-12 relative overflow-hidden" style={{ backgroundColor: '#0A0A0A', color: '#F5F0EB' }}>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,107,53,0.07) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Welcome to Placify</h1>
            <p className="mt-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Answer a few questions to personalize your experience.</p>
            <p className="text-xs mt-3" style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>Step 1 of 1</p>

            <form className="mt-6 space-y-5" onSubmit={handleOnboardingSubmit}>
              <div>
                <p className="text-sm mb-2" style={{ color: '#A89E94' }}>Are you a student or a working professional?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ v: 'student', t: 'Student', d: 'Campus placements and preparation' }, { v: 'working_professional', t: 'Working Professional', d: 'Hiring or career progression' }].map((o) => (
                    <button key={o.v} type="button" onClick={() => setProfileType(o.v)} style={obtnStyle(onboardingForm.profileType === o.v)}>
                      <p className="font-semibold text-sm" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{o.t}</p>
                      <p className="text-xs mt-1" style={{ color: '#A89E94' }}>{o.d}</p>
                    </button>
                  ))}
                </div>
              </div>

              {onboardingForm.profileType === 'working_professional' && (
                <div>
                  <p className="text-sm mb-2" style={{ color: '#A89E94' }}>Are you HR or an employee?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ v: 'hr', t: 'HR', d: 'Manage hiring pipeline' }, { v: 'employee', t: 'Employee', d: 'Track opportunities' }].map((o) => (
                      <button key={o.v} type="button" onClick={() => setWorkingRole(o.v)} style={obtnStyle(onboardingForm.workingRole === o.v)}>
                        <p className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{o.t}</p>
                        <p className="text-xs mt-1" style={{ color: '#A89E94' }}>{o.d}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onboardingForm.profileType === 'student' && (
                <div>
                  <p className="text-sm mb-2" style={{ color: '#A89E94' }}>Are you placed or unplaced?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ v: 'placed', t: 'Placed', d: 'Already secured an offer' }, { v: 'unplaced', t: 'Unplaced', d: 'Looking for opportunities' }].map((o) => (
                      <button key={o.v} type="button" onClick={() => setStudentStatus(o.v)} style={obtnStyle(onboardingForm.studentStatus === o.v)}>
                        <p className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{o.t}</p>
                        <p className="text-xs mt-1" style={{ color: '#A89E94' }}>{o.d}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onboardingError && <p className="text-sm" style={{ color: '#FF6B35' }}>{onboardingError}</p>}

              <button
                type="submit" disabled={isSavingOnboarding}
                className="w-full mt-2 py-3 rounded-lg font-semibold border-none cursor-pointer text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', fontFamily: 'DM Sans, sans-serif' }}
              >
                {isSavingOnboarding ? 'Saving...' : 'Continue to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  /* Section renderer */
  const renderSection = () => {
    switch (activeSection) {
      case 'community': return <CommunitySection />;
      case 'ats-analyzer': return <ATSAnalyzerSection />;
      case 'resume-builder': return <ResumeBuilderSection />;
      case 'chat': return <ChatSection preselectedUser={preselectedChatUser} />;
      case 'placed-resumes': return <PlacedResumesSection />;
      case 'profile': return <UserProfileSection user={user} onProfileUpdate={(u) => { setUser(u); localStorage.setItem('placifyUser', JSON.stringify(u)); }} />;
      default:
        return (
          <DashboardHome
            userName={user?.name} token={token}
            onOpenChat={(poolUser) => { setPreselectedChatUser(mapPoolUserToChatUser(poolUser)); setActiveSection('chat'); }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0A0A0A', color: '#F5F0EB' }}>
      <Sidebar
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
        activeSection={activeSection} setActiveSection={setActiveSection}
        onLogout={handleLogout} userName={user?.name}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 sm:p-6 lg:p-8 pl-14 lg:pl-6">
          {renderSection()}
        </div>
      </main>
      <ChatbotIcon />
    </div>
  );
}
