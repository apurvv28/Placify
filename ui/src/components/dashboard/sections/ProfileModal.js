import React from 'react';
import { X, Mail, MapPin, GraduationCap, Briefcase, ExternalLink, Linkedin, Award } from 'lucide-react';

export default function ProfileModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-[#111b21] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-[#005c4b] to-[#00a884]">
           <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 -mt-16 relative">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-[#111b21] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            {user.isOnline && (
               <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#00a884] border-4 border-[#111b21] rounded-full" />
            )}
          </div>

          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            {user.studentStatus === 'placed' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider">
                <Award size={10} /> Placed
              </span>
            )}
             {user.studentStatus === 'unplaced' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold uppercase tracking-wider">
                 Unplaced
              </span>
            )}
          </div>

          <p className="text-[#8696a0] flex items-center gap-2 text-sm mb-6">
            <Mail size={14} /> {user.email}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[11px] text-[#8696a0] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                   <GraduationCap size={12} /> Education
                </p>
                <p className="text-sm text-gray-200">VIT University</p>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[11px] text-[#8696a0] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                   <Briefcase size={12} /> Role
                </p>
                <p className="text-sm text-gray-200 capitalize">{user.studentStatus || user.workingRole || 'Student'}</p>
             </div>
          </div>

          {/* Skills */}
          {user.skills && (
            <div className="mb-8">
               <p className="text-[11px] text-[#8696a0] uppercase font-bold tracking-widest mb-3">Skills & Expertise</p>
               <div className="flex flex-wrap gap-2">
                  {user.skills.split(',').map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[#111b21] border border-white/10 text-xs text-gray-300 rounded-lg hover:border-[#00a884] transition-colors cursor-default">
                      {skill.trim()}
                    </span>
                  ))}
               </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
             {user.linkedinUrl && (
                <a 
                  href={user.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0a66c2] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Linkedin size={18} /> LinkedIn Profile
                </a>
             )}
             <button 
               className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
               onClick={() => window.alert('Coming soon!')}
             >
               <Briefcase size={18} /> View Resume
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
