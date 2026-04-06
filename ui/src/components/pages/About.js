import React from 'react';
import StaticPageLayout from './StaticPageLayout';

const sections = [
  {
    heading: 'Our Mission',
    body: 'Placify helps students and early-career professionals improve resume quality and interview readiness with practical, transparent tools.',
  },
  {
    heading: 'Free And Open Source',
    body: 'Placify is built to be free for everyone. The project follows an open-source-first mindset so the community can inspect, improve, and contribute to the platform.',
  },
  {
    heading: 'What We Focus On',
    body: 'We focus on ATS-aware resume feedback, interview practice support, and actionable insights that are easy to apply immediately.',
  },
];

export default function About() {
  return (
    <StaticPageLayout
      title="About Placify"
      subtitle="Learn what Placify stands for and why we keep the platform free and community-driven."
      sections={sections}
    />
  );
}
