from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class ThreatReport(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    search_id: str
    query: str
    query_type: str
    threat_level: str
    risk_score: int
    summary: str
    details: Dict[str, Any] = {}
    recommendations: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    pdf_url: Optional[str] = None

    class Config:
        populate_by_name = True


class Alert(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    title: str
    message: str
    alert_type: str  # success, warning, danger, critical
    query: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class Bookmark(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    search_id: str
    query: str
    query_type: str
    threat_level: str
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
