from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.routes.auth import get_current_user
from app.core.database import get_db
from app.services import virustotal, abuseipdb, ipinfo, phishtank, hibp
from app.services.ai_analyzer import score_url, score_ip, score_email, detect_input_type
from bson import ObjectId
import asyncio

router = APIRouter(prefix="/threat", tags=["Threat Analysis"])


class SearchRequest(BaseModel):
    query: str
    query_type: Optional[str] = None  # auto-detect if not provided


async def save_search(db, user_id: str, query: str, query_type: str, result: dict):
    doc = {
        "user_id": user_id,
        "query": query,
        "query_type": query_type,
        "result_summary": result.get("ai_analysis", {}),
        "risk_score": result.get("ai_analysis", {}).get("risk_score", 0),
        "threat_level": result.get("ai_analysis", {}).get("threat_level", "SAFE"),
        "is_bookmarked": False,
        "created_at": datetime.utcnow(),
    }
    await db.search_history.insert_one(doc)

    # Auto-create alert for high risk
    risk_score = doc["risk_score"]
    threat_level = doc["threat_level"]
    if threat_level in ["HIGH", "CRITICAL"]:
        alert_doc = {
            "user_id": user_id,
            "title": f"{threat_level} Threat Detected",
            "message": f"Investigation of '{query}' returned a {threat_level} threat level with risk score {risk_score}/100.",
            "alert_type": "critical" if threat_level == "CRITICAL" else "danger",
            "query": query,
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
        await db.alerts.insert_one(alert_doc)


@router.post("/analyze")
async def analyze(req: SearchRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    query = req.query.strip()

    qtype = req.query_type or detect_input_type(query)

    if qtype == "url":
        return await analyze_url_handler(query, user_id, db)
    elif qtype == "ip":
        return await analyze_ip_handler(query, user_id, db)
    elif qtype == "email":
        return await analyze_email_handler(query, user_id, db)
    elif qtype == "domain":
        return await analyze_domain_handler(query, user_id, db)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid input. Enter a single IP (e.g. 8.8.8.8), URL (e.g. http://example.com), email, or domain — not multiple values at once.")


async def analyze_url_handler(url: str, user_id: str, db):
    vt_data, phish_data = await asyncio.gather(
        virustotal.analyze_url(url),
        phishtank.check_phishing(url),
    )

    ai = score_url(url)

    # Boost score if VT has positives
    vt_positives = vt_data.get("data", {}).get("positives", 0)
    if vt_positives > 5:
        ai["risk_score"] = min(ai["risk_score"] + 20, 100)
    elif vt_positives > 0:
        ai["risk_score"] = min(ai["risk_score"] + 10, 100)

    phish_in_db = phish_data.get("data", {}).get("url_info", {}).get("in_database", False)
    if phish_in_db:
        ai["risk_score"] = min(ai["risk_score"] + 25, 100)
        ai["indicators"].append("Listed in PhishTank database")

    result = {
        "query": url,
        "query_type": "url",
        "virustotal": vt_data,
        "phishtank": phish_data,
        "ai_analysis": ai,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await save_search(db, user_id, url, "url", result)
    return result


async def analyze_ip_handler(ip: str, user_id: str, db):
    abuse_data, geo_data = await asyncio.gather(
        abuseipdb.analyze_ip(ip),
        ipinfo.get_ip_geo(ip),
    )

    abuse_score = abuse_data.get("data", {}).get("abuseConfidenceScore", 0)
    report_count = abuse_data.get("data", {}).get("totalReports", 0)
    ai = score_ip(ip, abuse_score, report_count)

    result = {
        "query": ip,
        "query_type": "ip",
        "abuseipdb": abuse_data,
        "geolocation": geo_data,
        "ai_analysis": ai,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await save_search(db, user_id, ip, "ip", result)
    return result


async def analyze_email_handler(email: str, user_id: str, db):
    breach_data = await hibp.check_email_breaches(email)
    breach_count = breach_data.get("breach_count", 0)
    ai = score_email(email, breach_count)

    result = {
        "query": email,
        "query_type": "email",
        "breaches": breach_data,
        "ai_analysis": ai,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await save_search(db, user_id, email, "email", result)
    return result


async def analyze_domain_handler(domain: str, user_id: str, db):
    vt_data = await virustotal.analyze_domain(domain)
    ai = score_url(f"http://{domain}")

    result = {
        "query": domain,
        "query_type": "domain",
        "virustotal": vt_data,
        "ai_analysis": ai,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await save_search(db, user_id, domain, "domain", result)
    return result
