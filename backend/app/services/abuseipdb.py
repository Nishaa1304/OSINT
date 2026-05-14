import httpx
import hashlib
from typing import Dict, Any
from app.core.config import settings

KNOWN_MALICIOUS = {
    "185.220.101.45": {"abuseConfidenceScore": 100, "countryCode": "DE", "isp": "Tor Exit Node", "totalReports": 892, "usageType": "Tor Exit Node"},
    "45.33.32.156":   {"abuseConfidenceScore": 0,   "countryCode": "US", "isp": "Linode LLC",   "totalReports": 0,   "usageType": "Data Center"},
    "8.8.8.8":        {"abuseConfidenceScore": 0,   "countryCode": "US", "isp": "Google LLC",   "totalReports": 0,   "usageType": "Content Delivery Network"},
    "1.1.1.1":        {"abuseConfidenceScore": 0,   "countryCode": "AU", "isp": "Cloudflare",   "totalReports": 0,   "usageType": "Content Delivery Network"},
}


def _dynamic_mock(ip: str) -> Dict[str, Any]:
    if ip in KNOWN_MALICIOUS:
        base = KNOWN_MALICIOUS[ip]
    else:
        # Generate deterministic but varied data based on IP
        seed = int(hashlib.md5(ip.encode()).hexdigest(), 16)
        score = seed % 101
        reports = (seed // 100) % 500
        countries = ["US", "RU", "CN", "DE", "NL", "BR", "IN", "FR", "GB", "UA"]
        isps = ["DigitalOcean LLC", "Amazon AWS", "Hetzner Online", "OVH SAS", "Linode LLC",
                "Vultr Holdings", "Choopa LLC", "ColoCrossing", "FranTech Solutions", "Psychz Networks"]
        usage = ["Data Center/Web Hosting/Transit", "Commercial", "ISP", "Content Delivery Network",
                 "Search Engine Spider", "Reserved", "University/College/School"]
        base = {
            "abuseConfidenceScore": score,
            "countryCode": countries[seed % len(countries)],
            "isp": isps[seed % len(isps)],
            "totalReports": reports,
            "usageType": usage[seed % len(usage)],
        }

    return {
        "ipAddress": ip,
        "isPublic": True,
        "ipVersion": 4,
        "isWhitelisted": False,
        "numDistinctUsers": base["totalReports"] // 3 if base["totalReports"] > 0 else 0,
        "lastReportedAt": "2024-12-01T10:00:00+00:00" if base["totalReports"] > 0 else None,
        **base,
    }


async def analyze_ip(ip: str) -> Dict[str, Any]:
    if not settings.ABUSEIPDB_API_KEY:
        return {"source": "demo", "data": _dynamic_mock(ip)}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                headers={"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"},
                params={"ipAddress": ip, "maxAgeInDays": 90, "verbose": True}
            )
            if resp.status_code == 200:
                return {"source": "abuseipdb", "data": resp.json().get("data", {})}
    except Exception:
        pass
    return {"source": "demo", "data": _dynamic_mock(ip)}
