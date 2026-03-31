const fs = require('fs');

const path = 'd:/VIT/Sem 4/Full Stack Development/Course-Project/Placify/ui/src/components/ResumeBuilder.js';
let content = fs.readFileSync(path, 'utf8');

// Colors & Borders
content = content.replace(/bg-white\/5/g, "bg-[#1C1C1C]");
content = content.replace(/border-white\/10/g, "border-[#2A2520]");
content = content.replace(/bg-white\/10/g, "bg-[#2A2520]");
content = content.replace(/border-white\/20/g, "border-[rgba(255,107,53,0.2)]");
content = content.replace(/hover:bg-white\/20/g, "hover:bg-[#FF6B35]/20");
content = content.replace(/hover:border-white\/30/g, "hover:border-[#FF6B35]/30");

// Text Colors
content = content.replace(/text-gray-200/g, "text-[#F5F0EB]");
content = content.replace(/text-gray-300/g, "text-[#A89E94]");
content = content.replace(/text-gray-400/g, "text-[#5C5550]");
content = content.replace(/text-gray-500/g, "text-[#5C5550]");
content = content.replace(/text-gray-600/g, "text-[#5C5550]");

// Accents (Indigo/Purple)
content = content.replace(/bg-indigo-600/g, "bg-gradient-to-r from-[#FF6B35] to-[#FF3D00]");
content = content.replace(/bg-indigo-500/g, "bg-[#FF6B35]");
content = content.replace(/text-indigo-400/g, "text-[#FF6B35]");
content = content.replace(/text-indigo-600/g, "text-[#FF6B35]");
content = content.replace(/from-indigo-500 to-purple-600/g, "from-[#FF6B35] to-[#E8A430]");
content = content.replace(/border-indigo-400\/50/g, "border-[#FF6B35]/50");
content = content.replace(/border-indigo-400/g, "border-[#FF6B35]");
content = content.replace(/hover:bg-indigo-500\/20/g, "hover:bg-[#FF6B35]/20");

// Specific buttons & effects
content = content.replace(/hover:bg-\[#c77dff\]/g, "hover:scale-105");
content = content.replace(/shadow-\[0_0_15px_rgba\(99,102,241,0\.5\)\]/g, "shadow-[0_0_15px_rgba(255,107,53,0.5)]");
content = content.replace(/bg-purple-500\/15 text-purple-300 border-purple-400\/20 hover:bg-purple-500\/25/g, "bg-[#E8A430]/15 text-[#E8A430] border-[#E8A430]/20 hover:bg-[#E8A430]/25");

// Typography
content = content.replace(/font-sans/g, "font-sans font-['DM_Sans']");
content = content.replace(/text-2xl font-bold/g, "text-2xl font-bold font-['Syne'] text-[#F5F0EB] border-l-2 border-[#FF6B35] pl-3");
content = content.replace(/font-semibold text-lg/g, "font-semibold text-lg font-['Syne'] text-[#F5F0EB]");
content = content.replace(/font-semibold mb-3/g, "font-semibold mb-3 font-['Syne'] text-[#F5F0EB]");

fs.writeFileSync(path, content, 'utf8');
console.log('ResumeBuilder Obsidian Ember Theme Applied.');
