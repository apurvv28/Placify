<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=40&pause=1000&color=2196F3&center=true&vCenter=true&width=600&lines=Welcome+to+Placify;AI-Powered+Placement+Platform;Empowering+Students;Connecting+Recruiters" alt="Typing SVG" />
</div>

<p align="center">
  <a href="https://github.com/Apurvv28/Placify/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/Apurvv28/Placify.svg?style=for-the-badge&color=blue" alt="Contributors" />
  </a>
  <a href="https://github.com/Apurvv28/Placify/network/members">
    <img src="https://img.shields.io/github/forks/Apurvv28/Placify.svg?style=for-the-badge&color=orange" alt="Forks" />
  </a>
  <a href="https://github.com/Apurvv28/Placify/stargazers">
    <img src="https://img.shields.io/github/stars/Apurvv28/Placify.svg?style=for-the-badge&color=yellow" alt="Stars" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AWS_DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" />
  <img src="https://img.shields.io/badge/Groq-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Gemini-blue?style=for-the-badge&logo=google&logoColor=white" />
</p>

<div align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y5YTk5a2hrcWN4NmxwOXE4bjdzbDV1amx1bmh4MTc5NGlqcTZnMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif" width="60%" alt="Tech Animation"/>
</div>

---

## 🚀 About the Project

**Placify** is a comprehensive, AI-integrated placement preparation and networking platform. Designed specifically for students and recruiters, Placify seamlessly integrates real-time communications, automated resume analysis via Google Gemini and Groq, an advanced AI chatbot, and a robust community networking feed.

## 🛠 Tech Stack & System Integration

The architecture follows a robust **Client-Server** model connecting modern AI tools with a high-performance MERN stack structure:

* **Frontend:** Built using `React.js` and `Tailwind CSS` for a highly responsive, glassmorphic UI. `Axios` handles robust API requests while `socket.io-client` effortlessly drives live messaging and notifications.
* **Backend:** `Node.js` with `Express` exposes a beautifully structured RESTful API. Custom middleware guarantees protected routes with JWT-based Auth. Form data operations and file uploads are seamlessly digested with `multer`, `pdf-parse`, and `mammoth`.
* **Database:** `AWS DynamoDB` with `AWS SDK v3` repositories to persist Users, Posts, Resumes, and chat histories.
* **AI Engine:** State-of-the-art integrations powered by **Google Gemini AI** and **Groq**. These language models execute high-quality Resume ATS (Applicant Tracking System) scans natively and provide an interactive AI chat experience to help simulate interviews.
* **Real-time Comms:** The WebSocket protocol via `Socket.io` establishes persistent, bidirectional connections enabling real-time private messages between users and recruiters.

---

## 🧭 Comprehensive API Routing

### 🔐 Authentication (`/api/auth`)

| Route           | Method   | Access  | Description                            |
| --------------- | -------- | ------- | -------------------------------------- |
| `/register`   | `POST` | Public  | Register a new user account            |
| `/login`      | `POST` | Public  | Authenticate user & receive JWT        |
| `/me`         | `GET`  | Private | Retrieve current authenticated profile |
| `/onboarding` | `PUT`  | Private | Store step-by-step onboarding details  |
| `/users`      | `GET`  | Private | Retrieve minimal list of all users     |
| `/profile`    | `PUT`  | Private | Update user profile data               |

### 👤 Users (`/api/users`)

| Route                | Method    | Access  | Description                           |
| -------------------- | --------- | ------- | ------------------------------------- |
| `/`                | `GET`   | Private | Fetch system wide users               |
| `/profile`         | `GET`   | Private | Retrieve own detailed profile         |
| `/profile/:userId` | `GET`   | Private | View a specific user's public profile |
| `/block/:userId`   | `PATCH` | Private | Block an unwanted user                |
| `/unblock/:userId` | `PATCH` | Private | Unblock a user                        |

### 📄 Resumes (`/api/resume` & `/api/resumes`)

