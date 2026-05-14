import httpx
from app.core.config import settings


SYSTEM_PROMPT = (
    "You are an OSINT and cybersecurity assistant. Provide accurate, concise, and practical answers. "
    "If the user asks for illegal or harmful actions, refuse and offer safe alternatives."
)


async def get_chat_response(message: str) -> str | None:
    if not settings.GROQ_API_KEY:
        return None

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        "temperature": 0.2,
        "max_tokens": 600,
    }

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return content.strip() or None
    except Exception:
        return None
