import React from 'react';
import StaticPageLayout from './StaticPageLayout';

const sections = [
  {
    heading: 'Acceptance Of Terms',
    body: 'By using Placify, you agree to these terms and to use the platform lawfully and responsibly.',
  },
  {
    heading: 'Service Scope',
    body: 'Placify provides resume and interview support tools for informational and educational purposes. Results are guidance, not guaranteed hiring outcomes.',
  },
  {
    heading: 'User Responsibilities',
    body: 'You are responsible for the content you upload and for maintaining confidentiality of your account credentials.',
  },
  {
    heading: 'Open Source And Pricing',
    body: 'Placify is provided as a free and open-source platform. There is no pricing page or paid subscription requirement in the core application.',
  },
];

export default function TermsAndConditions() {
  return (
    <StaticPageLayout
      title="Terms And Conditions"
      subtitle="Rules and expectations for using Placify."
      sections={sections}
    />
  );
}
