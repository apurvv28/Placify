import React from 'react';
import StaticPageLayout from './StaticPageLayout';

const sections = [
  {
    heading: 'Scoring Principles',
    body: 'Placify ATS analysis emphasizes clarity, keyword relevance, measurable impact, and structure quality across resume sections.',
  },
  {
    heading: 'Core Criteria',
    body: '1. Job-relevant keywords and skills alignment.\n2. Role-specific project and achievement evidence.\n3. Readable structure with clear section hierarchy.\n4. Concise bullet writing with action verbs and impact metrics.\n5. Technical stack and tools consistency with target role.',
  },
  {
    heading: 'Common Penalties',
    body: 'Missing role keywords, weak impact statements, excessive formatting complexity, and inconsistent section ordering may reduce ATS score.',
  },
  {
    heading: 'How To Improve',
    body: 'Tailor each resume for the target role, quantify outcomes, and keep content specific, truthful, and easy for both ATS systems and recruiters to scan.',
  },
];

export default function AtsAlgorithmCriteria() {
  return (
    <StaticPageLayout
      title="ATS Algorithm / Criteria"
      subtitle="The key signals Placify uses while analyzing resumes."
      sections={sections}
    />
  );
}
