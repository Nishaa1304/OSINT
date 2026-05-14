import httpx
import hashlib
from typing import Dict, Any
from app.core.config import settings

ALL_BREACHES = [
    {"Name": "LinkedIn",   "Title": "LinkedIn",   "Domain": "linkedin.com",  "BreachDate": "2021-06-22", "PwnCount": 700000000, "Description": "In June 2021, data associated with 700M LinkedIn accounts was offered for sale.", "DataClasses": ["Email addresses", "Names", "Phone numbers", "Professional skills"], "IsVerified": True},
    {"Name": "Adobe",      "Title": "Adobe",      "Domain": "adobe.com",     "BreachDate": "2013-10-04", "PwnCount": 152445165, "Description": "In October 2013, 153 million Adobe accounts were breached with passwords exposed.", "DataClasses": ["Email addresses", "Password hints", "Passwords", "Usernames"], "IsVerified": True},
    {"Name": "Canva",      "Title": "Canva",      "Domain": "canva.com",     "BreachDate": "2019-05-24", "PwnCount": 137272116, "Description": "In May 2019, the graphic design tool Canva suffered a data breach.", "DataClasses": ["Email addresses", "Names", "Passwords", "Usernames"], "IsVerified": True},
    {"Name": "Dropbox",    "Title": "Dropbox",    "Domain": "dropbox.com",   "BreachDate": "2012-07-01", "PwnCount": 68648009,  "Description": "In mid-2012, Dropbox suffered a data breach which exposed credentials.", "DataClasses": ["Email addresses", "Passwords"], "IsVerified": True},
    {"Name": "Twitter",    "Title": "Twitter",    "Domain": "twitter.com",   "BreachDate": "2022-07-22", "PwnCount": 5485636,   "Description": "In 2022, a vulnerability in Twitter's API exposed millions of accounts.", "DataClasses": ["Email addresses", "Phone numbers", "Usernames"], "IsVerified": True},
    {"Name": "Tumblr",     "Title": "Tumblr",     "Domain": "tumblr.com",    "BreachDate": "2013-02-28", "PwnCount": 65469298,  "Description": "In early 2013, Tumblr suffered a data breach exposing email addresses and passwords.", "DataClasses": ["Email addresses", "Passwords"], "IsVerified": True},
    {"Name": "MySpace",    "Title": "MySpace",    "Domain": "myspace.com",   "BreachDate": "2008-07-01", "PwnCount": 359420698, "Description": "In 2008, MySpace suffered a massive breach exposing hundreds of millions of accounts.", "DataClasses": ["Email addresses", "Passwords", "Usernames"], "IsVerified": True},
    {"Name": "Snapchat",   "Title": "Snapchat",   "Domain": "snapchat.com",  "BreachDate": "2014-01-01", "PwnCount": 4609722,   "Description": "In January 2014, 4.6 million Snapchat usernames and phone numbers were published.", "DataClasses": ["Phone numbers", "Usernames"], "IsVerified": True},
]

DISPOSABLE_DOMAINS = ["mailinator", "guerrillamail", "10minutemail", "tempmail", "throwam", "yopmail", "trashmail"]
SAFE_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]


def _dynamic_mock(email: str) -> Dict[str, Any]:
    email_lower = email.lower()
    domain = email_lower.split("@")[-1] if "@" in email_lower else ""

    # Disposable email — always breached
    if any(d in domain for d in DISPOSABLE_DOMAINS):
        return {"source": "demo", "data": ALL_BREACHES[:4], "email": email, "breach_count": 4}

    # Known safe domains — fewer breaches based on hash
    seed = int(hashlib.md5(email_lower.encode()).hexdigest(), 16)

    if any(domain == s for s in SAFE_DOMAINS):
        count = seed % 4  # 0-3 breaches for common providers
    else:
        count = seed % (len(ALL_BREACHES) + 1)  # 0-8 for unknown domains

    if count == 0:
        return {"source": "demo", "data": [], "email": email, "breach_count": 0}

    # Pick deterministic subset of breaches
    selected = []
    indices = [(seed >> (i * 4)) % len(ALL_BREACHES) for i in range(count)]
    seen = set()
    for idx in indices:
        if idx not in seen:
            seen.add(idx)
            selected.append(ALL_BREACHES[idx])

    return {"source": "demo", "data": selected, "email": email, "breach_count": len(selected)}


async def check_email_breaches(email: str) -> Dict[str, Any]:
    if not settings.HIBP_API_KEY:
        return _dynamic_mock(email)
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
    return _dynamic_mock(email)
