import React, { useState } from 'react';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', color: 'from-indigo-500 to-blue-500' },
  { id: 'classic', name: 'Classic', color: 'from-gray-500 to-gray-700' },
  { id: 'creative', name: 'Creative', color: 'from-pink-500 to-purple-500' },
];

const SECTIONS = [
  { id: 'summary', title: 'Professional Summary', placeholder: 'Passionate full-stack developer with 2+ years of experience in React and Node.js...' },
  { id: 'experience', title: 'Experience', placeholder: 'SDE Intern at XYZ Corp — Built REST APIs serving 10k+ daily requests...' },
  { id: 'skills', title: 'Skills', placeholder: 'React, Node.js, TypeScript, MongoDB, Docker, Git, AWS...' },
  { id: 'projects', title: 'Projects', placeholder: 'Placify — Full-stack placement management platform with AI features...' },
  { id: 'education', title: 'Education', placeholder: 'B.Tech CSE — VIT University — CGPA 9.2...' },
];

export default function ResumeBuilderSection() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [activeField, setActiveField] = useState('summary');
  const [fields, setFields] = useState({
    summary: '',
    experience: '',
    skills: '',
    projects: '',
    education: '',
  });

  const handleChange = (id, value) => {
    setFields((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">AI Resume Builder</h1>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Download PDF
        </button>
      </div>

      {/* Template Picker */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-semibold mb-3">Choose Template</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTemplate(t.id)}
              className={`shrink-0 w-28 h-36 rounded-lg bg-gradient-to-br ${t.color} border-2 transition-all flex flex-col items-center justify-end pb-2 ${
                selectedTemplate === t.id
                  ? 'border-white shadow-lg scale-105'
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <div className="w-16 space-y-1 mb-2">
                <div className="h-1 rounded bg-white/50 w-full" />
                <div className="h-1 rounded bg-white/30 w-3/4" />
                <div className="h-1 rounded bg-white/30 w-full" />
                <div className="h-1 rounded bg-white/20 w-1/2" />
              </div>
              <span className="text-[10px] font-medium text-white/90">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Section Tabs (vertical) */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveField(s.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeField === s.id
                  ? 'bg-indigo-500/15 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Editing Area */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-5">
          {SECTIONS.filter((s) => s.id === activeField).map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{s.title}</h3>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/20 hover:bg-purple-500/25 transition-colors"
                >
                  ✨ AI Suggest
                </button>
              </div>
              <textarea
                value={fields[s.id]}
                onChange={(e) => handleChange(s.id, e.target.value)}
                placeholder={s.placeholder}
                rows={6}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 px-4 py-3 outline-none resize-none placeholder:text-gray-600 focus:border-indigo-400/50 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
