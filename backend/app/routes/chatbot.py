from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.routes.auth import get_current_user
import re

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

KNOWLEDGE_BASE = {
    "phishing": "Phishing is a type of cyberattack where criminals impersonate legitimate organizations via email, text, or fake websites to trick victims into revealing sensitive information like passwords, credit card numbers, or personal data. Always verify sender identity and look for HTTPS before entering credentials.",
    "malware": "Malware (malicious software) is any software designed to disrupt, damage, or gain unauthorized access to computer systems. Types include viruses, worms, trojans, ransomware, and spyware. Keep systems updated and use reputable antivirus software.",
    "ransomware": "Ransomware is malware that encrypts a victim's data and demands payment (ransom) for the decryption key. Never pay the ransom — report to cybercrime authorities instead. Maintain regular backups and keep systems patched.",
    "sql injection": "SQL Injection is a web security vulnerability that allows attackers to interfere with database queries. It can allow attackers to view, modify, or delete data. Always use parameterized queries and input validation.",
    "xss": "Cross-Site Scripting (XSS) is a vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. It can be used to steal session cookies, redirect users, or deface websites.",
    "ddos": "A Distributed Denial of Service (DDoS) attack floods a target server or network with traffic from multiple sources, making it unavailable to legitimate users. Mitigation includes rate limiting, traffic scrubbing, and CDN services.",
    "osint": "OSINT (Open Source Intelligence) is the practice of collecting and analyzing publicly available information for intelligence purposes. Sources include social media, news sites, public records, forums, and technical data like WHOIS records and DNS.",
    "ip address": "An IP (Internet Protocol) address is a numerical label assigned to each device on a network. IPv4 addresses use the format X.X.X.X. Suspicious IPs can be investigated using tools like AbuseIPDB, IPInfo, and Shodan.",
    "blacklist": "A blacklist is a list of IP addresses, domains, or URLs known to be malicious or spam sources. Being blacklisted means a resource has been flagged for harmful activity. Check blacklists using VirusTotal, AbuseIPDB, or MX Toolbox.",
    "ssl": "SSL (Secure Sockets Layer) / TLS (Transport Layer Security) encrypts data between a browser and server. A valid SSL certificate is indicated by HTTPS and a padlock icon. Always verify SSL validity when investigating suspicious URLs.",
    "breach": "A data breach is when unauthorized individuals gain access to confidential data. Breaches often expose emails, passwords, personal information, and financial data. Check email exposure using HaveIBeenPwned.",
    "vpn": "A VPN (Virtual Private Network) encrypts internet traffic and masks a user's real IP address. While legitimate uses exist, attackers often use VPNs or Tor to hide their identity and location during cyberattacks.",
    "tor": "Tor (The Onion Router) is an anonymity network that routes traffic through multiple encrypted layers. Often used by threat actors to hide identity. Suspicious IPs using Tor exit nodes should be treated with caution.",
    "threat intelligence": "Threat Intelligence is evidence-based knowledge about existing or emerging threats. It helps organizations understand attacker tactics, techniques, and procedures (TTPs). Sources include threat feeds, ISAC reports, and OSINT tools.",
    "risk score": "A risk score is a numerical value (0-100) indicating the likelihood that a URL, IP, or email is malicious. SAFE (0-19), LOW (20-39), MEDIUM (40-59), HIGH (60-79), CRITICAL (80-100).",
    "virustotal": "VirusTotal is a free online service that analyzes files and URLs for viruses and malware using 70+ antivirus engines and website scanners. Use it to check suspicious files, URLs, domains, and IP addresses.",
    "domain": "A domain name is a human-readable address for a website (e.g., example.com). Suspicious domains can be analyzed for WHOIS info, registration date, SSL validity, and reputation using VirusTotal and WHOIS lookup tools.",
    "ioc": "IOC (Indicators of Compromise) are forensic artifacts that indicate a potential breach. Common IOCs include suspicious IP addresses, malicious domain names, unusual file hashes, and abnormal network traffic patterns.",
    "social engineering": "Social engineering is the psychological manipulation of people into revealing confidential information or performing actions that compromise security. Phishing, pretexting, baiting, and vishing are common techniques.",
    "zero day": "A zero-day vulnerability is a previously unknown software flaw that hackers can exploit before developers release a fix (patch). Zero-day exploits are extremely dangerous because no defense exists at the time of attack.",
}


