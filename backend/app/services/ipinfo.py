import httpx
from typing import Dict, Any
from app.core.config import settings

MOCK_GEO_DATA = {
    "ip": "1.2.3.4",
    "city": "Moscow",
    "region": "Moscow",
    "country": "RU",
    "country_name": "Russia",
    "loc": "55.7522,37.6156",
    "org": "AS12389 PJSC Rostelecom",
    "postal": "101000",
    "timezone": "Europe/Moscow",
    "hostname": "static.1.2.3.4.example.ru",
    "latitude": 55.7522,
    "longitude": 37.6156,
}


async def get_ip_geo(ip: str) -> Dict[str, Any]:
    if not settings.IPINFO_TOKEN:
        data = dict(MOCK_GEO_DATA)
        data["ip"] = ip
        # Vary mock location slightly
        return {"source": "demo", "data": data}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://ipinfo.io/{ip}",
                headers={"Authorization": f"Bearer {settings.IPINFO_TOKEN}"}
            )
            if resp.status_code == 200:
                geo = resp.json()
                if "loc" in geo:
                    lat, lon = geo["loc"].split(",")
                    geo["latitude"] = float(lat)
                    geo["longitude"] = float(lon)
                return {"source": "ipinfo", "data": geo}
    except Exception:
        pass
    data = dict(MOCK_GEO_DATA)
    data["ip"] = ip
    return {"source": "demo", "data": data}
