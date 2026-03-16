from fastapi import APIRouter, HTTPException, status, Depends, Query, Body
from typing import Optional, List
from datetime import datetime
from app.models.user import User, ExperienceLevel
from app.schemas.user import UserPublic, UserUpdate
from app.auth.deps import get_current_user
from app.utils.security import hash_password, verify_password
from pydantic import EmailStr

router = APIRouter(prefix="/users", tags=["Users"])


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
        is_admin=user.is_admin,
        created_at=user.created_at,
    )


@router.get("/", response_model=List[UserPublic])
async def get_users(
    city: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    experience: Optional[ExperienceLevel] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = User.find(User.is_active == True)

    if city:
        query = query.find(User.city == city)
    if role:
        query = query.find(User.role == role)
    if experience:
        query = query.find(User.experience == experience)
    if genre:
        query = query.find({"genres": {"$in": [genre]}})
    if search:
        query = query.find({
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"role": {"$regex": search, "$options": "i"}},
                {"bio": {"$regex": search, "$options": "i"}},
            ]
        })

    users = await query.sort(-User.rating).skip(skip).limit(limit).to_list()
    return [user_to_public(u) for u in users]


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: User = Depends(get_current_user)):
    return user_to_public(current_user)

@router.patch("/me", response_model=UserPublic)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(current_user, key, value)

    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    return user_to_public(current_user)


@router.patch("/me/change-password")
async def change_password(
    current_password: str = Body(...),
    new_password: str = Body(..., min_length=6),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.hashed_password = hash_password(new_password)
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    return {"message": "Password updated successfully"}


@router.patch("/me/change-email")
async def change_email(
    new_email: EmailStr = Body(...),
    password: str = Body(...),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password is incorrect")
    
    existing = await User.find_one(User.email == new_email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")
    
    current_user.email = new_email
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    return {"message": "Email updated successfully"}

@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: str):
    user = await User.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_to_public(user)