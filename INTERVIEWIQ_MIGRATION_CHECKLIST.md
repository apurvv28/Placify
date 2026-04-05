# InterviewIQ Migration Checklist

## 1. Environment Variables

Backend (`backend/.env`):

- `DYNAMODB_INTERVIEWIQ_QUESTIONS_TABLE=InterviewIQ_Questions`
- `DYNAMODB_INTERVIEWIQ_DECKS_TABLE=InterviewIQ_Decks`
- `DYNAMODB_INTERVIEWIQ_RESPONSES_TABLE=InterviewIQ_Responses`
- `DYNAMODB_INTERVIEWIQ_USER_PROGRESS_TABLE=InterviewIQ_UserProgress`
- `S3_INTERVIEWIQ_BUCKET=placify-interview-recordings`
- `INTERVIEWIQ_ADMIN_EMAILS=admin1@example.com,admin2@example.com`
- Optional: `HUGGINGFACE_API_KEY=...`

## 2. DynamoDB Tables

Create the following tables (on-demand capacity is recommended initially):

### InterviewIQ_Questions
- PK: `questionId` (String)
- Attributes: `text`, `type`, `difficulty`, `category`, `keywords`, `starHints`, `sampleAnswer`

### InterviewIQ_Decks
- PK: `userId` (String)
- SK: `deckNumber` (Number)
- Attributes: `deckId`, `questionIds`, `status`, `startedAt`, `completedAt`, `totalScore`, `createdAt`

### InterviewIQ_Responses
- PK: `userId` (String)
- SK: `responseId` (String)
- Attributes: `questionId`, `questionType`, `category`, `deckId`, `deckNumber`, `s3Key`, `status`, `transcriptText`, `llmScores`, `keywordScores`, `antiCheatResult`, `finalScore`, `recordedAt`, `completedAt`

### InterviewIQ_UserProgress
- PK: `userId` (String)
- Attributes: `currentDeck`, `completedDecks`, `totalScore`, `badges`, `streakData`, `weakAreas`, `updatedAt`

## 3. S3 Recording Bucket

Create bucket: `placify-interview-recordings` (or custom via env var).

Recommended lifecycle rule:
- Prefix: all objects
- Expiration: delete objects after 7 days

Recommended CORS:
- Allowed origins: frontend origins
- Allowed methods: `PUT, POST, GET, HEAD`
- Allowed headers: `*`

## 4. Seed Question Bank

After deploy, run this authenticated request as admin:

`GET /api/interviewiq/questions/seed`

Current fixture seeds 30 representative questions (across both types and all difficulties). Extend this data file to 300 as next content step.

## 5. Route Surface Added

- `GET /api/interviewiq/progress`
- `GET /api/interviewiq/deck/:deckNumber`
- `POST /api/interviewiq/deck/:deckNumber/start`
- `POST /api/interviewiq/response/upload`
- `GET /api/interviewiq/response/:responseId`
- `GET /api/interviewiq/deck/:deckNumber/results`
- `GET /api/interviewiq/heatmap`
- `GET /api/interviewiq/leaderboard`
- `GET /api/interviewiq/highlights`
- `GET /api/interviewiq/questions/seed`

## 6. Frontend Routes Added

- `/interviewiq`
- `/interviewiq/deck/:deckNumber`
- `/interviewiq/history`

## 7. Evaluation Pipeline Notes

Current implementation runs asynchronously after upload and stores:
- Transcript/LLM-like scoring output
- Keyword heuristic output
- Anti-cheat output (graceful fallback if HF API is unavailable)
- Final score

For production-hardening, wire dedicated workers for:
- Amazon Transcribe job orchestration
- Amazon Bedrock Claude runtime calls
- Frame extraction + HuggingFace model inference
