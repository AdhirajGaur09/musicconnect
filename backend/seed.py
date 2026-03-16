"""
Seed script — populates MongoDB with sample musicians and gigs.
Run once after setting up your .env:
    cd backend && python seed.py
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User, ExperienceLevel, AvailabilityStatus
from app.models.gig import Gig, GigStatus, PaymentType
from app.utils.security import hash_password
from app.config import settings


SAMPLE_USERS = [
    dict(name="Priya Sharma",   email="priya@demo.com",   password="demo1234", role="Vocalist",  city="Bangalore", genres=["Pop","R&B","Soul"],         experience=ExperienceLevel.professional, bio="Powerhouse vocalist with 6 years of stage experience. Former lead singer of The Midnight Bloom.", rating=4.9, rating_count=18, gigs_completed=34),
    dict(name="Rahul Mehta",    email="rahul@demo.com",   password="demo1234", role="Drummer",   city="Mumbai",    genres=["Rock","Metal","Jazz"],       experience=ExperienceLevel.intermediate, bio="Jazz and metal drummer with solid timing and dynamic range. Session work welcome.", rating=4.7, rating_count=12, gigs_completed=21),
    dict(name="Meera Krishnan", email="meera@demo.com",   password="demo1234", role="Pianist",   city="Chennai",   genres=["Classical","Jazz","Pop"],    experience=ExperienceLevel.professional, bio="Carnatic-trained pianist blending classical roots with contemporary genres.", rating=5.0, rating_count=24, gigs_completed=52, availability=AvailabilityStatus.busy),
    dict(name="Dev Patel",      email="dev@demo.com",     password="demo1234", role="Bassist",   city="Bangalore", genres=["Funk","Rock","Blues"],       experience=ExperienceLevel.intermediate, bio="Groove-first bassist who believes in serving the song. Loves Jaco Pastorius.", rating=4.6, rating_count=9, gigs_completed=18),
    dict(name="Simran Kaur",    email="simran@demo.com",  password="demo1234", role="Guitarist", city="Delhi",     genres=["Indie","Folk","Pop"],        experience=ExperienceLevel.professional, bio="Singer-songwriter and indie guitarist. Released two EPs independently.", rating=4.8, rating_count=15, gigs_completed=29),
    dict(name="Karthik Nair",   email="karthik@demo.com", password="demo1234", role="Producer",  city="Hyderabad", genres=["Electronic","Hip-Hop","R&B"],experience=ExperienceLevel.professional, bio="Music producer and beatmaker. 200+ tracks produced for independent artists.", rating=4.9, rating_count=21, gigs_completed=41),
    dict(name="Aditi Joshi",    email="aditi@demo.com",   password="demo1234", role="Vocalist",  city="Pune",      genres=["Folk","Classical","Fusion"],  experience=ExperienceLevel.beginner,      bio="Classically trained vocalist exploring modern fusion. Weekend availability only.", rating=4.3, rating_count=4, gigs_completed=5),
    dict(name="Varun Singh",    email="varun@demo.com",   password="demo1234", role="Guitarist", city="Bangalore", genres=["Metal","Rock","Blues"],      experience=ExperienceLevel.professional, bio="Shred guitarist and composer with 10+ years. Forming original metal project.", rating=4.7, rating_count=16, gigs_completed=38, availability=AvailabilityStatus.busy),
    dict(name="Nisha Gupta",    email="nisha@demo.com",   password="demo1234", role="Violinist", city="Mumbai",    genres=["Classical","Jazz","Fusion"],  experience=ExperienceLevel.professional, bio="Classical-to-jazz violinist. Performed at NCPA Mumbai. Open to fusion projects.", rating=5.0, rating_count=27, gigs_completed=60),
    dict(name="Arjun Rao",      email="arjun@demo.com",   password="demo1234", role="Guitarist", city="Bangalore", genres=["Rock","Blues","Jazz","Funk"], experience=ExperienceLevel.professional, bio="Lead guitarist with 8+ years in rock, blues, and jazz. Available for session work.", rating=4.9, rating_count=22, gigs_completed=47),
]


async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client.get_default_database(), document_models=[User, Gig])

    # Clear existing seed data
    for email in [u["email"] for u in SAMPLE_USERS]:
        existing = await User.find_one(User.email == email)
        if existing:
            await existing.delete()

    await Gig.find_all().delete()

    # Insert users
    created_users = []
    for u in SAMPLE_USERS:
        extra = {}
        if "rating"        in u: extra["rating"]         = u["rating"]
        if "rating_count"  in u: extra["rating_count"]   = u["rating_count"]
        if "gigs_completed"in u: extra["gigs_completed"]  = u["gigs_completed"]
        if "availability"  in u: extra["availability"]   = u["availability"]

        user = User(
            name=u["name"], email=u["email"],
            hashed_password=hash_password(u["password"]),
            role=u["role"], city=u["city"], genres=u["genres"],
            experience=u["experience"], bio=u.get("bio"),
            **extra,
        )
        await user.insert()
        created_users.append(user)
        print(f"  ✓ {user.name} ({user.role}, {user.city})")

    arjun = next(u for u in created_users if u.name == "Arjun Rao")

    # Insert gigs
    gigs_data = [
        dict(title="Drummer & Bassist for Jazz Night at Blue Tokai",      description="Looking for an experienced drummer and bassist for a 2-hour jazz set. Originals + standards. One rehearsal required before the show.",           city="Bangalore", days=14, roles=["Drummer","Bassist"],                    payment=3500, pay_type=PaymentType.per_gig,     poster=arjun),
        dict(title="Wedding Gig — Full Live Band Required",               description="Premium wedding reception in Mumbai. Bollywood classics, Punjabi numbers and western pop. Professional attire mandatory. Sound system provided.",    city="Mumbai",    days=30, roles=["Vocalist","Guitarist","Drummer","Bassist"], payment=8000, pay_type=PaymentType.per_gig,     poster=created_users[1]),
        dict(title="Singer-Songwriter Collaboration",                     description="Looking for a vocalist to co-write and record an indie EP. 4-6 tracks. Revenue share on streaming and live shows. No upfront cost.",               city="Delhi",     days=10, roles=["Vocalist"],                                payment=0,    pay_type=PaymentType.rev_share,   poster=created_users[4]),
        dict(title="Rock Band Needs Lead Guitarist",                      description="We are a 4-piece rock band playing originals. Our previous guitarist relocated. Looking for someone committed for the long term. Regular rehearsals.", city="Bangalore", days=7,  roles=["Guitarist"],                               payment=2500, pay_type=PaymentType.per_gig,     poster=created_users[3]),
        dict(title="Music Producer for Hip-Hop Artist",                   description="Up-and-coming rapper seeking a producer to create 5 tracks. Budget available. Need someone with an ear for trap and lo-fi beats.",                 city="Hyderabad", days=20, roles=["Producer"],                                payment=15000,pay_type=PaymentType.per_project, poster=created_users[5]),
        dict(title="Pianist for Corporate Events — Monthly Retainer",     description="Event management company hiring a pianist for regular corporate dinners. 2–3 events per month. Jazz and lounge style preferred.",                   city="Chennai",   days=5,  roles=["Pianist"],                                 payment=5000, pay_type=PaymentType.per_event,   poster=created_users[2]),
        dict(title="Violinist Wanted for Fusion Ensemble",                description="Forming a Hindustani-jazz fusion group. 5 musicians total. Looking for a classically trained violinist who is open to improvisation.",             city="Mumbai",    days=12, roles=["Violinist"],                               payment=4000, pay_type=PaymentType.per_gig,     poster=created_users[8]),
        dict(title="Backing Vocalist for Studio Recording Sessions",      description="Indie pop artist recording debut album. Need a female/male backing vocalist for harmonies. Studio in Koramangala, Bangalore.",                     city="Bangalore", days=8,  roles=["Vocalist"],                                payment=6000, pay_type=PaymentType.per_project, poster=arjun),
    ]

    for g in gigs_data:
        gig = Gig(
            title=g["title"], description=g["description"], city=g["city"],
            date=datetime.utcnow() + timedelta(days=g["days"]),
            required_roles=g["roles"], payment=g["payment"],
            payment_type=g["pay_type"], status=GigStatus.open,
            created_by=str(g["poster"].id), created_by_name=g["poster"].name,
        )
        await gig.insert()
        print(f"  ✓ Gig: {gig.title[:50]}")

    print(f"\n✅  Seed complete — {len(created_users)} users, {len(gigs_data)} gigs")
    print("\nDemo accounts (all use password: demo1234):")
    for u in SAMPLE_USERS[:4]:
        print(f"  {u['email']}")


if __name__ == "__main__":
    asyncio.run(seed())
