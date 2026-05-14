import httpx
import hashlib
import re
from typing import Dict, Any
from app.core.config import settings

MALICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".work", ".date"]
PHISHING_KEYWORDS = ["login", "signin", "verify", "secure", "account", "update", "confirm",
                     "banking", "paypal", "amazon", "apple", "microsoft", "password", "credential"]
SAFE_DOMAINS = ["google.com", "youtube.com", "facebook.com", "twitter.com", "github.com",
                "microsoft.com", "apple.com", "amazon.com", "cloudflare.com", "wikipedia.org"]


def _score_url_mock(url: str) -> Dict[str, Any]:
    url_lower = url.lower()
    seed = int(hashlib.md5(url.encode()).hexdigest(), 16)

    # Check safe domains
    for safe in SAFE_DOMAINS:
        if safe in url_lower:
            return {"positives": 0, "total": 72, "scan_date": "2025-01-15",
                    "verbose_msg": "URL is safe", "scans": {}}

    keyword_hits = sum(1 for k in PHISHING_KEYWORDS if k in url_lower)
    tld_hit = any(url_lower.endswith(t) or f"{t}/" in url_lower for t in MALICIOUS_TLDS)
    ip_in_url = bool(re.match(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url))

    positives = 0
    if tld_hit:       positives += 15 + (seed % 10)
    if keyword_hits:  positives += keyword_hits * 3
    if ip_in_url:     positives += 10
    positives = min(positives, 68)

    scans = {}
    engines = ["Google Safebrowsing", "Kaspersky", "Norton", "Bitdefender", "ESET", "Avast",
               "McAfee", "Sophos", "Fortinet", "Symantec"]
    for i, engine in enumerate(engines):
        detected = i < positives // 7
        scans[engine] = {"detected": detected, "result": "phishing" if detected else "clean site"}

    return {"positives": positives, "total": 72, "scan_date": "2025-01-15",
            "verbose_msg": "Scan finished", "scans": scans}


def _score_domain_mock(domain: str) -> Dict[str, Any]:
    domain_lower = domain.lower()
    seed = int(hashlib.md5(domain.encode()).hexdigest(), 16)

    for safe in SAFE_DOMAINS:
        if safe in domain_lower:
            return {"last_analysis_stats": {"malicious": 0, "suspicious": 0, "harmless": 70},
                    "reputation": 100, "categories": {}}

    tld_hit = any(domain_lower.endswith(t) for t in MALICIOUS_TLDS)
    keyword_hits = sum(1 for k in PHISHING_KEYWORDS if k in domain_lower)

    malicious = (seed % 8) + (10 if tld_hit else 0) + (keyword_hits * 2)
    suspicious = (seed % 5) + (3 if keyword_hits else 0)
    malicious = min(malicious, 65)
    reputation = max(-50, -(malicious * 2))

    return {
        "last_analysis_stats": {"malicious": malicious, "suspicious": suspicious, "harmless": max(0, 70 - malicious)},
        "reputation": reputation,
        "categories": {"Forcepoint ThreatSeeker": "malicious sites"} if malicious > 10 else {},
    }


async def analyze_url(url: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return {"source": "demo", "data": _score_url_mock(url), "url": url}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://www.virustotal.com/vtapi/v2/url/scan",
                data={"apikey": settings.VIRUSTOTAL_API_KEY, "url": url}
            )
            if resp.status_code == 200:
                scan_resp = await client.get(
                    "https://www.virustotal.com/vtapi/v2/url/report",
                    params={"apikey": settings.VIRUSTOTAL_API_KEY, "resource": url}
                )
                return {"source": "virustotal", "data": scan_resp.json(), "url": url}
    except Exception:
        pass
    return {"source": "demo", "data": _score_url_mock(url), "url": url}


async def analyze_domain(domain: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return {"source": "demo", "data": _score_domain_mock(domain), "domain": domain}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/domains/{domain}",
                headers={"x-apikey": settings.VIRUSTOTAL_API_KEY}
            )
            if resp.status_code == 200:
                return {"source": "virustotal", "data": resp.json(), "domain": domain}
    except Exception:
        pass
    return {"source": "demo", "data": _score_domain_mock(domain), "domain": domain}
