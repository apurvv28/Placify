import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, X, Download, FileText, Sparkles, Upload } from 'lucide-react';

const API_URL = \`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resume\`;

const TEMPLATES = [
    { id: 'Template1', name: 'Sidebar Left', color: 'from-green-500 to-teal-500', image: '/images/template1.png' },
    { id: 'Template2', name: 'Profile Left', color: 'from-blue-500 to-indigo-500', image: '/images/template2.png' },
    { id: 'Template3', name: 'Brown Header', color: 'from-yellow-700 to-orange-800', image: '/images/template3.png' },
    { id: 'Template4', name: 'Blue Header', color: 'from-cyan-600 to-blue-800', image: '/images/template4.png' }
];

const SECTIONS = [
    { id: 'personalInfo', title: 'Personal Info' },
    { id: 'summary', title: 'Professional Summary' },
    { id: 'experience', title: 'Experience' },
    { id: 'skills', title: 'Skills' },
    { id: 'projects', title: 'Projects' },
    { id: 'education', title: 'Education' },
    { id: 'languages', title: 'Languages' },
];

export default function ResumeBuilder() {
    const [template, setTemplate] = useState('Template1');

    // Data States
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        zip: '',
        profileImage: '' // Used only in Template2
    });
    const [professionalSummary, setProfessionalSummary] = useState('');
    const [experience, setExperience] = useState([{ role: '', company: '', location: '', date: '', description: '' }]);
    const [skills, setSkills] = useState(['']);
    const [projects, setProjects] = useState(['']);
    const [education, setEducation] = useState([{ degree: '', institute: '', location: '', year: '' }]);
    const [languages, setLanguages] = useState([{ language: '', proficiency: '' }]);

    const [activeField, setActiveField] = useState('personalInfo');

    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [user, setUser] = useState(null);
    const resumeRef = useRef(null);

    useEffect(() => {
        const fetchResume = async () => {
            const token = localStorage.getItem('placifyToken');
            let uData = null;
            const u = localStorage.getItem('placifyUser');
            if (u) {
                try {
                    uData = JSON.parse(u);
                    setUser(uData);
                } catch (e) { }
            }
            if (!token) return;

            try {
                const { data } = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data) {
                    setTemplate(data.template || 'Template1');
                    setPersonalInfo({
                        name: data.personalInfo?.name || uData?.name || '',
                        email: data.personalInfo?.email || uData?.email || '',
                        phone: data.personalInfo?.phone || '',
                        location: data.personalInfo?.location || '',
                        zip: data.personalInfo?.zip || '',
                        profileImage: data.personalInfo?.profileImage || ''
                    });
                    setProfessionalSummary(data.professionalSummary || '');
                    setExperience(data.experience?.length ? data.experience : [{ role: '', company: '', location: '', date: '', description: '' }]);
                    setSkills(data.skills?.length ? data.skills : ['']);
                    setProjects(data.projects?.length ? data.projects : ['']);
                    setEducation(data.education?.length ? data.education : [{ degree: '', institute: '', location: '', year: '' }]);
                    setLanguages(data.languages?.length ? data.languages : [{ language: '', proficiency: '' }]);
                }
            } catch (error) {
                // Ignore if no resume exists yet, prepopulate with user details
                setPersonalInfo(prev => ({
                    ...prev,
                    name: uData?.name || '',
                    email: uData?.email || ''
                }));
            }
        };
        fetchResume();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem('placifyToken');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const handleAdd = async () => {
        setLoading(true);
        try {
            await axios.post(API_URL, {
                template,
                personalInfo,
                professionalSummary,
                experience: experience.filter(e => e.role.trim() || e.company.trim()),
                skills: skills.filter(e => e.trim()),
                projects: projects.filter(e => e.trim()),
                education: education.filter(e => e.degree.trim() || e.institute.trim()),
                languages: languages.filter(l => l.language.trim())
            }, getHeaders());
            alert('Resume saved successfully!');
        } catch (error) {
            console.error('Error saving resume', error);
            alert('Failed to save resume.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm('Are you sure you want to clear all your resume data?')) return;
        setLoading(true);
        try {
            await axios.delete(API_URL, getHeaders());
            setTemplate('Template1');
            setPersonalInfo({ name: user?.name || '', email: user?.email || '', phone: '', location: '', zip: '', profileImage: '' });
            setProfessionalSummary('');
            setExperience([{ role: '', company: '', location: '', date: '', description: '' }]);
            setSkills(['']);
            setProjects(['']);
            setEducation([{ degree: '', institute: '', location: '', year: '' }]);
            setLanguages([{ language: '', proficiency: '' }]);
            alert('Resume cleared successfully!');
        } catch (error) {
            console.error('Error clearing resume', error);
            alert('Failed to clear resume.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!resumeRef.current) return;
        try {
            const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${personalInfo.name || 'Resume'}_${template}.pdf`);
        } catch (error) {
            console.error('Error generating PDF', error);
            alert('Failed to generate PDF.');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPersonalInfo(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Complex Object Updaters ---

    const updateExperience = (index, field, value) => {
        const newList = [...experience];
        newList[index][field] = value;
        setExperience(newList);
    };

    const addExperience = () => setExperience([...experience, { role: '', company: '', location: '', date: '', description: '' }]);

    const removeExperience = (index) => {
        const newList = experience.filter((_, i) => i !== index);
        setExperience(newList.length ? newList : [{ role: '', company: '', location: '', date: '', description: '' }]);
    };

    const updateEducation = (index, field, value) => {
        const newList = [...education];
        newList[index][field] = value;
        setEducation(newList);
    };

    const addEducation = () => setEducation([...education, { degree: '', institute: '', location: '', year: '' }]);

    const removeEducation = (index) => {
        const newList = education.filter((_, i) => i !== index);
        setEducation(newList.length ? newList : [{ degree: '', institute: '', location: '', year: '' }]);
    };

    const updateLanguage = (index, field, value) => {
        const newList = [...languages];
        newList[index][field] = value;
        setLanguages(newList);
    };

    const addLanguage = () => setLanguages([...languages, { language: '', proficiency: '' }]);

    const removeLanguage = (index) => {
        const newList = languages.filter((_, i) => i !== index);
        setLanguages(newList.length ? newList : [{ language: '', proficiency: '' }]);
    };

    // --- Simple Array Updaters ---

    const updateSimpleList = (setter, list, index, value) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };

    const addSimpleList = (setter, list) => setter([...list, '']);

    const removeSimpleList = (setter, list, index) => {
        if (list.length === 1 && list[0] === '') return;
        const newList = list.filter((_, i) => i !== index);
        setter(newList.length ? newList : ['']);
    };

    // --- Rendering Helpers ---

    const renderInput = (label, value, onChange, placeholder, type = "text", isTextArea = false) => (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-xs text-gray-400 font-medium">{label}</label>
            {isTextArea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 px-3 py-2 outline-none resize-y min-h-[60px] focus:border-indigo-400/50 transition-colors"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 px-3 py-2 outline-none focus:border-indigo-400/50 transition-colors"
                />
            )}
        </div>
    );

    const getInitials = (name) => {
        if (!name) return 'A';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold">Resume Builder</h1>
                <div className="flex gap-3 flex-wrap items-center">
                    <button onClick={handleAdd} disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 font-semibold hover:bg-[#c77dff] hover:text-white transition-colors text-sm">Save Data</button>
                    <button onClick={handleClear} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600/80 font-semibold hover:bg-red-500 hover:text-white transition-colors text-sm text-white">Clear Data</button>
                    <button onClick={() => setShowPreview(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 text-white">
                        <FileText size={16} /> Preview & Download
                    </button>
                </div>
            </div>

            {/* Template Picker */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h2 className="font-semibold mb-3">Choose Template</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {TEMPLATES.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTemplate(t.id)}
                            className={`shrink-0 w-32 h-44 rounded-xl border-2 transition-all flex flex-col overflow-hidden relative ${template === t.id ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105' : 'border-white/10 opacity-60 hover:opacity-90 hover:border-white/30'
                                }`}
                        >
                            {/* Fallback pattern if image is missing */}
                            <div className="w-full h-full bg-white/5 absolute inset-0 flex items-center justify-center p-2 text-center text-xs text-gray-500">
                                <span>Save image to {t.image} to see preview</span>
                            </div>

                            <img
                                src={t.image}
                                alt={t.name}
                                className="w-full h-full object-cover relative z-10"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />

                            <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-md p-1.5 z-20">
                                <span className="text-[11px] font-semibold text-white block text-center">{t.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
                {/* Section Tabs */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible h-fit">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveField(s.id)}
                            className={`text-left px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${activeField === s.id ? 'bg-indigo-500 text-white font-semibold shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {s.title}
                        </button>
                    ))}
                </div>

                {/* Editing Area */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-5 min-h-[400px]">

                    {/* PERSONAL INFO */}
                    {activeField === 'personalInfo' && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderInput('Full Name', personalInfo.name, (v) => setPersonalInfo({ ...personalInfo, name: v }), 'e.g. Diya Agarwal')}
                                {renderInput('Email Address', personalInfo.email, (v) => setPersonalInfo({ ...personalInfo, email: v }), 'e.g. d.agarwal@sample.in', 'email')}
                                {renderInput('Phone Number', personalInfo.phone, (v) => setPersonalInfo({ ...personalInfo, phone: v }), 'e.g. +91 11 5555 3345', 'tel')}
                                {renderInput('City, Country', personalInfo.location, (v) => setPersonalInfo({ ...personalInfo, location: v }), 'e.g. New Delhi, India')}
                                {renderInput('Zip Code', personalInfo.zip, (v) => setPersonalInfo({ ...personalInfo, zip: v }), 'e.g. 110034')}
                            </div>

                            {/* Show profile image upload ONLY for Template2 */}
                            {template === 'Template2' && (
                                <div className="mt-6">
                                    <label className="text-xs text-gray-400 font-medium block mb-2">Profile Picture (Required for this template)</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-lg bg-white/10 overflow-hidden border border-white/20 flex items-center justify-center relative">
                                            {personalInfo.profileImage ? (
                                                <img src={personalInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-500 text-xs text-center px-2">No Image</span>
                                            )}
                                        </div>
                                        <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white flex items-center gap-2 transition-colors">
                                            <Upload size={16} /> Upload Photo
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                        {personalInfo.profileImage && (
                                            <button onClick={() => setPersonalInfo(prev => ({ ...prev, profileImage: '' }))} className="text-sm text-red-400 hover:text-red-300">Remove</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFESSIONAL SUMMARY */}
                    {activeField === 'summary' && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                <h3 className="font-semibold text-lg">Professional Summary</h3>
                                <button type="button" className="text-xs px-3 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/20 hover:bg-purple-500/25 transition-colors flex items-center gap-1">
                                    <Sparkles size={12} /> AI Suggest
                                </button>
                            </div>
                            <textarea
                                value={professionalSummary}
                                onChange={(e) => setProfessionalSummary(e.target.value)}
                                placeholder="Customer-focused professional with solid understanding of dynamics..."
                                className="w-full flex-1 min-h-[250px] rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 px-4 py-3 outline-none resize-none placeholder:text-gray-600 focus:border-indigo-400/50 transition-colors leading-relaxed"
                            />
                        </div>
                    )}

                    {/* EXPERIENCE */}
                    {activeField === 'experience' && (
                        <div>
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mb-4">Work Experience</h3>
                            <div className="space-y-6">
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="relative p-4 rounded-xl border border-white/10 bg-white/5">
                                        <button onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors p-1"><Trash2 size={16} /></button>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8 mb-4">
                                            {renderInput('Job Title', exp.role, (v) => updateExperience(idx, 'role', v), 'e.g. Retail Sales Associate')}
                                            {renderInput('Company Name', exp.company, (v) => updateExperience(idx, 'company', v), 'e.g. ZARA')}
                                            {renderInput('Location', exp.location, (v) => updateExperience(idx, 'location', v), 'e.g. New Delhi, India')}
                                            {renderInput('Dates (e.g. 02/2017 - Current)', exp.date, (v) => updateExperience(idx, 'date', v), 'e.g. Feb 2017 to Current')}
                                        </div>
                                        {renderInput('Responsibilities / Achievements', exp.description, (v) => updateExperience(idx, 'description', v), 'Increased monthly sales 10% by...\nUpsold seasonal drinks...', 'text', true)}
                                    </div>
                                ))}
                                <button onClick={addExperience} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-400 hover:text-white bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors border border-white/10">
                                    <Plus size={16} /> Add Experience
                                </button>
                            </div>
                        </div>
                    )}

                    {/* EDUCATION */}
                    {activeField === 'education' && (
                        <div>
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mb-4">Education & Training</h3>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="relative p-4 rounded-xl border border-white/10 bg-white/5">
                                        <button onClick={() => removeEducation(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors p-1"><Trash2 size={16} /></button>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                                            {renderInput('Degree / Diploma', edu.degree, (v) => updateEducation(idx, 'degree', v), 'e.g. Diploma in Financial Accounting')}
                                            {renderInput('Institute Name', edu.institute, (v) => updateEducation(idx, 'institute', v), 'e.g. Oxford Software Institute')}
                                            {renderInput('Location', edu.location, (v) => updateEducation(idx, 'location', v), 'e.g. New Delhi, India')}
                                            {renderInput('Graduation Year', edu.year, (v) => updateEducation(idx, 'year', v), 'e.g. 2016')}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addEducation} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-400 hover:text-white bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors border border-white/10">
                                    <Plus size={16} /> Add Education
                                </button>
                            </div>
                        </div>
                    )}

                    {/* LANGUAGES */}
                    {activeField === 'languages' && (
                        <div>
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mb-4">Languages</h3>
                            <div className="space-y-4">
                                {languages.map((lang, idx) => (
                                    <div key={idx} className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            {renderInput('Language', lang.language, (v) => updateLanguage(idx, 'language', v), 'e.g. English')}
                                        </div>
                                        <div className="flex-1">
                                            {renderInput('Proficiency Level', lang.proficiency, (v) => updateLanguage(idx, 'proficiency', v), 'e.g. Native / C2 / B2')}
                                        </div>
                                        <button onClick={() => removeLanguage(idx)} className="p-2 mb-1 text-red-400 hover:bg-red-400/20 rounded-lg border border-transparent transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={addLanguage} className="flex items-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-indigo-400 hover:text-white bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors border border-white/10 w-fit">
                                    <Plus size={16} /> Add Language
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SKILLS */}
                    {activeField === 'skills' && (
                        <div>
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mb-4">Skills</h3>
                            <div className="space-y-3 max-w-lg">
                                {skills.map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateSimpleList(setSkills, skills, idx, e.target.value)}
                                            className="flex-1 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 px-4 py-2.5 outline-none focus:border-indigo-400/50 transition-colors"
                                            placeholder="e.g. Cash register operation"
                                        />
                                        <button onClick={() => removeSimpleList(setSkills, skills, idx)} className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addSimpleList(setSkills, skills)} className="flex items-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-indigo-400 hover:text-white bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors border border-white/10 w-fit">
                                    <Plus size={16} /> Add Skill
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PROJECTS */}
                    {activeField === 'projects' && (
                        <div>
                            <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mb-4">Projects</h3>
                            <div className="space-y-3">
                                {projects.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <textarea
                                            value={item}
                                            onChange={(e) => updateSimpleList(setProjects, projects, idx, e.target.value)}
                                            className="flex-1 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 px-4 py-2.5 outline-none focus:border-indigo-400/50 transition-colors min-h-[60px] resize-y placeholder:text-gray-600"
                                            placeholder="e.g. Built an e-commerce platform using MEVN stack..."
                                        />
                                        <button onClick={() => removeSimpleList(setProjects, projects, idx)} className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-1">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addSimpleList(setProjects, projects)} className="flex items-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-indigo-400 hover:text-white bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-colors border border-white/10 w-fit">
                                    <Plus size={16} /> Add Project
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- COMPLEX PDF PREVIEW MODALS MATCHING THE 4 TEMPLATES --- */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#f0f2f5] rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden text-black shadow-2xl border border-gray-300">
                        {/* Top Bar inside Preview */}
                        <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-white flex-shrink-0 shadow-sm z-10">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <FileText size={20} className="text-indigo-600" /> Resume Preview ({template})
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={handleDownload} className="px-5 py-2 bg-indigo-600 text-white rounded-md font-semibold text-sm hover:bg-[#c77dff] transition-colors flex items-center gap-2 shadow-sm">
                                    <Download size={16} /> Download PDF
                                </button>
                                <button onClick={() => setShowPreview(false)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md font-bold text-sm hover:bg-gray-300 transition-colors flex items-center gap-2">
                                    <X size={16} /> Close
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex justify-center flex-1">
                            {/* Paper Container */}
                            <div
                                ref={resumeRef}
                                className="bg-white shadow-xl relative w-full max-w-[210mm] min-h-[297mm] box-border"
                                style={{
                                    fontFamily: '"Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, sans-serif',
                                    color: '#333333'
                                }}
                            >
                                {/* ================= TEMPLATE 1: Sidebar Left ================= */}
                                {template === 'Template1' && (
                                    <div className="flex h-full min-h-[297mm]">
                                        <div className="w-[30%] p-8 pt-12 flex flex-col pt-12">
                                            {/* Initial Box */}
                                            <div className="bg-black w-24 h-24 flex items-center justify-center mb-6 self-end">
                                                <span className="text-5xl font-light text-[#00c896] leading-none">{getInitials(personalInfo.name)}</span>
                                            </div>

                                            {/* Name */}
                                            <div className="text-right mb-6">
                                                <h1 className="text-2xl font-bold text-[#00c896] leading-tight flex flex-col">
                                                    {personalInfo.name.split(' ').map((n, i) => <span key={i}>{n}</span>)}
                                                </h1>
                                            </div>

                                            {/* Contact */}
                                            <div className="text-right text-[11px] space-y-2 text-gray-800 mt-2">
                                                {personalInfo.phone && <p>{personalInfo.phone}</p>}
                                                {personalInfo.email && <p>{personalInfo.email}</p>}
                                                {personalInfo.location && <p>{personalInfo.location}</p>}
                                                {personalInfo.zip && <p>{personalInfo.zip}</p>}
                                            </div>
                                        </div>

                                        <div className="w-[70%] p-8 pt-12 border-l border-gray-200 pr-12">
                                            {/* Summary */}
                                            {professionalSummary && (
                                                <div className="mb-6">
                                                    <h2 className="text-sm font-extrabold uppercase tracking-wide mb-3 text-black">Summary</h2>
                                                    <p className="text-[11px] leading-relaxed text-gray-800 whitespace-pre-wrap">{professionalSummary}</p>
                                                </div>
                                            )}

                                            {/* Skills */}
                                            {skills.filter(s => s.trim()).length > 0 && (
                                                <div className="mb-6">
                                                    <h2 className="text-sm font-extrabold uppercase tracking-wide mb-3 text-black">Skills</h2>
                                                    <ul className="text-[11px] leading-relaxed text-gray-800 list-disc pl-4 grid grid-cols-2 gap-x-4 gap-y-1">
                                                        {skills.filter(s => s.trim()).map((s, i) => <li key={i} className="pl-1">{s}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Experience */}
                                            {experience.filter(e => e.role || e.company).length > 0 && (
                                                <div className="mb-6">
                                                    <h2 className="text-sm font-extrabold uppercase tracking-wide mb-3 text-black">Experience</h2>
                                                    <div className="space-y-4">
                                                        {experience.filter(e => e.role || e.company).map((exp, i) => (
                                                            <div key={i} className="text-[11px] text-gray-800">
                                                                <div className="mb-1">
                                                                    <span className="text-black font-medium">{exp.role}</span>
                                                                </div>
                                                                {(exp.location || exp.company || exp.date) && (
                                                                    <div className="mb-2">
                                                                        {exp.location && <span>{exp.location}</span>}
                                                                        {exp.location && exp.company && <br />}
                                                                        {exp.company && <span className="font-medium">{exp.company}</span>}
                                                                        {exp.company && exp.date && <span> / {exp.date}</span>}
                                                                        {!exp.company && exp.date && <span>{exp.date}</span>}
                                                                    </div>
                                                                )}
                                                                {exp.description && (
                                                                    <ul className="list-disc pl-4 space-y-1">
                                                                        {exp.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                                                            <li key={idx} className="pl-1">{line}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {education.filter(e => e.degree || e.institute).length > 0 && (
                                                <div className="mb-6">
                                                    <h2 className="text-sm font-extrabold uppercase tracking-wide mb-3 text-black">Education And Training</h2>
                                                    <div className="space-y-3 block">
                                                        {education.filter(e => e.degree || e.institute).map((edu, i) => (
                                                            <div key={i} className="text-[11px] text-gray-800 leading-snug">
                                                                {edu.degree && <div>{edu.degree}</div>}
                                                                {edu.institute && <div>{edu.institute} {edu.year}</div>}
                                                                {edu.location && <div>{edu.location}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Languages */}
                                            {languages.filter(l => l.language).length > 0 && (
                                                <div>
                                                    <h2 className="text-sm font-extrabold uppercase tracking-wide mb-3 text-black">Languages</h2>
                                                    <div className="text-[11px] grid grid-cols-2 gap-x-8 gap-y-4">
                                                        {languages.filter(l => l.language).map((l, i) => (
                                                            <div key={i}>
                                                                <div className="flex justify-between mb-1">
                                                                    <span className="text-gray-800">{l.language}:</span>
                                                                    <span className="text-gray-800">{l.proficiency}</span>
                                                                </div>
                                                                <div className="h-1 bg-gray-200 w-full rounded overflow-hidden">
                                                                    <div className="h-full bg-[#00c896] rounded w-3/4"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ================= TEMPLATE 2: Profile Left ================= */}
                                {template === 'Template2' && (
                                    <div className="p-10 min-h-[297mm]">
                                        {/* Top Header Section */}
                                        <div className="border-t-[16px] border-[#5e7485] absolute top-0 left-0 right-0"></div>
                                        <div className="flex mt-2 mb-8 items-center gap-8 border-b-2 border-gray-300 pb-8">
                                            {/* Profile Image Column */}
                                            <div className="w-[30%]">
                                                {personalInfo.profileImage ? (
                                                    <img src={personalInfo.profileImage} alt="Profile" className="w-[120px] h-[120px] object-cover" />
                                                ) : (
                                                    <div className="w-[120px] h-[120px] bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Photo</div>
                                                )}
                                            </div>
                                            {/* Header Content Column */}
                                            <div className="w-[70%] text-gray-600">
                                                <h1 className="text-3xl font-bold text-[#5e7485] uppercase tracking-wider mb-4">{personalInfo.name || 'YOUR NAME'}</h1>
                                                <div className="text-[11px] space-y-1.5 font-medium flex flex-col">
                                                    {personalInfo.location && <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#5e7485] text-white flex items-center justify-center text-[8px] tracking-tight">Q</span> {personalInfo.location} {personalInfo.zip}</div>}
                                                    {personalInfo.phone && <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#5e7485] text-white flex items-center justify-center text-[8px] tracking-tight">✆</span> {personalInfo.phone}</div>}
                                                    {personalInfo.email && <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#5e7485] text-white flex items-center justify-center text-[8px] tracking-tight">✉</span> {personalInfo.email}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shared body layout logic for T2, T3, T4 */}
                                        <div className="flex flex-col gap-6">
                                            {/* Summary */}
                                            {professionalSummary && (
                                                <div className="flex gap-8 border-b-2 border-gray-300 pb-6">
                                                    <div className="w-[30%]"><h2 className="text-xs font-bold uppercase tracking-widest text-[#1f1f1f]">Summary</h2></div>
                                                    <div className="w-[70%]"><p className="text-[11px] leading-relaxed text-[#1f1f1f] pr-6">{professionalSummary}</p></div>
                                                </div>
                                            )}

                                            {/* Skills */}
                                            {skills.filter(s => s.trim()).length > 0 && (
                                                <div className="flex gap-8 border-b-2 border-gray-300 pb-6">
                                                    <div className="w-[30%]"><h2 className="text-xs font-bold uppercase tracking-widest text-[#1f1f1f]">Skills</h2></div>
                                                    <div className="w-[70%]">
                                                        <ul className="text-[11px] leading-relaxed text-[#1f1f1f] list-disc pl-4 grid grid-cols-2 gap-x-4 gap-y-1 pr-6">
                                                            {skills.filter(s => s.trim()).map((s, i) => <li key={i}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Experience */}
                                            {experience.filter(e => e.role || e.company).length > 0 && (
                                                <div className="flex gap-8 border-b-2 border-gray-300 pb-6">
                                                    <div className="w-[30%]"><h2 className="text-xs font-bold uppercase tracking-widest text-[#1f1f1f]">Experience</h2></div>
                                                    <div className="w-[70%] space-y-4 pr-6">
                                                        {experience.filter(e => e.role || e.company).map((exp, i) => (
                                                            <div key={i} className="text-[11px] text-[#1f1f1f]">
                                                                <div className="mb-1 uppercase">
                                                                    <span className="font-bold">{exp.role}</span>
                                                                    {exp.date && <span className="font-normal">, {exp.date}</span>}
                                                                </div>
                                                                {(exp.company || exp.location) && (
                                                                    <div className="mb-2 italic focus:not-italic font-bold">
                                                                        {exp.company}{exp.company && exp.location ? ', ' : ''}{exp.location}
                                                                    </div>
                                                                )}
                                                                {exp.description && (
                                                                    <ul className="list-disc pl-4 space-y-1">
                                                                        {exp.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                                                            <li key={idx} className="pl-1">{line}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {education.filter(e => e.degree || e.institute).length > 0 && (
                                                <div className="flex gap-8 border-b-2 border-gray-300 pb-6">
                                                    <div className="w-[30%]"><h2 className="text-xs font-bold uppercase tracking-widest text-[#1f1f1f]">Education and Training</h2></div>
                                                    <div className="w-[70%] space-y-3 pr-6">
                                                        {education.filter(e => e.degree || e.institute).map((edu, i) => (
                                                            <div key={i} className="text-[11px] text-[#1f1f1f] leading-snug">
                                                                <div className="font-bold italic">{edu.institute}{edu.institute && edu.location ? ', ' : ''}{edu.location}{edu.year ? `, ${edu.year}` : ''}</div>
                                                                {edu.degree && <div className="font-bold">{edu.degree}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Languages */}
                                            {languages.filter(l => l.language).length > 0 && (
                                                <div className="flex gap-8 pb-6">
                                                    <div className="w-[30%]"><h2 className="text-xs font-bold uppercase tracking-widest text-[#1f1f1f]">Languages</h2></div>
                                                    <div className="w-[70%] text-[11px] grid grid-cols-2 gap-x-8 gap-y-4 pr-6">
                                                        {languages.filter(l => l.language).map((l, i) => (
                                                            <div key={i}>
                                                                <div className="flex justify-between mb-1 text-[#1f1f1f]">
                                                                    <span>{l.language}:</span>
                                                                    <span>{l.proficiency}</span>
                                                                </div>
                                                                <div className="h-[6px] bg-gray-200 w-full overflow-hidden">
                                                                    <div className="h-full bg-[#5e7485] w-2/3"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ================= TEMPLATE 3: Brown Header ================= */}
                                {template === 'Template3' && (
                                    <div className="min-h-[297mm]">
                                        {/* Full width Brown Header */}
                                        <div className="bg-[#a8938d] px-12 py-10 flex text-white justify-between">
                                            <div className="w-1/2">
                                                <h1 className="text-4xl font-light tracking-wide uppercase flex flex-col leading-tight">
                                                    {personalInfo.name.split(' ').map((n, i) => <span key={i}>{n}</span>)}
                                                </h1>
                                            </div>
                                            <div className="w-1/2 text-right text-[11px] space-y-1.5 flex flex-col justify-end tracking-wide font-medium">
                                                {personalInfo.email && <p>{personalInfo.email}</p>}
                                                {personalInfo.phone && <p>{personalInfo.phone}</p>}
                                                {personalInfo.location && <p>{personalInfo.location} {personalInfo.zip}</p>}
                                            </div>
                                        </div>

                                        <div className="p-12 flex flex-col gap-6 font-sans">
                                            {/* Shared Body for T3, slightly modified styles */}
                                            {professionalSummary && (
                                                <div className="flex gap-8 pb-4">
                                                    <div className="w-[30%] text-right"><h2 className="text-xs font-medium uppercase tracking-widest text-[#b8a6a1]">Summary</h2></div>
                                                    <div className="w-[70%]"><p className="text-[11px] leading-relaxed text-gray-800 pr-4">{professionalSummary}</p></div>
                                                </div>
                                            )}

                                            {skills.filter(s => s.trim()).length > 0 && (
                                                <div className="flex gap-8 pb-4">
                                                    <div className="w-[30%] text-right"><h2 className="text-xs font-medium uppercase tracking-widest text-[#b8a6a1]">Skills</h2></div>
                                                    <div className="w-[70%]">
                                                        <ul className="text-[11px] leading-relaxed text-gray-800 list-disc pl-4 grid grid-cols-2 gap-x-4 gap-y-1">
                                                            {skills.filter(s => s.trim()).map((s, i) => <li key={i}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {experience.filter(e => e.role || e.company).length > 0 && (
                                                <div className="flex gap-8 pb-4">
                                                    <div className="w-[30%] text-right"><h2 className="text-xs font-medium uppercase tracking-widest text-[#b8a6a1]">Experience</h2></div>
                                                    <div className="w-[70%] space-y-5">
                                                        {experience.filter(e => e.role || e.company).map((exp, i) => (
                                                            <div key={i} className="text-[11px] text-gray-800">
                                                                <div className="mb-0.5 uppercase flex flex-col">
                                                                    <span className="font-bold text-black">{exp.role} {exp.date ? `| ${exp.date}` : ''}</span>
                                                                </div>
                                                                {(exp.company || exp.location) && (
                                                                    <div className="mb-2 font-bold text-black">
                                                                        {exp.company}{exp.company && exp.location ? ' - ' : ''}{exp.location}
                                                                    </div>
                                                                )}
                                                                {exp.description && (
                                                                    <ul className="list-disc pl-5 space-y-1">
                                                                        {exp.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                                                            <li key={idx} className="pl-1">{line}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {education.filter(e => e.degree || e.institute).length > 0 && (
                                                <div className="flex gap-8 pb-4">
                                                    <div className="w-[30%] text-right"><h2 className="text-xs font-medium uppercase tracking-widest text-[#b8a6a1]">Education And Training</h2></div>
                                                    <div className="w-[70%] space-y-3">
                                                        {education.filter(e => e.degree || e.institute).map((edu, i) => (
                                                            <div key={i} className="text-[11px] text-black font-bold leading-snug">
                                                                <div>{edu.institute}{edu.institute && edu.location ? ' - ' : ''}{edu.location}</div>
                                                                <div>{edu.degree}</div>
                                                                {edu.year && <div className="font-normal text-gray-800 mt-1">{edu.year}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {languages.filter(l => l.language).length > 0 && (
                                                <div className="flex gap-8 pb-4">
                                                    <div className="w-[30%] text-right"><h2 className="text-xs font-medium uppercase tracking-widest text-[#b8a6a1]">Languages</h2></div>
                                                    <div className="w-[70%] text-[11px] grid grid-cols-2 gap-x-8 gap-y-4">
                                                        {languages.filter(l => l.language).map((l, i) => (
                                                            <div key={i}>
                                                                <div className="flex justify-between mb-1 text-black font-medium">
                                                                    <span>{l.language}:</span>
                                                                    <span>{l.proficiency}</span>
                                                                </div>
                                                                <div className="h-[4px] bg-gray-200 w-full overflow-hidden shrink-0">
                                                                    <div className="h-full bg-[#a8938d] w-2/3"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ================= TEMPLATE 4: Blue Header ================= */}
                                {template === 'Template4' && (
                                    <div className="min-h-[297mm]">
                                        {/* Header area - Two bars */}
                                        <div className="bg-[#cbdce8] px-10 py-8">
                                            <h1 className="text-[34px] font-bold tracking-widest uppercase text-[#1a1c20]">{personalInfo.name || 'YOUR NAME'}</h1>
                                        </div>
                                        <div className="bg-[#4b4a48] px-10 py-3 flex text-white text-[10px] items-center font-medium gap-8 tracking-wide">
                                            {personalInfo.email && <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-white flex justify-center items-center font-bold text-[8px]">@</span> {personalInfo.email}</div>}
                                            {personalInfo.phone && <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-white flex justify-center items-center font-bold text-[8px]">✆</span> {personalInfo.phone}</div>}
                                            {personalInfo.location && <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-white flex justify-center items-center font-bold text-[8px]">P</span> {personalInfo.location} {personalInfo.zip}</div>}
                                        </div>

                                        <div className="p-10 flex flex-col gap-6">
                                            {/* Summary */}
                                            {professionalSummary && (
                                                <div className="pb-2">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-3">Summary</h2>
                                                    <p className="text-[11px] leading-relaxed text-black font-medium">{professionalSummary}</p>
                                                </div>
                                            )}

                                            {/* Skills */}
                                            {skills.filter(s => s.trim()).length > 0 && (
                                                <div className="pb-2">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-3">Skills</h2>
                                                    <ul className="text-[11px] font-medium leading-relaxed text-black grid grid-cols-2 gap-x-12 gap-y-1">
                                                        {skills.filter(s => s.trim()).map((s, i) => (
                                                            <li key={i} className="flex gap-2 items-start"><span className="text-[8px] leading-[18px]">●</span> {s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Experience */}
                                            {experience.filter(e => e.role || e.company).length > 0 && (
                                                <div className="pb-2">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-4">Experience</h2>
                                                    <div className="space-y-5">
                                                        {experience.filter(e => e.role || e.company).map((exp, i) => (
                                                            <div key={i} className="text-[11px] text-black flex">
                                                                <div className="w-[20%] text-gray-500">{exp.date}</div>
                                                                <div className="w-[80%] border-l-2 border-gray-100 pl-4 pb-2">
                                                                    <div className="mb-0.5">
                                                                        <span className="font-bold italic">{exp.role}</span>{exp.company ? `, ${exp.company}` : ''}{exp.location ? `, ${exp.location}` : ''}
                                                                    </div>
                                                                    {exp.description && (
                                                                        <ul className="mt-2 space-y-1 font-medium">
                                                                            {exp.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                                                                <li key={idx} className="flex gap-2 items-start"><span className="text-[8px] leading-[18px]">●</span> {line}</li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {education.filter(e => e.degree || e.institute).length > 0 && (
                                                <div className="pb-2">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-4">Education And Training</h2>
                                                    <div className="space-y-3">
                                                        {education.filter(e => e.degree || e.institute).map((edu, i) => (
                                                            <div key={i} className="text-[11px] text-black flex font-bold">
                                                                <div className="w-[20%] text-gray-500 font-normal">{edu.year}</div>
                                                                <div className="w-[80%] border-l-2 border-gray-100 pl-4">
                                                                    <div>{edu.degree}</div>
                                                                    <div className="italic">{edu.institute}{edu.institute && edu.location ? ', ' : ''}{edu.location}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Languages */}
                                            {languages.filter(l => l.language).length > 0 && (
                                                <div className="pb-0">
                                                    <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-4">Languages</h2>
                                                    <div className="text-[11px] grid grid-cols-2 gap-x-12 gap-y-4">
                                                        {languages.filter(l => l.language).map((l, i) => (
                                                            <div key={i}>
                                                                <div className="flex justify-between mb-1 text-black font-medium">
                                                                    <span>{l.language}:</span>
                                                                    <span>{l.proficiency}</span>
                                                                </div>
                                                                <div className="h-[4px] bg-gray-200 w-full overflow-hidden shrink-0">
                                                                    <div className="h-full bg-[#005c97] w-2/3"></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
