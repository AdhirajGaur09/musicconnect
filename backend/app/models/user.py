from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ExperienceLevel(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    professional = "Professional"


class AvailabilityStatus(str, Enum):
    available = "Available"
    busy = "Busy"
    looking = "Looking for band"


class SocialLinks(dict):
    pass


class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    role: str  # primary instrument/role
    city: str
    genres: List[str] = []
    experience: ExperienceLevel = ExperienceLevel.beginner
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    social_links: dict = Field(default_factory=dict)
    availability: AvailabilityStatus = AvailabilityStatus.available
    rating: float = 0.0
    rating_count: int = 0
    gigs_completed: int = 0
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            "city",
            "role",
            "experience",
        ]
