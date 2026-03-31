# NutriAI — Smart Nutrition Assistant 🥗🤖

An AI-powered nutrition tracking and meal recommendation platform built with React, Express, Firebase, and GROQ AI.

## ✨ Features

- 🔐 **Firebase Authentication** — Email/Password + Google Sign-In
- 🤖 **AI Chatbot** — Ask anything about food and nutrition (GROQ + Llama 3 70B)
- 🍽️ **Smart Meal Recommendations** — Personalized by time of day, goals & history
- 📊 **Nutrition Tracking** — Log meals, track calories & macros with charts
- 🔥 **Habit Streaks** — Daily logging streaks with visual progress
- 🧠 **Weekly AI Insights** — Automated analysis of your eating patterns
- 🌙 **Dark/Light Mode** — Beautiful UI with glassmorphism design
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | GROQ API (Llama 3 70B) |
| Charts | Recharts |

## 📋 Prerequisites

- Node.js 18+ and npm
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- A GROQ API key ([console.groq.com](https://console.groq.com))

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Authentication** → Sign-in methods:
   - Email/Password ✅
   - Google ✅
3. Enable **Firestore Database** (start in test mode for development)
4. Go to **Project Settings** → **General** → scroll to **Your apps** → click **Web (</>) icon**
5. Register your app and copy the Firebase config values
6. Go to **Project Settings** → **Service Accounts** → **Generate New Private Key**
7. Save the downloaded JSON as `server/serviceAccountKey.json`

### 3. GROQ API Setup

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Go to **API Keys** → **Create API Key**
4. Copy the key

### 4. Environment Variables

**Backend** — Create `server/.env`:
```env
PORT=5000
GROQ_API_KEY=gsk_your_actual_groq_key
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
CLIENT_URL=http://localhost:5173
```

**Frontend** — Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Run Locally

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
├── server/                    # Express Backend
│   ├── config/firebase.js     # Firebase Admin SDK init
│   ├── controllers/
│   │   ├── aiController.js    # AI recommendation endpoints
│   │   ├── foodLogController.js
│   │   ├── goalController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # Firebase token verification
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── foodLogRoutes.js
│   │   ├── goalRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── groqService.js     # GROQ API wrapper
│   └── server.js              # Express entry point
│
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.jsx
│   │   │   ├── FoodLogForm.jsx
│   │   │   ├── HabitTracker.jsx
│   │   │   ├── MealRecommendations.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NutritionChart.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── WeeklyInsights.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/api.js
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
```

## 🌐 API Endpoints

All endpoints (except health) require `Authorization: Bearer <firebase_token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (public) |
| POST | `/api/users/sync` | Sync Firebase user to Firestore |
| GET | `/api/users/me` | Get user profile |
| GET | `/api/food-logs` | Get food logs (query: `days`, `date`) |
| POST | `/api/food-logs` | Create food log entry |
| DELETE | `/api/food-logs/:id` | Delete food log |
| GET | `/api/food-logs/stats` | Get aggregated nutrition stats |
| GET | `/api/goals` | Get user goals |
| PUT | `/api/goals` | Update goals |
| GET | `/api/goals/streak` | Get streak info |
| POST | `/api/ai/recommend` | Get AI meal recommendations |
| POST | `/api/ai/insights` | Get weekly AI insights |
| POST | `/api/ai/chat` | Chat with AI |
| GET | `/api/ai/context-advice` | Get context-aware advice |

## 🚀 Deployment (Google Cloud Run)

This project has been explicitly containerized to deploy both the **Frontend** and **Backend** as a single seamless service on Google Cloud Platform. 

### Method 1: The Magic Button
The absolute fastest way to deploy this to GCP is via the automated Cloud Run Deploy Button. Click the button below, select your region, and provide your `GROQ_API_KEY`:

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run/?git_repo=https://github.com/Bhavin-umatiya/AMD_slingshot_Hack.git)

### Method 2: Google Cloud Shell
1. Open Google Cloud Shell (`>_` icon top right).
2. Download Code: `git clone https://github.com/Bhavin-umatiya/AMD_slingshot_Hack.git`
3. Deploy 🚀:
```bash
cd AMD_slingshot_Hack
gcloud run deploy nutriai --source . --port 8080 --allow-unauthenticated --set-env-vars="GROQ_API_KEY=your_groq_key"
```

### Method 3: Cloud Run GitHub Integration
1. Go to [Cloud Run](https://console.cloud.google.com/run).
2. Click **Create Service** → **Continuously deploy from a repository**.
3. Point it to this GitHub repo.
4. **Action Required:** Under "Build Configuration", you **MUST** select `Dockerfile` (Source location `/Dockerfile`).
5. Under Variables & Secrets, set `GROQ_API_KEY`.
6. Deploy!

### Database → Firebase Firestore

Already included with your Firebase project. No separate setup needed!

## 📝 Firestore Security Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /foodLogs/{logId} {
      allow read, write: if request.auth != null;
    }
    match /goals/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📄 License

MIT — Built for hackathons 🚀
