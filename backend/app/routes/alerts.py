from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime
from app.routes.auth import get_current_user
from app.core.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/")
async def get_alerts(is_read: Optional[bool] = None, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    match_filter = {"user_id": user_id}
    if is_read is not None:
        match_filter["is_read"] = is_read
    items = await db.alerts.find(match_filter).sort("created_at", -1).limit(50).to_list(50)
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]
    return {"alerts": items}


@router.post("/{alert_id}/read")
async def mark_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    result = await db.alerts.update_one(
        {"_id": ObjectId(alert_id), "user_id": user_id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Marked as read"}


@router.post("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    await db.alerts.update_many({"user_id": user_id, "is_read": False}, {"$set": {"is_read": True}})
    return {"message": "All alerts marked as read"}


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    result = await db.alerts.delete_one({"_id": ObjectId(alert_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted"}
