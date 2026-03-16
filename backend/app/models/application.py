from beanie import Document
from pydantic import Field
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"


class Application(Document):
    gig_id: str
    gig_title: str  # denormalized
    applicant_id: str
    applicant_name: str  # denormalized
    applicant_role: str  # denormalized
    message: str = ""
    status: ApplicationStatus = ApplicationStatus.pending
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "applications"
        indexes = [
            "gig_id",
            "applicant_id",
            [("gig_id", 1), ("applicant_id", 1)],
        ]