| Route       | Method     | Access  | Description                                     |
| ----------- | ---------- | ------- | ----------------------------------------------- |
| `/`       | `GET`    | Private | Get currently active resume                     |
| `/`       | `POST`   | Private | Save or update resume details                   |
| `/`       | `DELETE` | Private | Clear active user's resume                      |
| `/all`    | `GET`    | Public  | Discover global resumes (recruiter view)        |
| `/upload` | `POST`   | Private | Upload file and extract contents via `multer` |

### 🧠 ATS Analyzer (`/api/ats`)

| Route        | Method   | Access  | Description                            |
| ------------ | -------- | ------- | -------------------------------------- |
| `/analyze` | `POST` | Private | Trigger deep Gen-AI analysis on resume |

### 📝 Posts & Feeds (`/api/posts`)

| Route                            | Method     | Access  | Description                    |
| -------------------------------- | ---------- | ------- | ------------------------------ |
| `/`                            | `GET`    | Private | Load community feed            |
| `/`                            | `POST`   | Private | Publish a new post/opportunity |
| `/:id`                         | `GET`    | Private | View full post details         |
| `/:id`                         | `DELETE` | Private | Destroy owned post             |
| `/:id/like`                    | `PUT`    | Private | Toggle a semantic like         |
| `/:id/comments`                | `GET`    | Private | Retrieve thread conversations  |
| `/:id/comments`                | `POST`   | Private | Publish comment on post        |
| `/:postId/comments/:commentId` | `DELETE` | Private | Remove a deployed comment      |

### 💬 Real-Time Messages (`/api/messages`)

| Route                   | Method     | Access  | Description                        |
| ----------------------- | ---------- | ------- | ---------------------------------- |
| `/:userId`            | `GET`    | Private | Pull chat history natively         |
| `/send/:receiverId`   | `POST`   | Private | Emit and store direct message      |
| `/seen/:senderId`     | `PATCH`  | Private | Acknowledge read receipts          |
| `/react/:messageId`   | `PATCH`  | Private | Sync message reaction (e.g. Emoji) |
| `/clear/:otherUserId` | `DELETE` | Private | Wipe one-to-one conversation       |

### 🤖 Generative Chatbot (`/api/chatbot`)

| Route | Method   | Access         | Description                           |
| ----- | -------- | -------------- | ------------------------------------- |
| `/` | `POST` | Public/Private | Bridge conversational query to Gen-AI |

---

## 🏃 Getting Started & Installation

### Prerequisites

- Node.js (v18+)
- AWS account with DynamoDB access
- AWS CLI configured profile (`default`) for local backend runtime
- Gemini and Groq API Keys

### Quick Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Apurvv28/Placify.git
   cd Placify
   ```
2. **Backend Configuration:**

   ```bash
   cd backend
   npm install
  # Configure .env: PORT, JWT_SECRET, GEMINI_API_KEY, GROQ_API_KEY, CLIENT_ORIGIN, AWS_REGION, DYNAMODB_*_TABLE
  # Configure AWS credentials (one time): aws configure --profile default
   npm start # or npm run dev
   ```
3. **Frontend Configuration:**

   ```bash
   cd ../ui
   npm install
  # Configure .env: REACT_APP_API_URL=http://localhost:5000
   npm start
   ```

---

## ☁️ Deployment Guide (Vercel + AWS DynamoDB)

### Architecture

- Frontend: Vercel (React)
- Backend: Vercel (Express API)
- Database: AWS DynamoDB (ap-south-1)

### 1. Deploy Frontend to Vercel

1. Push project to GitHub.
2. In Vercel, import repository and set project root to `ui`.
3. Build settings:
  - Build Command: `npm run build`
  - Output Directory: `build`
4. Add environment variable in Vercel:
  - `REACT_APP_API_URL=https://<your-backend-domain>`
5. Deploy and verify frontend loads.

### 2. Deploy Express Backend to Vercel

