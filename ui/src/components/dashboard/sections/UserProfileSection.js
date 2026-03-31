import React, { useState } from 'react';

const inputStyle = { width: '100%', backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderRadius: '8px', padding: '10px 14px', color: '#F5F0EB', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' };
const focusFns = {
  onFocus: e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.10)'; },
  onBlur:  e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; },
};

const AVATAR_COLORS = ['#FF6B35', '#E8A430', '#D4621F', '#C8551A', '#FF3D00', '#FF8C5A'];
const avatarColor = (name) => AVATAR_COLORS[(name || 'U').charCodeAt(0) % AVATAR_COLORS.length];

export default function UserProfileSection({ user, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    studentStatus: user?.studentStatus || '',
  });

  const profileType = user?.profileType?.replace('_', ' ') || 'Not set';
  // Use form.studentStatus if editing and we are replacing the view
  const displayStudentStatus = editing && user?.profileType === 'student' ? form.studentStatus : user?.studentStatus;
  const subRole = user?.profileType === 'working_professional' ? user?.workingRole?.toUpperCase() : user?.profileType === 'student' ? displayStudentStatus?.charAt(0).toUpperCase() + displayStudentStatus?.slice(1) : null;

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('placifyToken')}` },
        body: JSON.stringify({ name: form.name, studentStatus: user?.profileType === 'student' ? form.studentStatus : undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      if (onProfileUpdate) onProfileUpdate(data.user);
      setEditing(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-l-2 pl-3" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB', borderLeftColor: '#FF6B35' }}>User Profile</h1>

      {/* Avatar + name card */}
      <div className="rounded-xl flex flex-col sm:flex-row items-center gap-6 p-8 transition-colors" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,53,0.2)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2520'}
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shrink-0 shadow-2xl relative" style={{ backgroundColor: avatarColor(user?.name), border: '3px solid rgba(255,107,53,0.3)', fontFamily: 'Syne, sans-serif' }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full" style={{ backgroundColor: '#FF6B35', border: '4px solid #111111' }}></div>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>{user?.name || 'User Profile'}</h2>
          <p className="text-sm font-medium mb-3" style={{ color: '#E8A430', fontFamily: 'JetBrains Mono, monospace' }}>{user?.email || 'No email provided'}</p>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <span className="px-3 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest border" style={{ backgroundColor: 'rgba(255,107,53,0.12)', borderColor: 'rgba(255,107,53,0.30)', color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>
              {profileType}
            </span>
            {subRole && (
              <span className="px-3 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest border" style={{ backgroundColor: 'rgba(232,164,48,0.12)', borderColor: 'rgba(232,164,48,0.30)', color: '#E8A430', fontFamily: 'JetBrains Mono, monospace' }}>
                {subRole}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl p-8" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}>
        <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid #2A2520' }}>
          <h2 className="text-lg font-bold" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Account Details</h2>
          <button type="button" onClick={() => setEditing(!editing)} className="text-xs px-4 py-2 rounded-full font-bold uppercase tracking-widest border-none cursor-pointer transition-colors"
            style={{ backgroundColor: editing ? 'rgba(255,107,53,0.12)' : 'transparent', color: editing ? '#FF6B35' : '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}
            onMouseEnter={e => { if(!editing) { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#F5F0EB'; } }}
            onMouseLeave={e => { if(!editing) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5C5550'; } }}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-xs font-bold uppercase tracking-widest w-40 shrink-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Full Name</label>
            {editing ? (
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} {...focusFns} />
            ) : (
              <p className="text-sm font-medium" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{user?.name || '—'}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-xs font-bold uppercase tracking-widest w-40 shrink-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Email Address</label>
            <p className="text-sm font-medium" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{user?.email || '—'}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-xs font-bold uppercase tracking-widest w-40 shrink-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Profile Type</label>
            <p className="text-sm font-medium capitalize" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{profileType}</p>
          </div>

          {subRole && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="text-xs font-bold uppercase tracking-widest w-40 shrink-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>
                {user?.profileType === 'student' ? 'Placement Status' : 'Role'}
              </label>
              {editing && user?.profileType === 'student' ? (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#F5F0EB]">
                    <input type="radio" value="placed" checked={form.studentStatus === 'placed'} onChange={(e) => setForm({...form, studentStatus: e.target.value})} style={{ accentColor: '#FF6B35' }} /> Placed
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#F5F0EB]">
                    <input type="radio" value="unplaced" checked={form.studentStatus === 'unplaced'} onChange={(e) => setForm({...form, studentStatus: e.target.value})} style={{ accentColor: '#FF6B35' }} /> Unplaced
                  </label>
                </div>
              ) : (
                <p className="text-sm font-medium" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{subRole}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-xs font-bold uppercase tracking-widest w-40 shrink-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Member Since</label>
            <p className="text-sm font-medium" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        {editing && (
          <div className="mt-10 pt-6 flex justify-end items-center gap-4" style={{ borderTop: '1px solid #2A2520' }}>
            {error && <span style={{ color: '#FF3D00', fontSize: '13px' }}>{error}</span>}
            <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-lg text-sm font-bold text-white border-none cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(255,107,53,0.30)] hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', fontFamily: 'DM Sans, sans-serif' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
