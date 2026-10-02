# MindFlip 🧠
> *Flip your perspective.*

MindFlip is a Generative AI-powered debate application designed to improve critical thinking and persuasion skills. It acts as an intelligent, on-demand debate partner that forces users to view topics from opposing perspectives by systematically challenging their arguments.

## ✨ Key Features
* **Dynamic Debate Arena**: Engage in real-time, turn-based text debates against a GenAI opponent defending the opposite stance.
* **Persona Modes**: Choose from various debate styles: *Friendly, Academic, Competitive, Socratic, or Devil's Advocate*.
* **Toss Mini-Game**: Answer a quick trivia question correctly to win the "toss" and decide who makes the opening argument.
* **AI Performance Report**: Get a detailed post-debate analytical JSON report scoring your argument strength, logical reasoning, clarity, and consistency.
* **Offline Fallback Mode**: Gracefully handles API rate limits by switching to intelligent, pre-written offline responses so your debate flow never crashes.

## 🛠️ Tech Stack
* **Frontend**: React.js, Vite, Tailwind CSS, Lucide React (Icons)
* **Backend**: Python, FastAPI, Uvicorn, SQLAlchemy (ORM)
* **Database**: SQLite (`mindflip.db`)
* **Generative AI**: Google Gemini API (`gemini-3.8-flash`)

## 📋 Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (for frontend)
* [Python 3.8+](https://www.python.org/) (for backend)
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## 🚀 Installation & Setup

### 1. Backend Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `backend` directory (if not already present) and add the following:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
AI_MODEL=gemini-3.8-flash
JWT_SECRET_KEY=your_super_secret_key_change_this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
DATABASE_URL=sqlite:///./mindflip.db
```

### 2. Frontend Setup
Open a **new, separate terminal** and navigate to the `frontend` folder:
```bash
cd frontend

# Install Node modules
npm install
```

## 💻 How to Run the Application

You will need two separate terminal windows running simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate
python -m uvicorn main:app --reload
```
*The backend will run at `http://localhost:8000`*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*The frontend will run at `http://localhost:5173`. Open this link in your browser to use MindFlip!*
