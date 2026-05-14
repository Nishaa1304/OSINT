import httpx
import hashlib
from typing import Dict, Any
from app.core.config import settings

KNOWN_IPS = {
    "8.8.8.8":  {"city": "Mountain View", "region": "California", "country": "US", "country_name": "United States", "org": "AS15169 Google LLC",      "latitude": 37.3861,  "longitude": -122.0839, "timezone": "America/Los_Angeles"},
    "1.1.1.1":  {"city": "Sydney",         "region": "New South Wales", "country": "AU", "country_name": "Australia",     "org": "AS13335 Cloudflare",    "latitude": -33.8688, "longitude": 151.2093,  "timezone": "Australia/Sydney"},
    "185.220.101.45": {"city": "Frankfurt", "region": "Hesse",      "country": "DE", "country_name": "Germany",       "org": "AS60729 Tor Exit Node", "latitude": 50.1109,  "longitude": 8.6821,    "timezone": "Europe/Berlin"},
}

CITIES = [
    ("Moscow",    "Moscow Oblast",  "RU", "Russia",         "AS12389 Rostelecom",          55.7522,  37.6156,  "Europe/Moscow"),
    ("Beijing",   "Beijing",        "CN", "China",          "AS4134 China Telecom",        39.9042, 116.4074,  "Asia/Shanghai"),
    ("Amsterdam", "North Holland",  "NL", "Netherlands",    "AS1101 SURFnet",              52.3676,   4.9041,  "Europe/Amsterdam"),
    ("São Paulo", "São Paulo",      "BR", "Brazil",         "AS28573 Claro",              -23.5505, -46.6333,  "America/Sao_Paulo"),
    ("Mumbai",    "Maharashtra",    "IN", "India",          "AS9829 BSNL",                 19.0760,  72.8777,  "Asia/Kolkata"),
    ("London",    "England",        "GB", "United Kingdom", "AS5089 Virgin Media",         51.5074,  -0.1278,  "Europe/London"),
    ("Paris",     "Île-de-France",  "FR", "France",         "AS3215 Orange",               48.8566,   2.3522,  "Europe/Paris"),
    ("Kyiv",      "Kyiv City",      "UA", "Ukraine",        "AS15895 Kyivstar",            50.4501,  30.5234,  "Europe/Kiev"),
    ("Toronto",   "Ontario",        "CA", "Canada",         "AS577 Bell Canada",           43.6532, -79.3832,  "America/Toronto"),
    ("Singapore", "Singapore",      "SG", "Singapore",      "AS9506 Singtel",               1.3521, 103.8198,  "Asia/Singapore"),
]


def _dynamic_mock(ip: str) -> Dict[str, Any]:
    if ip in KNOWN_IPS:
        d = KNOWN_IPS[ip].copy()
        d["ip"] = ip
        return d
    seed = int(hashlib.md5(ip.encode()).hexdigest(), 16)
    city, region, country, country_name, org, lat, lon, tz = CITIES[seed % len(CITIES)]
    # Add slight coordinate variation per IP
    lat_var = ((seed >> 8) % 100) / 1000
    lon_var = ((seed >> 16) % 100) / 1000
    return {
        "ip": ip, "city": city, "region": region,
        "country": country, "country_name": country_name,
        "org": org, "timezone": tz,
        "latitude": round(lat + lat_var, 4),
        "longitude": round(lon + lon_var, 4),
        "loc": f"{round(lat + lat_var, 4)},{round(lon + lon_var, 4)}",
    }


async def get_ip_geo(ip: str) -> Dict[str, Any]:
    if not settings.IPINFO_TOKEN:
        return {"source": "demo", "data": _dynamic_mock(ip)}
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
    return {"source": "demo", "data": _dynamic_mock(ip)}
