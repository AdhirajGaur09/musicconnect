from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserPublic
from app.utils.security import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


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


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        city=data.city,
        genres=data.genres,
        experience=data.experience,
    )
    await user.insert()

    token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token, user=user_to_public(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token, user=user_to_public(user))
