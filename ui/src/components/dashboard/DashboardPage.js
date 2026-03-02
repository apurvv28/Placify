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

export default function DashboardPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem('placifyToken');
  const [user, setUser] = useState(() => {
    const userRaw = localStorage.getItem('placifyUser');
    return userRaw ? JSON.parse(userRaw) : null;
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [onboardingForm, setOnboardingForm] = useState({
    profileType: '',
    workingRole: '',
    studentStatus: '',
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed');

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('placifyUser', JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem('placifyToken');
        localStorage.removeItem('placifyUser');
        navigate('/auth');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [navigate, token]);

  if (!token) return <Navigate to="/auth" replace />;

  const handleLogout = () => {
    localStorage.removeItem('placifyToken');
    localStorage.removeItem('placifyUser');
    navigate('/auth');
  };

  const setProfileType = (value) => {
    setOnboardingError('');
    setOnboardingForm((prev) => ({ ...prev, profileType: value, workingRole: '', studentStatus: '' }));
  };
  const setWorkingRole = (value) => {
    setOnboardingError('');
    setOnboardingForm((prev) => ({ ...prev, workingRole: value }));
  };
  const setStudentStatus = (value) => {
    setOnboardingError('');
    setOnboardingForm((prev) => ({ ...prev, studentStatus: value }));
  };

  const handleOnboardingSubmit = async (event) => {
    event.preventDefault();
    if (!onboardingForm.profileType) { setOnboardingError('Please choose if you are a student or working professional'); return; }
    if (onboardingForm.profileType === 'working_professional' && !onboardingForm.workingRole) { setOnboardingError('Please choose if you are HR or employee'); return; }
    if (onboardingForm.profileType === 'student' && !onboardingForm.studentStatus) { setOnboardingError('Please choose if you are placed or unplaced'); return; }

    try {
      setIsSavingOnboarding(true);
      setOnboardingError('');
      const payload = { profileType: onboardingForm.profileType };
      if (onboardingForm.profileType === 'working_professional') payload.workingRole = onboardingForm.workingRole;
      if (onboardingForm.profileType === 'student') payload.studentStatus = onboardingForm.studentStatus;

      const response = await fetch('http://localhost:5000/api/auth/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) { setOnboardingError(data?.message || 'Unable to save onboarding details'); return; }
      setUser(data.user);
      localStorage.setItem('placifyUser', JSON.stringify(data.user));
    } catch (error) {
      setOnboardingError('Unable to connect to server');
    } finally {
      setIsSavingOnboarding(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loadingUser) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  /* ---------- Onboarding ---------- */
  if (user && !user.onboardingCompleted) {
    return (
      <main className="min-h-screen bg-black text-white px-4 py-8 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-16 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-16 right-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Placify</h1>
            <p className="text-gray-300 mt-2">Answer a few questions to personalize your experience.</p>
            <p className="text-xs text-indigo-300 mt-3">Step 1 of 1</p>

            <form className="mt-6 space-y-5" onSubmit={handleOnboardingSubmit}>
              <div>
                <p className="text-sm text-gray-300 mb-2">Are you a student or a working professional?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ v: 'student', t: 'Student', d: 'Campus placements and preparation' }, { v: 'working_professional', t: 'Working Professional', d: 'Hiring or career progression' }].map((o) => (
                    <button key={o.v} type="button" onClick={() => setProfileType(o.v)}
                      className={`text-left rounded-xl border px-4 py-4 transition-all ${onboardingForm.profileType === o.v ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_0_2px_rgba(99,102,241,0.25)]' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                      <p className="font-semibold">{o.t}</p>
                      <p className="text-sm text-gray-300 mt-1">{o.d}</p>
                    </button>
                  ))}
                </div>
              </div>

              {onboardingForm.profileType === 'working_professional' && (
                <div>
                  <p className="text-sm text-gray-300 mb-2">Are you HR or an employee?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ v: 'hr', t: 'HR', d: 'Manage hiring pipeline' }, { v: 'employee', t: 'Employee', d: 'Track opportunities' }].map((o) => (
                      <button key={o.v} type="button" onClick={() => setWorkingRole(o.v)}
                        className={`text-left rounded-xl border px-4 py-4 transition-all ${onboardingForm.workingRole === o.v ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_0_2px_rgba(168,85,247,0.25)]' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                        <p className="font-semibold">{o.t}</p>
                        <p className="text-sm text-gray-300 mt-1">{o.d}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onboardingForm.profileType === 'student' && (
                <div>
                  <p className="text-sm text-gray-300 mb-2">Are you placed or unplaced?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ v: 'placed', t: 'Placed', d: 'Already secured an offer' }, { v: 'unplaced', t: 'Unplaced', d: 'Looking for opportunities' }].map((o) => (
                      <button key={o.v} type="button" onClick={() => setStudentStatus(o.v)}
                        className={`text-left rounded-xl border px-4 py-4 transition-all ${onboardingForm.studentStatus === o.v ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_0_2px_rgba(52,211,153,0.25)]' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                        <p className="font-semibold">{o.t}</p>
                        <p className="text-sm text-gray-300 mt-1">{o.d}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onboardingError && <p className="text-sm text-red-300">{onboardingError}</p>}

              <button type="submit" disabled={isSavingOnboarding}
                className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold">
                {isSavingOnboarding ? 'Saving...' : 'Continue to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Section renderer ---------- */
  const renderSection = () => {
    switch (activeSection) {
      case 'community': return <CommunitySection />;
      case 'ats-analyzer': return <ATSAnalyzerSection />;
      case 'resume-builder': return <ResumeBuilderSection />;
      case 'chat': return <ChatSection />;
      case 'placed-resumes': return <PlacedResumesSection />;
      case 'profile': return <UserProfileSection user={user} />;
      default: return <DashboardHome userName={user?.name} token={token} />;
    }
  };

  /* ---------- Main Dashboard with Sidebar ---------- */
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
        userName={user?.name}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 sm:p-6 lg:p-8 pl-14 lg:pl-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
