from fastapi import APIRouter, Depends
from app.auth.deps import get_current_user
from app.models.user import User
from app.utils.recommender import get_musician_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/musicians")
async def recommend_musicians(current_user: User = Depends(get_current_user)):
    all_users = await User.find_all().to_list()
    recommended = get_musician_recommendations(current_user, all_users, top_n=5)

    return [
        {
            "id": str(user.id),
            "name": user.name,
            "role": user.role,
            "city": user.city,
            "genres": user.genres,
            "experience": user.experience,
            "profile_picture": user.profile_picture,
        }
        for user in recommended
    ]