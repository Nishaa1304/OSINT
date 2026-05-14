from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.routes.auth import get_current_user
from app.core.database import get_db
from bson import ObjectId
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate/{search_id}")
async def generate_report(search_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    item = await db.search_history.find_one({"_id": ObjectId(search_id), "user_id": user_id})
    if not item:
        raise HTTPException(status_code=404, detail="Search record not found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=inch*0.75, leftMargin=inch*0.75, topMargin=inch*0.75, bottomMargin=inch*0.75)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=20, textColor=colors.HexColor("#00d4ff"), spaceAfter=6, alignment=TA_CENTER)
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=13, textColor=colors.HexColor("#0a0e1a"), spaceBefore=12, spaceAfter=4)
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, spaceAfter=4)
    label_style = ParagraphStyle("Label", parent=styles["Normal"], fontSize=9, textColor=colors.grey)

    threat_level = item.get("threat_level", "UNKNOWN")
    risk_score = item.get("risk_score", 0)
    color_map = {"CRITICAL": "#ff0000", "HIGH": "#ff6600", "MEDIUM": "#ffcc00", "LOW": "#66cc00", "SAFE": "#00cc66"}
    threat_color = colors.HexColor(color_map.get(threat_level, "#888888"))

    story = []
    story.append(Paragraph("OSINT THREAT INTELLIGENCE REPORT", title_style))
    story.append(Paragraph("Government Cyber Cell — Confidential", ParagraphStyle("sub", parent=styles["Normal"], fontSize=10, textColor=colors.grey, alignment=TA_CENTER)))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#00d4ff")))
    story.append(Spacer(1, 12))

    meta_data = [
        ["Report Generated:", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["Investigator:", current_user.get("username", "Unknown")],
        ["Query:", item.get("query", "N/A")],
        ["Query Type:", item.get("query_type", "N/A").upper()],
        ["Search Time:", item.get("created_at", datetime.utcnow()).strftime("%Y-%m-%d %H:%M UTC") if hasattr(item.get("created_at", ""), "strftime") else str(item.get("created_at", "N/A"))],
    ]

    meta_table = Table(meta_data, colWidths=[2*inch, 4.5*inch])
    meta_table.setStyle(TableStyle([
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("TEXTCOLOR", (0,0), (0,-1), colors.grey),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Spacer(1, 12))

    story.append(Paragraph("THREAT ASSESSMENT", heading_style))
    threat_data = [
        ["Threat Level", "Risk Score", "Status"],
        [threat_level, f"{risk_score}/100", "ACTIVE INVESTIGATION"],
    ]
    threat_table = Table(threat_data, colWidths=[2*inch, 2*inch, 2.5*inch])
    threat_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0a0e1a")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 10),
        ("BACKGROUND", (0,1), (0,1), threat_color),
        ("TEXTCOLOR", (0,1), (0,1), colors.white),
        ("FONTNAME", (0,1), (0,1), "Helvetica-Bold"),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#f8f8f8")]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(threat_table)
    story.append(Spacer(1, 12))

    summary = item.get("result_summary", {})
    if summary.get("summary"):
        story.append(Paragraph("AI ANALYSIS SUMMARY", heading_style))
        story.append(Paragraph(summary["summary"], body_style))
        story.append(Spacer(1, 8))

    if summary.get("indicators"):
        story.append(Paragraph("THREAT INDICATORS", heading_style))
        for ind in summary["indicators"]:
            story.append(Paragraph(f"• {ind}", body_style))
        story.append(Spacer(1, 8))

    if summary.get("recommendations"):
        story.append(Paragraph("RECOMMENDATIONS", heading_style))
        for rec in summary["recommendations"]:
            story.append(Paragraph(f"→ {rec}", body_style))
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey))
    story.append(Paragraph("CONFIDENTIAL — Government Cyber Cell — For Official Use Only", ParagraphStyle("footer", parent=styles["Normal"], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))

    doc.build(story)
    buffer.seek(0)

    filename = f"threat_report_{item.get('query_type','unknown')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})
