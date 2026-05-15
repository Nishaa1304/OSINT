import httpx
from typing import Dict, Any
from app.core.config import settings


async def check_email_breaches(email: str) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Try XposedOrNot — free, no API key needed
            resp = await client.get(
                f"https://api.xposedornot.com/v1/check-email/{email}",
                headers={"User-Agent": "OSINT-Dashboard"}
            )
            if resp.status_code == 200:
                data = resp.json()
                breaches = data.get("breaches", [])
                # XposedOrNot returns list of breach names, build detail list
                breach_list = [{"Name": b, "Title": b, "Domain": "", "BreachDate": "", "Description": f"Breach: {b}", "DataClasses": []} for b in breaches]
                return {"source": "xposedornot", "data": breach_list, "email": email, "breach_count": len(breach_list)}
            elif resp.status_code == 404:
                return {"source": "xposedornot", "data": [], "email": email, "breach_count": 0}
    except Exception:
        pass

    # Fallback to HIBP if API key is set
    if settings.HIBP_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}",
                    headers={"hibp-api-key": settings.HIBP_API_KEY, "User-Agent": "OSINT-Dashboard"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {"source": "hibp", "data": data, "email": email, "breach_count": len(data)}
                elif resp.status_code == 404:
                    return {"source": "hibp", "data": [], "email": email, "breach_count": 0}
        except Exception:
            pass

    return {"source": "error", "data": [], "email": email, "breach_count": 0, "message": "Could not reach breach API"}
