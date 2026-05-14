import httpx
from typing import Dict, Any
from app.core.config import settings

MOCK_IP_DATA = {
    "ipAddress": "192.168.1.1",
    "isPublic": True,
    "ipVersion": 4,
    "isWhitelisted": False,
    "abuseConfidenceScore": 67,
    "countryCode": "RU",
    "usageType": "Data Center/Web Hosting/Transit",
    "isp": "ShadyHost LLC",
    "domain": "shadyhost.ru",
    "totalReports": 234,
    "numDistinctUsers": 89,
    "lastReportedAt": "2024-01-10T14:23:00+00:00",
    "reports": [
        {"reportedAt": "2024-01-10T14:23:00+00:00", "comment": "Port scanning", "categories": [14, 15]},
        {"reportedAt": "2024-01-09T08:11:00+00:00", "comment": "Brute force SSH", "categories": [18, 22]},
    ]
}


async def analyze_ip(ip: str) -> Dict[str, Any]:
    if not settings.ABUSEIPDB_API_KEY:
        data = dict(MOCK_IP_DATA)
        data["ipAddress"] = ip
        return {"source": "demo", "data": data}
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
    data = dict(MOCK_IP_DATA)
    data["ipAddress"] = ip
    return {"source": "demo", "data": data}
