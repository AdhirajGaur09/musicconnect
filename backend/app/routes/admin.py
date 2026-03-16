from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from app.models.user import User
from app.models.gig import Gig
from app.models.application import Application
from app.schemas.user import UserPublic
from app.auth.deps import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


def user_to_public(user: User) -> UserPublic:
    return UserPublic(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        city=user.city,
        genres=user.genres,
        experience=user.experience,
        bio=user.bio,
        profile_picture=user.profile_picture,
        social_links=user.social_links,
        availability=user.availability,
        rating=user.rating,
        rating_count=user.rating_count,
        gigs_completed=user.gigs_completed,
        created_at=user.created_at,
    )


# ── Stats overview ─────────────────────────────────────────────────────────────
@router.get("/stats")
async def get_stats(admin: User = Depends(get_admin_user)):
    total_users = await User.find().count()
    total_gigs  = await Gig.find().count()
    total_apps  = await Application.find().count()
    active_gigs = await Gig.find(Gig.status == "open").count()
    banned_users = await User.find(User.is_active == False).count()
    return {
        "total_users":   total_users,
        "total_gigs":    total_gigs,
        "total_apps":    total_apps,
        "active_gigs":   active_gigs,
        "banned_users":  banned_users,
    }


# ── List all users ─────────────────────────────────────────────────────────────
@router.get("/users", response_model=List[dict])
async def list_all_users(admin: User = Depends(get_admin_user)):
    users = await User.find_all().to_list()
    return [
        {
            "id":         str(u.id),
            "name":       u.name,
            "email":      u.email,
            "role":       u.role,
            "city":       u.city,
            "is_active":  u.is_active,
            "is_admin":   u.is_admin,
            "gigs_completed": u.gigs_completed,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


# ── Ban user ───────────────────────────────────────────────────────────────────
@router.patch("/users/{user_id}/ban")
async def ban_user(user_id: str, admin: User = Depends(get_admin_user)):
    if user_id == str(admin.id):
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": f"{user.name} has been banned"}


# ── Unban user ─────────────────────────────────────────────────────────────────
@router.patch("/users/{user_id}/unban")
async def unban_user(user_id: str, admin: User = Depends(get_admin_user)):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": f"{user.name} has been unbanned"}


# ── Promote to admin ───────────────────────────────────────────────────────────
@router.patch("/users/{user_id}/promote")
async def promote_user(user_id: str, admin: User = Depends(get_admin_user)):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": f"{user.name} is now an admin"}


# ── Delete any gig ─────────────────────────────────────────────────────────────
@router.delete("/gigs/{gig_id}")
async def delete_gig(gig_id: str, admin: User = Depends(get_admin_user)):
    gig = await Gig.get(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    await gig.delete()
    return {"message": "Gig deleted"}


# ── Delete any user ────────────────────────────────────────────────────────────
@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: User = Depends(get_admin_user)):
    if user_id == str(admin.id):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"message": f"{user.name} has been deleted"}