from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from datetime import datetime
from app.models.gig import Gig, GigStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.gig import GigCreate, GigUpdate, GigResponse, ApplicationResponse, ApplyToGig
from app.auth.deps import get_current_user, get_current_user_optional
from app.models.user import User

router = APIRouter(prefix="/gigs", tags=["Gigs"])


def gig_to_response(gig: Gig, user_id: str | None = None) -> GigResponse:
    return GigResponse(
        id=str(gig.id),
        title=gig.title,
        description=gig.description,
        city=gig.city,
        date=gig.date,
        required_roles=gig.required_roles,
        payment=gig.payment,
        payment_type=gig.payment_type,
        status=gig.status,
        created_by=gig.created_by,
        created_by_name=gig.created_by_name,
        applicant_count=gig.applicant_count,
        created_at=gig.created_at,
        has_applied=user_id in gig.applicant_ids if user_id else False,
    )


# ─── List Gigs ────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[GigResponse])
async def get_gigs(
    city: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[GigStatus] = Query(GigStatus.open),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User | None = Depends(get_current_user_optional),
):
    query = Gig.find()

    if status:
        query = query.find(Gig.status == status)
    if city:
        query = query.find(Gig.city == city)
    if role:
        query = query.find({"required_roles": {"$in": [role]}})
    if search:
        query = query.find({
            "$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        })

    gigs = await query.sort(-Gig.created_at).skip(skip).limit(limit).to_list()
    user_id = str(current_user.id) if current_user else None
    return [gig_to_response(g, user_id) for g in gigs]


# ─── Create Gig ───────────────────────────────────────────────────────────────

@router.post("/", response_model=GigResponse, status_code=status.HTTP_201_CREATED)
async def create_gig(
    data: GigCreate,
    current_user: User = Depends(get_current_user),
):
    gig = Gig(
        title=data.title,
        description=data.description,
        city=data.city,
        date=data.date,
        required_roles=data.required_roles,
        payment=data.payment,
        payment_type=data.payment_type,
        created_by=str(current_user.id),
        created_by_name=current_user.name,
    )
    await gig.insert()
    return gig_to_response(gig, str(current_user.id))


# ─── Get Single Gig ───────────────────────────────────────────────────────────

@router.get("/{gig_id}", response_model=GigResponse)
async def get_gig(
    gig_id: str,
    current_user: User | None = Depends(get_current_user_optional),
):
    gig = await Gig.get(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    user_id = str(current_user.id) if current_user else None
    return gig_to_response(gig, user_id)


# ─── Update Gig ───────────────────────────────────────────────────────────────

@router.patch("/{gig_id}", response_model=GigResponse)
async def update_gig(
    gig_id: str,
    data: GigUpdate,
    current_user: User = Depends(get_current_user),
):
    gig = await Gig.get(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.created_by != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to edit this gig")

    update_data = data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    await gig.update({"$set": update_data})
    await gig.reload()
    return gig_to_response(gig, str(current_user.id))


# ─── Delete Gig ───────────────────────────────────────────────────────────────

@router.delete("/{gig_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gig(
    gig_id: str,
    current_user: User = Depends(get_current_user),
):
    gig = await Gig.get(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.created_by != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this gig")
    await gig.delete()


# ─── Apply to Gig ─────────────────────────────────────────────────────────────

@router.post("/{gig_id}/apply", response_model=ApplicationResponse, status_code=201)
async def apply_to_gig(
    gig_id: str,
    body: ApplyToGig,
    current_user: User = Depends(get_current_user),
):
    gig = await Gig.get(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.status != GigStatus.open:
        raise HTTPException(status_code=400, detail="This gig is no longer accepting applications")
    if gig.created_by == str(current_user.id):
        raise HTTPException(status_code=400, detail="You cannot apply to your own gig")

    user_id = str(current_user.id)
    existing = await Application.find_one(
        Application.gig_id == gig_id,
        Application.applicant_id == user_id,
        Application.status != ApplicationStatus.cancelled,
    )
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this gig")

    application = Application(
        gig_id=gig_id,
        gig_title=gig.title,
        applicant_id=user_id,
        applicant_name=current_user.name,
        applicant_role=current_user.role,
        message=body.message,
    )
    await application.insert()

    # Update gig applicant list
    if user_id not in gig.applicant_ids:
        await gig.update({"$addToSet": {"applicant_ids": user_id}, "$inc": {"applicant_count": 1}})

    return ApplicationResponse(
        id=str(application.id),
        gig_id=application.gig_id,
        gig_title=application.gig_title,
        applicant_id=application.applicant_id,
        applicant_name=application.applicant_name,
        applicant_role=application.applicant_role,
        message=application.message,
        status=application.status,
        applied_at=application.applied_at,
    )


# ─── Cancel Application ───────────────────────────────────────────────────────

@router.delete("/{gig_id}/apply", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_application(
    gig_id: str,
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)
    application = await Application.find_one(
        Application.gig_id == gig_id,
        Application.applicant_id == user_id,
        Application.status != ApplicationStatus.cancelled,
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    await application.update({"$set": {"status": ApplicationStatus.cancelled, "updated_at": datetime.utcnow()}})

    gig = await Gig.get(gig_id)
    if gig:
        await gig.update({"$pull": {"applicant_ids": user_id}, "$inc": {"applicant_count": -1}})


# ─── Get Gig Applicants (owner only) ─────────────────────────────────────────

@router.get("/{gig_id}/applicants", response_model=List[ApplicationResponse])
async def get_applicants(
    gig_id: str,
    current_user: User = Depends(get_current_user),
):
    gig = await Gig.get(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.created_by != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the gig owner can view applicants")

    applications = await Application.find(
        Application.gig_id == gig_id,
        Application.status != ApplicationStatus.cancelled,
    ).to_list()

    return [
        ApplicationResponse(
            id=str(a.id),
            gig_id=a.gig_id,
            gig_title=a.gig_title,
            applicant_id=a.applicant_id,
            applicant_name=a.applicant_name,
            applicant_role=a.applicant_role,
            message=a.message,
            status=a.status,
            applied_at=a.applied_at,
        )
        for a in applications
    ]


# ─── My Applications ──────────────────────────────────────────────────────────

@router.get("/my/applications", response_model=List[ApplicationResponse])
async def my_applications(current_user: User = Depends(get_current_user)):
    applications = await Application.find(
        Application.applicant_id == str(current_user.id)
    ).sort(-Application.applied_at).to_list()

    return [
        ApplicationResponse(
            id=str(a.id),
            gig_id=a.gig_id,
            gig_title=a.gig_title,
            applicant_id=a.applicant_id,
            applicant_name=a.applicant_name,
            applicant_role=a.applicant_role,
            message=a.message,
            status=a.status,
            applied_at=a.applied_at,
        )
        for a in applications
    ]
