from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from app.routes.auth import get_current_user
from app.core.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/")
async def get_history(
    page: int = 1,
    limit: int = 20,
    query_type: Optional[str] = None,
    threat_level: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user_id = str(current_user["_id"])
    match_filter = {"user_id": user_id}
    if query_type:
        match_filter["query_type"] = query_type
    if threat_level:
        match_filter["threat_level"] = threat_level
    if search:
        match_filter["query"] = {"$regex": search, "$options": "i"}

    total = await db.search_history.count_documents(match_filter)
    skip = (page - 1) * limit
    items = await db.search_history.find(match_filter).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]

    return {"items": items, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.delete("/{item_id}")
async def delete_history(item_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    result = await db.search_history.delete_one({"_id": ObjectId(item_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Deleted successfully"}


@router.post("/{item_id}/bookmark")
async def toggle_bookmark(item_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    item = await db.search_history.find_one({"_id": ObjectId(item_id), "user_id": user_id})
    if not item:
        raise HTTPException(status_code=404, detail="Record not found")
    new_state = not item.get("is_bookmarked", False)
    await db.search_history.update_one({"_id": ObjectId(item_id)}, {"$set": {"is_bookmarked": new_state}})
    return {"is_bookmarked": new_state}


@router.get("/bookmarks")
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    items = await db.search_history.find({"user_id": user_id, "is_bookmarked": True}).sort("created_at", -1).to_list(100)
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]
    return {"bookmarks": items}
