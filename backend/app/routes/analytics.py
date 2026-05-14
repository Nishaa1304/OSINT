from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from app.routes.auth import get_current_user
from app.core.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
async def get_summary(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    role = current_user.get("role", "intern")
    match_filter = {} if role == "admin" else {"user_id": user_id}

    total_searches = await db.search_history.count_documents(match_filter)
    critical_threats = await db.search_history.count_documents({**match_filter, "threat_level": "CRITICAL"})
    high_threats = await db.search_history.count_documents({**match_filter, "threat_level": "HIGH"})
    phishing_urls = await db.search_history.count_documents({**match_filter, "query_type": "url", "threat_level": {"$in": ["HIGH", "CRITICAL"]}})
    suspicious_ips = await db.search_history.count_documents({**match_filter, "query_type": "ip", "risk_score": {"$gte": 40}})
    breached_emails = await db.search_history.count_documents({**match_filter, "query_type": "email", "risk_score": {"$gte": 30}})
    unread_alerts = await db.alerts.count_documents({"is_read": False} if role == "admin" else {"user_id": user_id, "is_read": False})

    return {
        "total_searches": total_searches,
        "critical_threats": critical_threats,
        "high_threats": high_threats,
        "phishing_urls": phishing_urls,
        "suspicious_ips": suspicious_ips,
        "breached_emails": breached_emails,
        "unread_alerts": unread_alerts,
    }


@router.get("/trends")
async def get_trends(days: int = 30, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    role = current_user.get("role", "intern")
    since = datetime.utcnow() - timedelta(days=days)
    match_filter = {"created_at": {"$gte": since}}
    if role != "admin":
        match_filter["user_id"] = user_id

    pipeline = [
        {"$match": match_filter},
        {"$group": {
            "_id": {"date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}, "threat_level": "$threat_level"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    results = await db.search_history.aggregate(pipeline).to_list(1000)
    return {"trends": results}


@router.get("/distribution")
async def get_distribution(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    role = current_user.get("role", "intern")
    match_filter = {} if role == "admin" else {"user_id": user_id}

    type_dist = await db.search_history.aggregate([
        {"$match": match_filter},
        {"$group": {"_id": "$query_type", "count": {"$sum": 1}}}
    ]).to_list(100)

    level_dist = await db.search_history.aggregate([
        {"$match": match_filter},
        {"$group": {"_id": "$threat_level", "count": {"$sum": 1}}}
    ]).to_list(100)

    return {"type_distribution": type_dist, "level_distribution": level_dist}


@router.get("/recent-activity")
async def get_recent_activity(limit: int = 10, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    role = current_user.get("role", "intern")
    match_filter = {} if role == "admin" else {"user_id": user_id}
    items = await db.search_history.find(match_filter).sort("created_at", -1).limit(limit).to_list(limit)
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]
    return {"activity": items}
