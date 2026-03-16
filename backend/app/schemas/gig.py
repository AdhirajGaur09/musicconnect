from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.gig import GigStatus, PaymentType


# ─── Request Schemas ───────────────────────────────────────────────────────────

class GigCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    city: str = Field(..., min_length=2, max_length=100)
    date: datetime
    required_roles: List[str] = Field(..., min_length=1)
    payment: float = Field(default=0.0, ge=0)
    payment_type: PaymentType = PaymentType.per_gig


class GigUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    city: Optional[str] = None
    date: Optional[datetime] = None
    required_roles: Optional[List[str]] = None
    payment: Optional[float] = Field(None, ge=0)
    payment_type: Optional[PaymentType] = None
    status: Optional[GigStatus] = None


class ApplyToGig(BaseModel):
    message: str = Field(default="", max_length=500)


# ─── Response Schemas ──────────────────────────────────────────────────────────

class GigResponse(BaseModel):
    id: str
    title: str
    description: str
    city: str
    date: datetime
    required_roles: List[str]
    payment: float
    payment_type: PaymentType
    status: GigStatus
    created_by: str
    created_by_name: str
    applicant_count: int
    created_at: datetime
    has_applied: bool = False  # populated per-user

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: str
    gig_id: str
    gig_title: str
    applicant_id: str
    applicant_name: str
    applicant_role: str
    message: str
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True
