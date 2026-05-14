import httpx
import hashlib
from typing import Dict, Any
from app.core.config import settings

PHISHING_KEYWORDS = ["login", "signin", "verify", "secure", "account", "update", "confirm",
                     "banking", "paypal", "amazon", "apple", "microsoft", "password", "wallet"]
MALICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club"]
SAFE_DOMAINS = ["google.com", "youtube.com", "github.com", "microsoft.com",
                "apple.com", "amazon.com", "cloudflare.com", "wikipedia.org"]


def _dynamic_mock(url: str) -> Dict[str, Any]:
    url_lower = url.lower()

    # Safe domains — never phishing
    for safe in SAFE_DOMAINS:
        if safe in url_lower:
            return {"url_info": {"in_database": False, "verified": "no", "online": "no"}}

    keyword_hits = sum(1 for k in PHISHING_KEYWORDS if k in url_lower)
    tld_hit = any(url_lower.endswith(t) or f"{t}/" in url_lower for t in MALICIOUS_TLDS)

    # Deterministic based on URL hash
    seed = int(hashlib.md5(url.encode()).hexdigest(), 16)
    is_phishing = tld_hit or keyword_hits >= 2 or (keyword_hits >= 1 and seed % 3 == 0)

    if is_phishing:
        targets = ["Banking", "PayPal", "Amazon", "Apple ID", "Microsoft", "Google", "Netflix"]
        target = targets[seed % len(targets)]
        return {
            "url_info": {
                "url": url,
                "phish_id": str(7800000 + (seed % 99999)),
                "phish_detail_url": f"https://www.phishtank.com/phish_detail.php?phish_id={7800000 + seed % 99999}",
                "submission_time": "2025-01-08T09:00:00+00:00",
                "verified": "yes",
                "verification_time": "2025-01-08T09:30:00+00:00",
                "online": "yes",
                "target": target,
                "in_database": True,
            }
        }
    return {"url_info": {"in_database": False, "verified": "no", "online": "no"}}


async def check_phishing(url: str) -> Dict[str, Any]:
    if not settings.PHISHTANK_APP_KEY:
        return {"source": "demo", "data": _dynamic_mock(url), "url": url}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://checkurl.phishtank.com/checkurl/",
                data={"url": url, "format": "json", "app_key": settings.PHISHTANK_APP_KEY},
                headers={"User-Agent": "phishtank/osint-dashboard"}
            )
            if resp.status_code == 200:
                return {"source": "phishtank", "data": resp.json(), "url": url}
    except Exception:
        pass
    return {"source": "demo", "data": _dynamic_mock(url), "url": url}
