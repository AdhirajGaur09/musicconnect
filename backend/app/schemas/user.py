from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.user import ExperienceLevel, AvailabilityStatus


# ─── Request Schemas ───────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(..., min_length=2, max_length=50)
    city: str = Field(..., min_length=2, max_length=100)
    genres: List[str] = Field(default_factory=list)
    experience: ExperienceLevel = ExperienceLevel.beginner


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[str] = Field(None, min_length=2, max_length=50)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    genres: Optional[List[str]] = None
    experience: Optional[ExperienceLevel] = None
    bio: Optional[str] = Field(None, max_length=1000)
    availability: Optional[AvailabilityStatus] = None
    social_links: Optional[dict] = None

    model_config = {"extra": "ignore"}


# ─── Response Schemas ──────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: str
    city: str
    genres: List[str]
    experience: ExperienceLevel
    bio: Optional[str]
    profile_picture: Optional[str]
    social_links: dict
    availability: AvailabilityStatus
    rating: float
    rating_count: int
    gigs_completed: int
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class UserSearchParams(BaseModel):
    city: Optional[str] = None
    role: Optional[str] = None
    genre: Optional[str] = None
    experience: Optional[ExperienceLevel] = None
    search: Optional[str] = None
    skip: int = 0
    limit: int = 20
