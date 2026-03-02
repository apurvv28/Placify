import React, { useState } from 'react';

export default function UserProfileSection({ user }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const profileType = user?.profileType?.replace('_', ' ') || 'Not set';
  const subRole =
    user?.profileType === 'working_professional'
      ? user?.workingRole?.toUpperCase()
      : user?.profileType === 'student'
      ? user?.studentStatus?.charAt(0).toUpperCase() + user?.studentStatus?.slice(1)
      : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Profile</h1>

      {/* Avatar + name card */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold shrink-0">
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email || 'No email'}</p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 capitalize">
              {profileType}
            </span>
            {subRole && (
              <span className="px-2.5 py-1 rounded-full text-xs bg-purple-500/15 text-purple-300 border border-purple-400/20">
                {subRole}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Account Details</h2>
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Full Name</label>
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-white px-4 py-2.5 outline-none focus:border-indigo-400/50 transition-colors"
              />
            ) : (
              <p className="text-sm text-gray-200">{user?.name || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email Address</label>
            <p className="text-sm text-gray-200">{user?.email || '—'}</p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Profile Type</label>
            <p className="text-sm text-gray-200 capitalize">{profileType}</p>
          </div>

          {subRole && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {user?.profileType === 'student' ? 'Placement Status' : 'Role'}
              </label>
              <p className="text-sm text-gray-200">{subRole}</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Member Since</label>
            <p className="text-sm text-gray-200">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="mt-5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
