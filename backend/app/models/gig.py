from beanie import Document, Link
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


class GigStatus(str, Enum):
    open = "open"
    filled = "filled"
    cancelled = "cancelled"
    completed = "completed"


class PaymentType(str, Enum):
    per_gig = "Per Gig"
    per_hour = "Per Hour"
    per_event = "Per Event"
    per_project = "Per Project"
    rev_share = "Rev Share"
    volunteer = "Volunteer"


class Gig(Document):
    title: str
    description: str
    city: str
    date: datetime
    required_roles: List[str]
    payment: float = 0.0
    payment_type: PaymentType = PaymentType.per_gig
    status: GigStatus = GigStatus.open
    created_by: str  # user id as string
    created_by_name: str  # denormalized for display
    applicant_ids: List[str] = Field(default_factory=list)
    applicant_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "gigs"
        indexes = [
            "city",
            "status",
            "created_by",
            "created_at",
        ]
