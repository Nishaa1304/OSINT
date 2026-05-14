import httpx
from typing import Optional, Dict, Any
from app.core.config import settings


MOCK_URL_DATA = {
    "positives": 3,
    "total": 72,
    "scan_date": "2024-01-15",
    "permalink": "https://virustotal.com/example",
    "verbose_msg": "Scan finished",
    "scans": {
        "Google Safebrowsing": {"detected": True, "result": "phishing"},
        "Kaspersky": {"detected": False, "result": "clean site"},
        "Norton": {"detected": True, "result": "malware site"},
    }
}

MOCK_DOMAIN_DATA = {
    "categories": {"Forcepoint ThreatSeeker": "malicious sites"},
    "creation_date": "2023-06-01",
    "last_analysis_stats": {"malicious": 5, "suspicious": 3, "harmless": 60},
    "reputation": -12,
}


async def analyze_url(url: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return {"source": "demo", "data": MOCK_URL_DATA, "url": url}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Submit URL for scan
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
    except Exception as e:
        pass
    return {"source": "demo", "data": MOCK_URL_DATA, "url": url}


async def analyze_domain(domain: str) -> Dict[str, Any]:
    if not settings.VIRUSTOTAL_API_KEY:
        return {"source": "demo", "data": MOCK_DOMAIN_DATA, "domain": domain}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/domains/{domain}",
                headers={"x-apikey": settings.VIRUSTOTAL_API_KEY}
            )
            if resp.status_code == 200:
                return {"source": "virustotal", "data": resp.json(), "domain": domain}
    except Exception as e:
        pass
    return {"source": "demo", "data": MOCK_DOMAIN_DATA, "domain": domain}
