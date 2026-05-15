import re
import math
from typing import Dict, Any, List, Tuple

# Suspicious keyword lists
PHISHING_KEYWORDS = [
    "login", "signin", "verify", "secure", "account", "update", "confirm",
    "banking", "paypal", "amazon", "apple", "microsoft", "netflix",
    "password", "credential", "wallet", "crypto", "urgent", "suspended",
    "limited", "blocked", "unusual", "alert", "security", "validate"
]

MALICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".work", ".date"]

SUSPICIOUS_PATTERNS = [
    r"\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}",   # IP-like in domain
    r"[a-z]{20,}",                           # Very long random string
    r"(paypal|apple|google|amazon|microsoft)-[a-z]+\.",  # Brand impersonation
    r"[a-z]+-[a-z]+-[a-z]+\.",              # Multiple hyphens
    r"secure.*login|login.*secure",
    r"verify.*account|account.*verify",
]

THREAT_LEVELS = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]


def score_url(url: str) -> Dict[str, Any]:
    score = 0
    indicators = []

    url_lower = url.lower()

    # Keyword scoring
    matched_keywords = [kw for kw in PHISHING_KEYWORDS if kw in url_lower]
    if matched_keywords:
        score += min(len(matched_keywords) * 8, 40)
        indicators.append(f"Suspicious keywords detected: {', '.join(matched_keywords[:5])}")

    # TLD scoring
    for tld in MALICIOUS_TLDS:
        if url_lower.endswith(tld) or f"{tld}/" in url_lower:
            score += 25
            indicators.append(f"High-risk TLD detected: {tld}")
            break

    # Pattern matching
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, url_lower):
            score += 15
            indicators.append(f"Suspicious URL pattern detected")
            break

    # IP address used instead of domain
    if re.match(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url):
        score += 30
        indicators.append("IP address used instead of domain name")

    # HTTP (not HTTPS)
    if url_lower.startswith("http://"):
        score += 15
        indicators.append("Insecure HTTP connection (no SSL)")

    # Excessive subdomains
    domain_part = re.sub(r"https?://", "", url_lower).split("/")[0]
    if domain_part.count(".") > 3:
        score += 10
        indicators.append("Excessive subdomains detected")

    # URL length
    if len(url) > 100:
        score += 10
        indicators.append("Unusually long URL")

    score = min(score, 100)
    threat_level = _score_to_level(score)
    phishing_probability = min(score / 100, 1.0)

    return {
        "risk_score": score,
        "threat_level": threat_level,
        "phishing_probability": round(phishing_probability, 2),
        "indicators": indicators,
        "summary": _generate_url_summary(score, threat_level, indicators),
        "recommendations": _url_recommendations(score),
    }


def score_ip(ip: str, abuse_score: int = 0, report_count: int = 0) -> Dict[str, Any]:
    score = 0
    indicators = []

    if abuse_score > 0:
        score += min(abuse_score, 60)
        indicators.append(f"AbuseIPDB confidence score: {abuse_score}%")

    if report_count > 100:
        score += 20
        indicators.append(f"High number of abuse reports: {report_count}")
    elif report_count > 10:
        score += 10
        indicators.append(f"Multiple abuse reports: {report_count}")

    # Private IPs
    if _is_private_ip(ip):
        return {"risk_score": 0, "threat_level": "SAFE", "indicators": ["Private/internal IP address"], "summary": "This is a private network IP address.", "recommendations": []}

    score = min(score, 100)
    threat_level = _score_to_level(score)

    return {
        "risk_score": score,
        "threat_level": threat_level,
        "indicators": indicators,
        "summary": _generate_ip_summary(score, threat_level, ip),
        "recommendations": _ip_recommendations(score),
    }


def score_email(email: str, breach_count: int = 0) -> Dict[str, Any]:
    score = 0
    indicators = []

    if breach_count > 5:
        score = 85
        indicators.append(f"Found in {breach_count} data breaches — high risk")
    elif breach_count > 2:
        score = 60
        indicators.append(f"Found in {breach_count} data breaches — moderate risk")
    elif breach_count > 0:
        score = 35
        indicators.append(f"Found in {breach_count} data breach")
    else:
        indicators.append("No known breaches detected")

    # Disposable email domains
    disposable = ["mailinator", "guerrillamail", "10minutemail", "tempmail", "throwam", "yopmail"]
    domain = email.split("@")[-1].lower() if "@" in email else ""
    if any(d in domain for d in disposable):
        score += 20
        indicators.append("Disposable/temporary email provider detected")

    score = min(score, 100)
    threat_level = _score_to_level(score)

    return {
        "risk_score": score,
        "threat_level": threat_level,
        "breach_count": breach_count,
        "indicators": indicators,
        "summary": _generate_email_summary(score, threat_level, breach_count),
        "recommendations": _email_recommendations(score),
    }


