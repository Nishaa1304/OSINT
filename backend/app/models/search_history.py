from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime


class SearchHistory(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    query: str
    query_type: Literal["url", "ip", "email", "domain", "phone"]
    result_summary: Optional[Dict[str, Any]] = None
    risk_score: Optional[int] = None
    threat_level: Optional[Literal["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]] = None
    is_bookmarked: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
