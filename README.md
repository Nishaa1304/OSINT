# OSINT Threat Intelligence Dashboard

A full-stack, production-grade cyber intelligence investigation platform for Government Cyber Cell interns.

## 🛡️ Overview

The **OSINT Threat Intelligence Dashboard** is a modern, professional-grade investigation assistant that enables cyber analysts to:

- 🔍 Search and analyze suspicious **URLs, IPs, emails, and domains**
- 🌍 Visualize **geolocation data** on interactive maps
- 📊 View **breach information** from HaveIBeenPwned
- 🤖 Get **AI-powered threat analysis** and recommendations
- 📈 Monitor threats via an **advanced analytics dashboard**
- 📄 Generate **downloadable PDF intelligence reports**
- 🔔 Receive **smart alerts** for critical threats
- 💬 Chat with the **AI Investigation Assistant**

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| Maps | React-Leaflet + OpenStreetMap |
| State | Zustand |
| HTTP | Axios |
| Backend | FastAPI (Python) |
| Database | MongoDB (Motor async driver) |
| Auth | JWT (python-jose) |
| PDF | ReportLab |
| AI | Heuristic + keyword NLP engine |

---

## 📁 Project Structure

```
d:/Osint/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── core/               # config, database, security
│       ├── models/             # Pydantic models
│       ├── routes/             # auth, threat, analytics, history, alerts, reports, chatbot
│       └── services/           # virustotal, abuseipdb, ipinfo, phishtank, hibp, ai_analyzer
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── pages/              # All 10 pages
        ├── components/         # Layout, UI, Charts
        ├── store/              # Zustand auth store
        ├── api/                # Axios client
        └── utils/              # inputDetector, riskScorer
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **MongoDB** (local or Atlas)

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env
# Edit .env with your MongoDB URI and API keys

# Run the server
uvicorn main:app --reload --port 8000
```

Backend API docs available at: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env

# Run development server
npm run dev
```

Frontend available at: http://localhost:5173

---

## 🔑 API Keys (Optional)

The platform works with **demo/mock data** when API keys are not configured. Add real keys to `backend/.env` for live data:

| Service | Key Name | Get Key |
|---------|----------|---------|
| VirusTotal | `VIRUSTOTAL_API_KEY` | https://virustotal.com |
| AbuseIPDB | `ABUSEIPDB_API_KEY` | https://abuseipdb.com |
| IPInfo | `IPINFO_TOKEN` | https://ipinfo.io |
| PhishTank | `PHISHTANK_APP_KEY` | https://phishtank.org |
| HaveIBeenPwned | `HIBP_API_KEY` | https://haveibeenpwned.com/API/Key |

---

## 🎯 Features

### Authentication
- JWT-based login/signup
- Role-based access (Intern / Admin)
- Persistent sessions

### Threat Search Engine
- Auto-detects input type (URL/IP/Email/Domain)
- Multi-source analysis (VirusTotal, AbuseIPDB, PhishTank, HIBP, IPInfo)
- AI-powered risk scoring (0–100)
- 5 threat levels: SAFE → LOW → MEDIUM → HIGH → CRITICAL

### Dashboard
- Animated stat cards with live counters
- Threat trend area charts
- Severity pie charts
- Recent activity feed

### Analytics
- Monthly/yearly trend charts
- Type distribution charts
- Top threat origin countries
- Quarterly comparison

### Investigation History
- Filterable, paginated history
- Bookmark important investigations
- Delete records

### Alert Center
- Auto-generated alerts for HIGH/CRITICAL threats
- Filter by type (critical, danger, warning, success)
- Mark as read / delete

### PDF Reports
- Professional government-grade PDF reports
- Includes threat level, risk score, AI analysis, recommendations

### AI Assistant
- Rule-based NLP chatbot
- 20+ cybersecurity topics covered
- Investigation step guidance

### Settings
- Profile management
- API key reference
- Notification preferences
- Appearance themes

---

## ⚠️ Disclaimer

This tool is designed **exclusively for OSINT-based cyber investigation and threat intelligence** by authorized government personnel. It does NOT include any offensive cybersecurity capabilities, penetration testing tools, or dark web access.

---

## 📝 License

Government Cyber Cell — Internal Use Only