def _score_to_level(score: int) -> str:
    if score >= 80: return "CRITICAL"
    if score >= 60: return "HIGH"
    if score >= 40: return "MEDIUM"
    if score >= 20: return "LOW"
    return "SAFE"


def _is_private_ip(ip: str) -> bool:
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    try:
        octets = [int(p) for p in parts]
        return (octets[0] == 10 or
                (octets[0] == 172 and 16 <= octets[1] <= 31) or
                (octets[0] == 192 and octets[1] == 168) or
                octets[0] == 127)
    except:
        return False


def _generate_url_summary(score: int, level: str, indicators: List[str]) -> str:
    if level == "CRITICAL":
        return f"⚠️ CRITICAL THREAT: This URL exhibits multiple high-risk characteristics including {', '.join(indicators[:2])}. Immediate action required — do not visit this URL."
    if level == "HIGH":
        return f"🔴 HIGH RISK: This URL shows significant threat indicators. {indicators[0] if indicators else 'Multiple red flags detected'}. Exercise extreme caution."
    if level == "MEDIUM":
        return f"🟡 MEDIUM RISK: This URL has some suspicious characteristics. {indicators[0] if indicators else 'Proceed with caution'}."
    if level == "LOW":
        return f"🟢 LOW RISK: Minor concerns detected. The URL appears mostly safe but has minor red flags."
    return "✅ SAFE: No significant threat indicators detected. URL appears safe."


def _generate_ip_summary(score: int, level: str, ip: str) -> str:
    if level == "CRITICAL":
        return f"⚠️ CRITICAL: IP {ip} has an extremely high abuse confidence score. This IP is associated with malicious activities including scanning, brute force, and spam."
    if level == "HIGH":
        return f"🔴 HIGH RISK: IP {ip} has been reported for malicious activity. Exercise extreme caution."
    if level == "MEDIUM":
        return f"🟡 MEDIUM RISK: IP {ip} has some abuse reports. Monitor closely."
    if level == "LOW":
        return f"🟢 LOW RISK: IP {ip} has minimal abuse history."
    return f"✅ SAFE: IP {ip} has no known abuse reports."


def _generate_email_summary(score: int, level: str, breach_count: int) -> str:
    if breach_count == 0:
        return "✅ SAFE: This email address was not found in any known data breaches."
    return f"⚠️ This email was found in {breach_count} data breach{'es' if breach_count > 1 else ''}. Personal data including passwords, usernames, and other sensitive information may have been exposed."


def _url_recommendations(score: int) -> List[str]:
    if score >= 60:
        return ["Do not visit this URL", "Report to cybercrime unit", "Block at firewall level", "Notify affected users", "Capture screenshot for evidence"]
    if score >= 40:
        return ["Exercise extreme caution", "Verify URL authenticity", "Check SSL certificate", "Use isolated VM if investigation required"]
    if score >= 20:
        return ["Verify URL source", "Check with VirusTotal manually", "Monitor for changes"]
    return ["URL appears safe", "Continue normal monitoring"]


def _ip_recommendations(score: int) -> List[str]:
    if score >= 60:
        return ["Block this IP at firewall", "Report to AbuseIPDB", "Investigate all connections from this IP", "Alert security team"]
    if score >= 40:
        return ["Monitor traffic from this IP", "Check server logs", "Consider rate limiting"]
    return ["Continue standard monitoring", "No immediate action required"]


def _email_recommendations(score: int) -> List[str]:
    if score >= 60:
        return ["Change passwords immediately", "Enable 2FA on all accounts", "Monitor for unauthorized access", "Check for credential stuffing", "Review account activity logs"]
    if score >= 30:
        return ["Consider changing passwords", "Enable 2FA where possible", "Monitor account activity"]
    return ["No immediate action required", "Maintain good password hygiene"]


def detect_input_type(query: str) -> str:
    query = query.strip()
    # IP address
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", query):
        return "ip"
    # Email
    if re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", query):
        return "email"
    # URL
    if re.match(r"^https?://", query):
        return "url"
    # Phone
    if re.match(r"^\+?[\d\s\-\(\)]{7,15}$", query):
        return "phone"
    # Domain
    if re.match(r"^[a-zA-Z0-9][a-zA-Z0-9\-\.]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$", query):
        return "domain"
    return "unknown"
