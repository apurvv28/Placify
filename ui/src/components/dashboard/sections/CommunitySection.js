import React, { useState } from 'react';

const POSTS = [
  { id: 1, author: 'Ananya S.', avatar: 'A', time: '20 min ago', content: 'Just cleared Amazon OA! DM me for tips on the coding round.', likes: 24, replies: 8, tag: 'Success Story' },
  { id: 2, author: 'Rahul K.', avatar: 'R', time: '1 hr ago', content: 'Anyone preparing for Goldman Sachs aptitude? Let\'s form a study group.', likes: 15, replies: 12, tag: 'Study Group' },
  { id: 3, author: 'Priya M.', avatar: 'P', time: '3 hrs ago', content: 'Sharing my Flipkart SDE-1 interview experience — 3 rounds, mostly DSA + system design basics.', likes: 42, replies: 18, tag: 'Interview Exp' },
  { id: 4, author: 'Dev T.', avatar: 'D', time: '5 hrs ago', content: 'Resume review thread — drop yours and get peer feedback before placement week!', likes: 31, replies: 22, tag: 'Resume Help' },
];

const TABS = ['All Posts', 'Interview Exp', 'Study Group', 'Resume Help', 'Success Story'];

export default function CommunitySection() {
  const [activeTab, setActiveTab] = useState('All Posts');

  const filtered = activeTab === 'All Posts' ? POSTS : POSTS.filter((p) => p.tag === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Community</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2,480 members
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* New post */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
          Y
        </div>
        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-gray-500 cursor-text">
          Share something with the community...
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {filtered.map((post) => (
          <article key={post.id} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{post.author}</span>
                  <span className="text-xs text-gray-500">{post.time}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{post.tag}</span>
                </div>
                <p className="text-sm text-gray-200 mt-1.5">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <button type="button" className="flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                    {post.likes}
                  </button>
                  <button type="button" className="flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    {post.replies} replies
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
