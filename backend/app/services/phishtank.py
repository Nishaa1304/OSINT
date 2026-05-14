import httpx
from typing import Dict, Any
from app.core.config import settings

MOCK_PHISH_DATA = {
    "url_info": {
        "url": "http://example-phishing.com",
        "phish_id": "7812349",
        "phish_detail_url": "https://www.phishtank.com/phish_detail.php?phish_id=7812349",
        "submission_time": "2024-01-08T09:00:00+00:00",
        "verified": "yes",
        "verification_time": "2024-01-08T09:30:00+00:00",
        "online": "yes",
        "target": "Banking",
        "in_database": True,
    }
}

MOCK_CLEAN_DATA = {
    "url_info": {"in_database": False, "verified": "no", "online": "no"}
}


async def check_phishing(url: str) -> Dict[str, Any]:
    if not settings.PHISHTANK_APP_KEY:
        # Demo: flag URLs with suspicious keywords
        suspicious = any(k in url.lower() for k in ["login", "secure", "verify", "bank", "paypal", "update", "phish"])
        return {"source": "demo", "data": MOCK_PHISH_DATA if suspicious else MOCK_CLEAN_DATA, "url": url}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://checkurl.phishtank.com/checkurl/",
                data={
                    "url": url,
                    "format": "json",
                    "app_key": settings.PHISHTANK_APP_KEY
                },
                headers={"User-Agent": "phishtank/osint-dashboard"}
            )
            if resp.status_code == 200:
                return {"source": "phishtank", "data": resp.json(), "url": url}
    except Exception:
        pass
    return {"source": "demo", "data": MOCK_CLEAN_DATA, "url": url}
