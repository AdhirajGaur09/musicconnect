from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.user import User
from app.models.gig import Gig
from app.models.application import Application


async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client.get_default_database(),
        document_models=[User, Gig, Application],
    )
    print("✅  MongoDB connected and Beanie initialized")
