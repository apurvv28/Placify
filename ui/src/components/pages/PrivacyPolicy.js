import React from 'react';
import StaticPageLayout from './StaticPageLayout';

const sections = [
  {
    heading: 'Data We Process',
    body: 'Placify processes account and resume data needed to provide ATS analysis, interview preparation features, and progress history.',
  },
  {
    heading: 'How We Use Data',
    body: 'We use your data to run core product features, improve analysis quality, and maintain service reliability. We do not sell user data.',
  },
  {
    heading: 'Your Controls',
    body: 'You can request updates or deletion of your account data through support channels. Keep your profile information accurate and avoid uploading sensitive personal identifiers unless necessary.',
  },
  {
    heading: 'Security',
    body: 'We apply reasonable technical and organizational safeguards to protect stored data and reduce unauthorized access risk.',
  },
];

export default function PrivacyPolicy() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle="How Placify handles user information responsibly."
      sections={sections}
    />
  );
}
