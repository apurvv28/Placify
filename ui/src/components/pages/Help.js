import React from 'react';
import StaticPageLayout from './StaticPageLayout';

const sections = [
  {
    heading: 'How To Start',
    body: 'Create an account, upload your resume, and review your ATS insights. Then iterate on suggestions and re-check your score after improvements.',
  },
  {
    heading: 'Common Questions',
    body: 'Q: Is Placify paid?\nA: No. Placify is free and open source.\n\nQ: What resume format works best?\nA: PDF is recommended for consistency and ATS parsing.\n\nQ: Can I re-upload updated resumes?\nA: Yes. You can upload and analyze improved versions any time.',
  },
  {
    heading: 'Need More Support',
    body: 'For direct help, use the Contact page. Please include your issue, browser/device details, and screenshots when possible for faster support.',
  },
];

export default function Help() {
  return (
    <StaticPageLayout
      title="Help Center"
      subtitle="Quick guidance to get the most from Placify."
      sections={sections}
    />
  );
}
