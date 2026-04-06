# Placify: Technical Stack, AWS Stack, And Open-Source Stack

## 1. Technical Stack Overview

### 1.1 Frontend
- React 18
- React Router DOM 6
- Tailwind CSS 3
- Axios
- Socket.io Client
- Utility libraries: date-fns, react-markdown, html2pdf/jsPDF toolchain

### 1.2 Backend
- Node.js runtime
- Express 5
- Socket.io
- JWT authentication and bcrypt hashing
- Multer + document parsers for resume ingestion
- Repository pattern with DynamoDB Document Client

### 1.3 Persistence
- AWS DynamoDB (NoSQL)
- Table-based domain partitioning for users, posts, comments, resumes, messages, InterviewIQ entities

### 1.4 AI And NLP Components
- Google Gemini API
- Groq API
- AWS Bedrock runtime
- AWS Transcribe for speech-to-text
- Hugging Face inference for anti-cheat/person detection

## 2. AWS Stack Used In Placify

Core AWS services in active architecture:
- AWS DynamoDB
- AWS S3
- AWS Transcribe
- AWS Bedrock
- AWS IAM credentials/roles for runtime authorization

### 2.1 DynamoDB Role
- primary application datastore
- low-latency reads/writes for user-driven interactions
- flexible schema fit for evolving features and InterviewIQ metadata

### 2.2 S3 Role
- object storage for resume/interview assets
- temporary recording storage with expiry metadata for InterviewIQ uploads
- optional resume object serving via backend route

### 2.3 Transcribe Role
- converts uploaded interview audio/video speech into transcript text
- transcript drives downstream LLM and heuristic evaluation

### 2.4 Bedrock Role
- model runtime for InterviewIQ scoring/evaluation orchestration
- supports role-based and criteria-based response assessment logic

## 3. Open-Source Stack And Ecosystem
Placify relies heavily on open-source software for both product runtime and developer productivity.

### 3.1 Core Open-Source Dependencies
Frontend examples:
- react
- react-router-dom
- tailwindcss
- socket.io-client

Backend examples:
- express
- socket.io
- jsonwebtoken
- bcryptjs
- multer

AWS SDK and integrations:
- @aws-sdk/client-dynamodb
- @aws-sdk/lib-dynamodb
- @aws-sdk/client-s3
- @aws-sdk/client-transcribe
- @aws-sdk/client-bedrock-runtime

### 3.2 Why Open Source Matters Here
- faster iteration with community-vetted libraries,
- transparency for educational and capstone evaluation,
- reproducible setup across local/dev/cloud environments,
- easier onboarding for contributors and collaborators.

## 4. Development And Deployment Tooling
- npm-based package and script management
- nodemon for backend development
- react-scripts for frontend build/test lifecycle
- Vercel deployment for frontend and backend hosting
- environment-driven configuration for secrets and service endpoints

## 5. Configuration Surfaces
Main environment categories in this project:
- auth and security: JWT secrets, token lifetimes,
- AI providers: Gemini/Groq keys,
- AWS region and credentials,
- DynamoDB table bindings,
- S3 bucket/prefix controls,
- InterviewIQ-specific model and polling parameters,
- frontend API base URL.

## 6. Security And Operational Notes
- CORS allow-list and credentialed origin control in backend app.
- JWT-based API and socket authentication.
- Recommended least-privilege IAM policies for AWS access.
- Separate environment variables by deployment surface.
- Prefer key rotation and secret management through provider dashboards.

## 7. Suggested Future Stack Improvements
- Add TypeScript in backend for stronger API contracts.
- Introduce API schema validation layer (zod/joi).
- Add centralized observability (structured logs + metrics + traces).
- Add CI pipeline with lint, test, and build gates.
- Add infrastructure-as-code for reproducible AWS provisioning.