1. In Vercel, create a second project for backend with root directory `backend`.
2. Set Framework Preset to `Other`.
3. Add environment variables in the Vercel backend project:
  - `JWT_SECRET=<your-secret>`
  - `JWT_EXPIRES_IN=7d`
  - `CLIENT_ORIGIN=https://<your-frontend-vercel-domain>`
  - `AWS_REGION=ap-south-1`
  - `DYNAMODB_USERS_TABLE=PlacifyUsers`
  - `DYNAMODB_POSTS_TABLE=PlacifyPosts`
  - `DYNAMODB_COMMENTS_TABLE=PlacifyComments`
  - `DYNAMODB_RESUMES_TABLE=PlacifyResumes`
  - `DYNAMODB_MESSAGES_TABLE=PlacifyMessages`
  - `DYNAMODB_CONVERSATIONS_TABLE=PlacifyConversations`
  - `GEMINI_API_KEY=<your-key>`
  - `GROQ_API_KEY=<your-key>`
4. Configure AWS credentials for Vercel runtime (IAM user keys):
  - `AWS_ACCESS_KEY_ID=<your-access-key-id>`
  - `AWS_SECRET_ACCESS_KEY=<your-secret-access-key>`
5. Deploy backend and verify health endpoint:
  - `GET https://<your-backend-vercel-domain>/api/health`

### 3. Connect Frontend to Vercel Backend

In frontend Vercel project env vars, set:

- `REACT_APP_API_URL=https://<your-backend-vercel-domain>`

Redeploy frontend after changing env vars.

### 4. Optional: Deploy Express Backend on AWS (Elastic Beanstalk)

1. Package backend app:
  - Use folder `backend` as application source.
2. Create Elastic Beanstalk Node.js environment (Region: `ap-south-1`).
3. Set environment variables in Elastic Beanstalk:
  - `PORT=5000`
  - `JWT_SECRET=<your-secret>`
  - `JWT_EXPIRES_IN=7d`
  - `CLIENT_ORIGIN=https://<your-vercel-domain>`
  - `AWS_REGION=ap-south-1`
  - `DYNAMODB_USERS_TABLE=PlacifyUsers`
  - `DYNAMODB_POSTS_TABLE=PlacifyPosts`
  - `DYNAMODB_COMMENTS_TABLE=PlacifyComments`
  - `DYNAMODB_RESUMES_TABLE=PlacifyResumes`
  - `DYNAMODB_MESSAGES_TABLE=PlacifyMessages`
  - `DYNAMODB_CONVERSATIONS_TABLE=PlacifyConversations`
  - `GEMINI_API_KEY=<your-key>`
  - `GROQ_API_KEY=<your-key>`
4. Attach IAM role permissions for DynamoDB (least-privilege preferred).
5. Deploy and verify backend health endpoint:
  - `GET /api/health`

### 5. Alternative AWS Backend (EC2)

1. Launch EC2 instance and install Node.js + PM2.
2. Clone repo and run in `backend`:
  - `npm install`
  - `pm2 start index.js --name placify-backend`
3. Configure same `.env` variables as above.
4. Assign IAM role with DynamoDB access or configure AWS credentials.
5. Put Nginx in front for HTTPS + reverse proxy to port 5000.

### 6. DynamoDB Requirements

Required tables in `ap-south-1`:

- `PlacifyUsers`
- `PlacifyPosts`
- `PlacifyComments`
- `PlacifyResumes`
- `PlacifyMessages`

If any table is missing, related features (user pool, resumes, chat) may fail.

### 7. Post-Deployment Checklist

1. Frontend can login/register against backend URL.
2. `/api/auth/me` returns authenticated user.
3. User Pool loads users on dashboard.
4. Chat opens and sends messages.
5. Resume upload and ATS analysis work.
6. CORS allows your Vercel domain in backend `CLIENT_ORIGIN`.

### 8. Vercel Realtime Note (Socket.IO)

Vercel serverless functions are not ideal for long-lived WebSocket connections. If real-time chat is unstable in production, deploy Socket.IO backend on a persistent runtime (EC2, ECS, Elastic Beanstalk, or Render) and keep frontend on Vercel.

---

## 🤝 Key Contributors

A special thanks to the massive minds driving Placify forward!

<a href="https://github.com/Apurvv28/Placify/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Apurvv28/Placify" />
</a>

* **Apurv Saktepar** - Full Stack & AI Backend Integration
* **Soha** - Placed Resume Section and Login Authentication
* **Nisha** - Chat Communication adn Landing Page
* **Shantanu -** Resume Builder and Initial User with DB Connection


<br/>
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=150&section=footer"/>
</p>
