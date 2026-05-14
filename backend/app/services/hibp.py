import httpx
from typing import Dict, Any, List
from app.core.config import settings

MOCK_BREACH_DATA = [
    {
        "Name": "LinkedIn",
        "Title": "LinkedIn",
        "Domain": "linkedin.com",
        "BreachDate": "2021-06-22",
        "AddedDate": "2021-06-22T00:00:00Z",
        "ModifiedDate": "2021-06-22T00:00:00Z",
        "PwnCount": 700000000,
        "Description": "In June 2021, data associated with 700M LinkedIn accounts was offered for sale on a popular hacking forum.",
        "DataClasses": ["Email addresses", "Names", "Phone numbers", "Professional skills"],
        "IsVerified": True,
        "IsFabricated": False,
        "IsSensitive": False,
        "IsRetired": False,
        "IsSpamList": False,
        "LogoPath": "https://haveibeenpwned.com/Content/Images/PwnedLogos/LinkedIn.png"
    },
    {
        "Name": "Adobe",
        "Title": "Adobe",
        "Domain": "adobe.com",
        "BreachDate": "2013-10-04",
        "AddedDate": "2013-12-04T00:00:00Z",
        "PwnCount": 152445165,
        "Description": "In October 2013, 153 million Adobe accounts were breached.",
        "DataClasses": ["Email addresses", "Password hints", "Passwords", "Usernames"],
        "IsVerified": True,
        "IsFabricated": False,
        "IsSensitive": False,
        "IsRetired": False,
        "IsSpamList": False,
        "LogoPath": "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png"
    }
]


async def check_email_breaches(email: str) -> Dict[str, Any]:
    if not settings.HIBP_API_KEY:
        return {"source": "demo", "data": MOCK_BREACH_DATA, "email": email, "breach_count": len(MOCK_BREACH_DATA)}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}",
                headers={
                    "hibp-api-key": settings.HIBP_API_KEY,
                    "User-Agent": "OSINT-Dashboard",
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                return {"source": "hibp", "data": data, "email": email, "breach_count": len(data)}
            elif resp.status_code == 404:
                return {"source": "hibp", "data": [], "email": email, "breach_count": 0}
    except Exception:
        pass
    return {"source": "demo", "data": MOCK_BREACH_DATA, "email": email, "breach_count": len(MOCK_BREACH_DATA)}
