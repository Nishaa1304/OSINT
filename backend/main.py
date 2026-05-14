from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.database import connect_db, close_db
from app.core.config import settings
from app.routes import auth, threat, analytics, history, alerts, reports, chatbot


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="OSINT Threat Intelligence Dashboard API",
    description="Government Cyber Cell — OSINT Investigation Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(threat.router)
app.include_router(analytics.router)
app.include_router(history.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(chatbot.router)


@app.get("/")
async def root():
    return {
        "name": "OSINT Threat Intelligence Dashboard API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