class ChatMessage(BaseModel):
    message: str


def find_answer(user_message: str) -> str:
    msg = user_message.lower().strip()

    # Greetings
    if any(g in msg for g in ["hello", "hi", "hey", "good morning", "good afternoon"]):
        return "👋 Hello! I'm your OSINT Intelligence Assistant. I can help explain cybersecurity concepts, guide your investigations, and answer questions about threats. What would you like to know?"

    if any(g in msg for g in ["thank", "thanks", "ty"]):
        return "You're welcome! Stay vigilant and always verify before trusting any source. Is there anything else you'd like to know? 🔐"

    if any(g in msg for g in ["help", "what can you do", "capabilities"]):
        return ("I can help you with:\n\n"
                "🔍 **Explaining cyber terms** — phishing, malware, XSS, SQL injection, etc.\n"
                "📊 **Understanding threat levels** — SAFE, LOW, MEDIUM, HIGH, CRITICAL\n"
                "🌐 **Investigation guidance** — how to analyze IPs, URLs, emails, domains\n"
                "🛡️ **Security best practices** — recommendations for suspicious findings\n"
                "📚 **OSINT methodology** — open source intelligence techniques\n\n"
                "Just type your question!")

    if "risk score" in msg or "threat level" in msg or "score mean" in msg:
        return KNOWLEDGE_BASE["risk score"]

    if "investigate" in msg and ("ip" in msg or "address" in msg):
        return ("To investigate a suspicious IP address:\n\n"
                "1. **Use the Threat Search** — enter the IP in the search bar\n"
                "2. **Check AbuseIPDB** — view abuse confidence score and reports\n"
                "3. **Geolocation** — identify country, city, ISP\n"
                "4. **Look for VPN/Tor usage** — indicates anonymization attempts\n"
                "5. **Review historical reports** — patterns of malicious activity\n"
                "6. **Generate a report** — document findings for your supervisor")

    if "investigate" in msg and "url" in msg:
        return ("To investigate a suspicious URL:\n\n"
                "1. **Use Threat Search** — paste the URL\n"
                "2. **Check VirusTotal results** — how many engines flagged it\n"
                "3. **PhishTank lookup** — check if it's a known phishing site\n"
                "4. **Verify SSL** — HTTPS with valid certificate is essential\n"
                "5. **Check domain age** — newly registered domains are suspicious\n"
                "6. **AI Analysis** — review phishing probability and indicators\n"
                "⚠️ Never visit suspicious URLs directly — use sandboxed environments")

    if "investigate" in msg and "email" in msg:
        return ("To investigate a suspicious email address:\n\n"
                "1. **Search the email** in Threat Search\n"
                "2. **HaveIBeenPwned** — check for data breach exposure\n"
                "3. **Breach count** — multiple breaches indicate high compromise risk\n"
                "4. **Leaked platforms** — understand what data was exposed\n"
                "5. **Notify the owner** if this is a victim's email\n"
                "6. **Document findings** and generate a PDF report")

    # Check knowledge base
    for key, answer in KNOWLEDGE_BASE.items():
        if key in msg or (len(key) > 4 and key.replace(" ", "") in msg.replace(" ", "")):
            return f"**{key.upper()}**\n\n{answer}"

    # Generic cyber question
    if any(w in msg for w in ["what is", "what are", "explain", "define", "how does", "tell me about"]):
        return ("I don't have specific information on that topic yet. Here are some things I can help with:\n\n"
                "• Phishing, Malware, Ransomware\n• SQL Injection, XSS, DDoS\n"
                "• OSINT, Threat Intelligence, IOCs\n• IP analysis, domain investigation\n"
                "• Risk scores and threat levels\n• SSL, VPN, Tor\n• Data breaches\n\n"
                "Try asking about any of these topics!")

    return ("I'm not sure I understood that. Try asking me:\n"
            "• 'What is phishing?'\n• 'How do I investigate an IP?'\n"
            "• 'What does a HIGH risk score mean?'\n• 'Explain malware'\n"
            "• 'What is OSINT?'")


@router.post("/message")
async def chat(msg: ChatMessage, current_user: dict = Depends(get_current_user)):
    answer = find_answer(msg.message)
    return {
        "user_message": msg.message,
        "assistant_response": answer,
        "timestamp": __import__("datetime").datetime.utcnow().isoformat()
    }
