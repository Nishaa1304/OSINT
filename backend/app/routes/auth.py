from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token
)
from app.core.database import get_db
from app.models.user import UserCreate, UserOut, LoginRequest, TokenResponse
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def serialize_user(user: dict) -> dict:
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["hashed_password"]
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed = get_password_hash(user_data.password)
    user_doc = {
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "hashed_password": hashed,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login": None,
        "avatar": None,
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    access_token = create_access_token({"sub": user_id, "role": user_data.role})
    refresh_token = create_refresh_token({"sub": user_id, "role": user_data.role})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut(
            id=user_id,
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            role=user_data.role,
            is_active=True,
            created_at=user_doc["created_at"],
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}})

    access_token = create_access_token({"sub": user_id, "role": user["role"]})
    refresh_token = create_refresh_token({"sub": user_id, "role": user["role"]})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut(
            id=user_id,
            email=user["email"],
            username=user["username"],
            full_name=user.get("full_name"),
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"],
            last_login=user.get("last_login"),
        )
    )


@router.post("/refresh")
async def refresh_token(token: str):
    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_access = create_access_token({"sub": payload["sub"], "role": payload.get("role", "intern")})
    return {"access_token": new_access, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=str(current_user["_id"]),
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
        role=current_user["role"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
        last_login=current_user.get("last_login"),
    )


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(req: PasswordResetRequest):
    db = get_db()
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Return success even if user not found (security best practice)
        return {"message": "If this email exists, a reset link has been sent to your administrator."}
    return {"message": "Password reset request received. Contact your Cyber Cell administrator with your employee ID."}


@router.post("/change-password")
async def change_password(req: PasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    if not verify_password(req.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    db = get_db()
    hashed = get_password_hash(req.new_password)
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": {"hashed_password": hashed}})
    return {"message": "Password changed successfully"}
